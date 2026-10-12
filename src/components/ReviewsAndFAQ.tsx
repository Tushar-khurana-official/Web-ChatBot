import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp, MessageCircleQuestion } from 'lucide-react';

export const ReviewsAndFAQ: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const reviews = [
    {
      name: 'Rohan Mehra',
      car: 'BMW M340i xDrive (Tanzanite Blue)',
      treatment: 'Apex Matrix 10H Graphene Coating',
      rating: 5,
      date: '2 weeks ago',
      comment:
        'The gloss on the Tanzanite Blue is supernatural. Zero swirl marks left. Water literally shoots off the bonnet during monsoon showers in Koramangala. Exceptional clean room facility.',
    },
    {
      name: 'Deepak Varma',
      car: 'Land Rover Defender 110',
      treatment: 'Full Body Self-Healing TPU PPF',
      rating: 5,
      date: '1 month ago',
      comment:
        'Took the Defender to Coorg off-roading right after installation. Gravel and thorny branches did not leave a single permanent scratch—self-healed in the sun the next afternoon. Worth every rupee.',
    },
    {
      name: 'Sneha Kulkarni',
      car: 'Hyundai Creta SX (Knight Edition)',
      treatment: 'Signature Wash + Interior Sanitization Spa',
      rating: 5,
      date: '3 weeks ago',
      comment:
        'My beige leather seats had indigo dye stains from denim jeans that other car cleaners could not remove. The hot steam extraction brought them back to factory brand-new condition without chemical smells.',
    },
  ];

  const faqs = [
    {
      question: 'How long does a Ceramic or Graphene Coating application take?',
      answer:
        'A proper nano-coating job takes between 24 to 48 hours. Most of this time is spent in microscopic preparation: decontaminating the surface, multi-stage paint correction polishing, and overnight infrared thermal curing in our dust-controlled bays.',
    },
    {
      question: 'What is the real difference between 9H Ceramic and 10H Graphene Coating?',
      answer:
        'While 9H ceramic provides incredible gloss and hardness, traditional ceramic coatings attract heat and can develop water spots in hard-water climates. Graphene incorporates a honeycomb lattice of carbon that dissipates surface heat by up to 10°C, lowering water spotting by 90% and offering higher chemical resistance (pH 2 - pH 12).',
    },
    {
      question: 'Does Paint Protection Film (PPF) truly self-heal?',
      answer:
        'Yes. Our optical TPU PPF has an elastomeric polyurethane top-coat. When stone chips, light scratches, or swirl marks occur, heat from engine warmth, hot water, or direct sunlight causes the polymers to relax and reform to their original smooth state automatically.',
    },
    {
      question: 'What are the required aftercare instructions after detailing?',
      answer:
        'For ceramic and graphene, avoid washing with soap or letting hard tap water sit on the vehicle for the first 7 days while the coating completes full molecular bonding. Afterwards, always use a two-bucket wash with pH-neutral automotive shampoo and plush microfibers. Avoid roadside dusting brushes.',
    },
    {
      question: 'What is your appointment booking and cancellation policy?',
      answer:
        'We operate on limited clean-room bay capacities to ensure undivided attention to each car. We offer 100% free cancellation or rescheduling if notified up to 24 hours prior to your scheduled slot.',
    },
  ];

  return (
    <section id="reviews" className="py-20 bg-zinc-950 relative border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Reviews Section */}
        <div>
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-semibold">
              Verified Studio Reviews
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
              Loved by Automotive Enthusiasts
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <div key={i} className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs text-zinc-500 ml-2 font-mono">{r.date}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">"{r.comment}"</p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/80">
                  <div className="font-bold text-sm text-white">{r.name}</div>
                  <div className="text-[11px] text-amber-400/90 font-mono mt-0.5">{r.car}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{r.treatment}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 pt-16 border-t border-zinc-800/80 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-2">
              <MessageCircleQuestion className="w-4 h-4" /> Frequently Asked Questions
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Detailing & Paint Protection Knowledge
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-zinc-900/50 border border-zinc-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0 ml-4" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 border-t border-zinc-800/60 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
