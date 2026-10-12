import crypto from 'crypto';
import { processChatConversation } from './gemini';

// Set of processed message IDs to prevent webhook retry duplicate processing
const processedMessageIds = new Set<string>();

export interface WhatsAppConfigStatus {
  configured: boolean;
  missingVariables: string[];
  phoneNumberIdConfigured: boolean;
  accessTokenConfigured: boolean;
  verifyTokenConfigured: boolean;
  appSecretConfigured: boolean;
}

export function getWhatsAppConfigStatus(): WhatsAppConfigStatus {
  const missing: string[] = [];
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID) missing.push('WHATSAPP_PHONE_NUMBER_ID');
  if (!process.env.WHATSAPP_ACCESS_TOKEN) missing.push('WHATSAPP_ACCESS_TOKEN');
  if (!process.env.WHATSAPP_VERIFY_TOKEN) missing.push('WHATSAPP_VERIFY_TOKEN');
  if (!process.env.META_APP_SECRET) missing.push('META_APP_SECRET');

  return {
    configured: missing.length === 0,
    missingVariables: missing,
    phoneNumberIdConfigured: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
    accessTokenConfigured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN),
    verifyTokenConfigured: Boolean(process.env.WHATSAPP_VERIFY_TOKEN),
    appSecretConfigured: Boolean(process.env.META_APP_SECRET),
  };
}

/**
 * Verify Meta Webhook SHA256 signature
 */
export function verifyMetaSignature(rawBody: string | Buffer, signatureHeader: string | undefined): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret) {
    // If secret not configured in dev, pass signature check in development simulation
    return true;
  }
  if (!signatureHeader) return false;

  const parts = signatureHeader.split('sha256=');
  if (parts.length !== 2) return false;
  const signature = parts[1];

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const expectedSignature = hmac.digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Send an outbound message via Meta WhatsApp Business Cloud API
 */
export async function sendWhatsAppMessage(to: string, messageText: string): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const status = getWhatsAppConfigStatus();

  // If live credentials are not present, log in simulated development mode
  if (!status.configured) {
    console.log(`[WhatsApp Simulated Mode] To: ${to} | Body: ${messageText.substring(0, 100)}...`);
    return {
      success: true,
      simulated: true,
      error: 'WhatsApp API credentials not configured in environment. Message simulated in development mode.',
    };
  }

  const endpoint = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/[^0-9]/g, ''),
        type: 'text',
        text: { body: messageText },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('WhatsApp API dispatch failed:', data);
      return { success: false, error: data?.error?.message || 'Meta Cloud API error' };
    }
    return { success: true };
  } catch (err) {
    console.error('WhatsApp dispatch network exception:', err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Handle incoming WhatsApp Webhook payload
 */
export async function handleWhatsAppWebhookPayload(payload: any): Promise<{ handled: boolean; status: string }> {
  try {
    const entry = payload?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return { handled: true, status: 'No message content in webhook event' };
    }

    const message = messages[0];
    const messageId = message.id;

    // Deduplication check
    if (processedMessageIds.has(messageId)) {
      return { handled: true, status: 'Duplicate webhook event discarded' };
    }
    processedMessageIds.add(messageId);
    if (processedMessageIds.size > 2000) {
      processedMessageIds.clear();
    }

    const fromPhone = message.from;
    let userText = '';

    if (message.type === 'text') {
      userText = message.text?.body || '';
    } else if (message.type === 'interactive') {
      userText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
    }

    if (!userText) {
      return { handled: true, status: 'Non-text message type ignored' };
    }

    // Process through Gemini Chatbot
    const chatResult = await processChatConversation({
      messages: [],
      currentMessage: userText,
      channel: 'whatsapp',
    });

    // Send response via WhatsApp Cloud API
    await sendWhatsAppMessage(fromPhone, chatResult.replyText);

    return { handled: true, status: 'Replied successfully to ' + fromPhone };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return { handled: false, status: (error as Error).message };
  }
}
