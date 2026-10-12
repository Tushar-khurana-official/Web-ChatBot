import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDatabaseDefaults,
  getBusinessSettings,
  updateBusinessSettings,
  getServices,
  updateService,
  checkSlotAvailability,
  createLead,
  getLeads,
  updateLeadStatus,
  createBookingSafe,
  getBookings,
  updateBookingStatus,
} from './src/server/db';
import { processChatConversation } from './src/server/gemini';
import {
  getWhatsAppConfigStatus,
  verifyMetaSignature,
  handleWhatsAppWebhookPayload,
  sendWhatsAppMessage,
} from './src/server/whatsapp';
import { runCompleteTestSuite } from './src/server/testSuite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Capture raw body for Meta signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Bootstrap database records
initDatabaseDefaults().catch((err) => {
  console.warn('Initial db setup:', err.message);
});

// --- API ROUTES ---

// 1. Business Settings
app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await getBusinessSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/settings', async (req: Request, res: Response) => {
  try {
    const updated = await updateBusinessSettings(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 2. Services Catalog
app.get('/api/services', async (_req: Request, res: Response) => {
  try {
    const services = await getServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/services/:id', async (req: Request, res: Response) => {
  try {
    const updated = await updateService(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 3. Appointment Slot Availability
app.get('/api/slots', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const duration = parseInt((req.query.duration as string) || '60', 10);
    const slots = await checkSlotAvailability(date, duration);
    res.json({ date, slots });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 4. Gemini AI Customer Chat Assistant
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, currentMessage, channel } = req.body;
    if (!currentMessage || typeof currentMessage !== 'string') {
      return res.status(400).json({ error: 'currentMessage is required' });
    }

    const result = await processChatConversation({
      messages: messages || [],
      currentMessage,
      channel: channel || 'website',
    });

    res.json(result);
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// 5. Leads Capture & Management
app.post('/api/leads', async (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, vehicleMakeModel, vehicleCategory, serviceId, serviceName, primaryConcern, preferredDate, budget, notes, source, consentGiven } = req.body;

    if (!customerName || !customerPhone) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    if (!consentGiven) {
      return res.status(400).json({ error: 'Customer consent is required to save follow-up details' });
    }

    const lead = await createLead({
      customerName,
      customerPhone,
      vehicleMakeModel,
      vehicleCategory,
      serviceId,
      serviceName,
      primaryConcern,
      preferredDate,
      budget,
      notes,
      source: source || 'website',
      status: 'New',
      consentGiven: true,
    });

    // Notify staff via simulated/live WhatsApp
    sendWhatsAppMessage(
      lead.customerPhone,
      `Hello ${lead.customerName}! Thank you for your inquiry with Apex Auto Detailers regarding ${lead.serviceName || 'detailing'}. Our specialist will contact you shortly!`
    ).catch(() => {});

    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/leads', async (_req: Request, res: Response) => {
  try {
    const leads = await getLeads();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/leads/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, followUpNotes } = req.body;
    const updated = await updateLeadStatus(req.params.id, status, followUpNotes);
    if (!updated) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 6. Bookings End-to-End System
app.post('/api/bookings', async (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, customerEmail, serviceId, serviceName, vehicleMakeModel, vehicleCategory, appointmentDate, appointmentSlot, durationMinutes, estimatedPrice, notes, bookingSource } = req.body;

    if (!customerName || !customerPhone || !serviceId || !appointmentDate || !appointmentSlot) {
      return res.status(400).json({ error: 'Missing required booking details (name, phone, service, date, slot)' });
    }

    const result = await createBookingSafe({
      customerName,
      customerPhone,
      customerEmail,
      serviceId,
      serviceName: serviceName || 'Detailing Service',
      vehicleMakeModel: vehicleMakeModel || 'Vehicle',
      vehicleCategory: vehicleCategory || 'Sedan',
      appointmentDate,
      appointmentSlot,
      durationMinutes: durationMinutes || 60,
      estimatedPrice: estimatedPrice || 0,
      status: 'Confirmed',
      notes,
      bookingSource: bookingSource || 'website',
    });

    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }

    // Send confirmation message
    if (result.booking) {
      const confirmationMsg = `🚗 Apex Auto Detailers: Booking Confirmed! Ref: ${result.booking.bookingReference} for ${result.booking.serviceName} on ${result.booking.appointmentDate} at ${result.booking.appointmentSlot}. Location: Koramangala, Bengaluru.`;
      sendWhatsAppMessage(result.booking.customerPhone, confirmationMsg).catch(() => {});
    }

    res.status(201).json(result.booking);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/bookings', async (_req: Request, res: Response) => {
  try {
    const bookings = await getBookings();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/bookings/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    const updated = await updateBookingStatus(req.params.id, status, notes);
    if (!updated) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 7. WhatsApp Cloud API Webhooks & Outbound Messaging
app.get('/api/whatsapp/status', (_req: Request, res: Response) => {
  const status = getWhatsAppConfigStatus();
  res.json({
    ...status,
    webhookVerificationUrl: `${process.env.APP_URL || ''}/api/whatsapp/webhook`,
    verifyTokenExpected: process.env.WHATSAPP_VERIFY_TOKEN || 'apex_verify_token_2026',
  });
});

app.get('/api/whatsapp/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'apex_verify_token_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[WhatsApp Webhook] Challenge verified successfully');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post('/api/whatsapp/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-hub-signature-256'] as string | undefined;
  const rawBody = (req as any).rawBody || JSON.stringify(req.body);

  if (!verifyMetaSignature(rawBody, signature)) {
    console.warn('[WhatsApp Webhook] Signature verification failed');
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  const outcome = await handleWhatsAppWebhookPayload(req.body);
  res.status(200).json(outcome);
});

app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: 'to and message are required' });
    }
    const result = await sendWhatsAppMessage(to, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/whatsapp/simulate', async (req: Request, res: Response) => {
  try {
    const { fromPhone, messageText } = req.body;
    const dummyPayload = {
      entry: [
        {
          changes: [
            {
              value: {
                messages: [
                  {
                    id: 'sim_' + Date.now(),
                    from: fromPhone || '919876543210',
                    type: 'text',
                    text: { body: messageText || 'Hello, I want ceramic coating quote' },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const outcome = await handleWhatsAppWebhookPayload(dummyPayload);
    res.json(outcome);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 8. Automated Test Suite Runner (18 Verification Scenarios)
app.post('/api/tests/run', async (_req: Request, res: Response) => {
  try {
    const report = await runCompleteTestSuite();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Vite & Static File Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Apex Auto Detailers Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
