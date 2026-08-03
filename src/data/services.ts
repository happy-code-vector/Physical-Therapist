// Service / treatment page content for FAAST Physical Therapy.
// Grounded in the live site: condition bodies come from the PainMap (public/app.js
// CONDITIONS), the two insurance pathways from docs/seo/google-business-profile-pack.md.
// Content is non-diagnostic — we describe recognizable symptoms and how the practice
// helps, never invent recovery timelines, cure claims, or statistics.

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface Service {
  slug: string;
  title: string; // card / hub label, e.g. "Lower Back Pain & Sciatica"
  h1: string; // hero H1, e.g. "Lower back pain & sciatica"
  category: 'condition' | 'pathway'; // pathway = No-Fault / Workers' Comp
  metaDescription: string;
  hero: string; // hero subhead
  feelsLike: string[]; // recognizable symptoms (general, non-diagnostic)
  helpsHeading: string;
  helps: string[]; // "how we help" paragraphs
  faqs: ServiceFaq[];
  related: string[]; // slugs of related services
}

const conditionDesc = (cond: string) =>
  `Physical therapy for ${cond} in Floral Park & Carle Place, NY. One-on-one with Dr. Asim Iftikhar, DPT. No referral needed to start - we verify your insurance before your first visit.`;

export const services: Service[] = [
  {
    slug: 'lower-back-pain-sciatica',
    title: 'Lower Back Pain & Sciatica',
    h1: 'Lower back pain & sciatica',
    category: 'condition',
    metaDescription: conditionDesc('lower back pain and sciatica'),
    hero:
      'The most common reason people walk through our door. Disc issues, sciatica, muscle strains, and stiffness that will not quit - assessed hands-on and treated with a clear plan to get you bending, lifting, and sleeping comfortably again.',
    feelsLike: [
      'An ache or stiffness across the lower back',
      'Pain, numbness, or tingling that radiates down one leg',
      'Worse after sitting, bending, or first thing in the morning',
      'A sharp catch when lifting or twisting',
      'Trouble standing up straight',
    ],
    helpsHeading: 'How we help lower back pain',
    helps: [
      'We start with a hands-on assessment to find what is actually driving your back pain - not just where it hurts. Then we build a clear, step-by-step plan: hands-on treatment to calm the pain, mobility work to restore movement, and strengthening so it stops coming back.',
      'Every session is one-on-one with Dr. Iftikhar. You leave with measurable milestones - not an open-ended guess.',
    ],
    faqs: [
      { q: 'How long until my back pain improves?', a: 'It depends on what is causing it, how long you have had it, and your goals. We set realistic milestones at your first visit so you know what to expect.' },
      { q: 'Do I need an MRI or a referral first?', a: 'No. You can start without one. If we find something that needs imaging or a specialist, we will tell you - but most back pain gets better with hands-on care and the right plan.' },
      { q: 'Will the sessions make my back worse?', a: 'Some discomfort can be normal as we restore movement, but we pace everything to your tolerance. You should never feel worse leaving than when you arrived.' },
    ],
    related: ['hip-and-pelvis', 'neck-pain-whiplash', 'post-surgical-rehabilitation'],
  },
  {
    slug: 'neck-pain-whiplash',
    title: 'Neck Pain & Whiplash',
    h1: 'Neck pain & whiplash',
    category: 'condition',
    metaDescription: conditionDesc('neck pain and whiplash'),
    hero:
      'Stiffness, tension headaches, and post-accident whiplash. We restore range of motion and retrain the muscles that keep your head balanced - so it stops stealing your sleep and your focus.',
    feelsLike: [
      'A stiff, sore neck and trouble turning your head',
      'Tension headaches',
      'Pain after a car accident or sudden jolt',
      'Tightness across the tops of your shoulders',
      'Tingling that runs into the arm',
    ],
    helpsHeading: 'How we help neck pain and whiplash',
    helps: [
      'A hands-on assessment finds whether it is muscle tension, joint stiffness, or something from a recent accident. Treatment combines gentle mobilization, targeted strengthening, and posture work to quiet the pain and rebuild the muscles that hold your head up.',
      'One-on-one with Dr. Iftikhar every visit.',
    ],
    faqs: [
      { q: 'I was in a car accident and my neck started hurting days later - is that normal?', a: 'Yes. Whiplash symptoms often appear a day or two after the accident. It is worth getting assessed promptly, and your treatment may be covered under New York No-Fault.' },
      { q: 'How long until I feel better?', a: 'It depends on the cause and how long you have had it; we set milestones at your first visit.' },
      { q: 'Will treatment hurt?', a: 'We work within your tolerance. Neck treatment is gentle - you may feel some stretch or mild soreness, but never sharp pain.' },
    ],
    related: ['auto-injury-no-fault', 'shoulder-rotator-cuff', 'lower-back-pain-sciatica'],
  },
  {
    slug: 'shoulder-rotator-cuff',
    title: 'Shoulder & Rotator Cuff',
    h1: 'Shoulder & rotator cuff',
    category: 'condition',
    metaDescription: conditionDesc('shoulder pain and rotator cuff injuries'),
    hero:
      'Rotator cuff strains, frozen shoulder, and impingement that make reaching overhead a gamble. Hands-on mobilization and a progressive loading plan bring full, pain-free motion back.',
    feelsLike: [
      'Pain reaching overhead or behind your back',
      'Weakness when lifting or reaching',
      'Stiffness, or a catching and pinching sensation',
      'Discomfort lying on that side at night',
      'Pain that built up after repetitive use',
    ],
    helpsHeading: 'How we help shoulder pain',
    helps: [
      'We assess what is irritated - the rotator cuff, the joint capsule, or the mechanics of how you move - then combine hands-on mobilization with a progressive loading plan to restore strength and full range of motion.',
      'One-on-one with Dr. Iftikhar each visit.',
    ],
    faqs: [
      { q: 'How long until my shoulder improves?', a: 'Shoulders can be slow to settle because we use them constantly. We set realistic milestones at your first visit based on what is going on.' },
      { q: 'Will I need surgery?', a: 'Most shoulder problems improve with the right PT plan. If something needs a specialist opinion, we will refer you on - but surgery is rarely the first stop.' },
      { q: 'Can I keep exercising?', a: 'Often yes, with modifications. We will tell you what to avoid and what is safe so you stay active without setting yourself back.' },
    ],
    related: ['elbow-wrist-hand', 'neck-pain-whiplash', 'post-surgical-rehabilitation'],
  },
  {
    slug: 'knee-and-leg',
    title: 'Knee & Leg',
    h1: 'Knee & leg',
    category: 'condition',
    metaDescription: conditionDesc('knee pain and leg injuries'),
    hero:
      'ACL and meniscus rehab, post-op recovery, and arthritis. A structured progression restores strength and confidence - whether you are returning to sport or just to the stairs.',
    feelsLike: [
      'Knee pain walking, on stairs, or after sitting',
      'Swelling, popping, or giving way',
      'Pain after an injury or after surgery',
      'Stiffness and reduced range of motion',
      'An arthritis ache that worsens with activity',
    ],
    helpsHeading: 'How we help knee pain',
    helps: [
      'We figure out whether it is a ligament, a meniscus, arthritis, or a muscle imbalance - then build a structured progression that rebuilds strength, stability, and confidence in the knee.',
      'One-on-one with Dr. Iftikhar every session.',
    ],
    faqs: [
      { q: 'How long until I can run or play sports again?', a: 'It depends on the injury and your goals; we map a return-to-activity timeline at your first visit and progress you as your strength allows.' },
      { q: 'Does strengthening really help arthritis?', a: 'Yes - building the muscles around the knee is one of the most effective ways to reduce arthritis pain and keep you moving.' },
      { q: 'Do I need a referral?', a: 'No, you can start without one. We verify your insurance before your first visit.' },
    ],
    related: ['hip-and-pelvis', 'ankle-and-foot', 'post-surgical-rehabilitation'],
  },
  {
    slug: 'hip-and-pelvis',
    title: 'Hip & Pelvis',
    h1: 'Hip & pelvis',
    category: 'condition',
    metaDescription: conditionDesc('hip pain and pelvis issues'),
    hero:
      'Bursitis, post-surgical recovery, and the gait problems that travel down your leg. We rebuild stability and movement so each step stops sending pain elsewhere.',
    feelsLike: [
      'Pain at the side of the hip or in the groin',
      'Discomfort walking or lying on that side',
      'Stiffness after sitting',
      'Pain that seems to travel down the thigh',
      'A feeling the leg is unsteady',
    ],
    helpsHeading: 'How we help hip pain',
    helps: [
      'We assess whether it is a joint, a bursa, or a muscle and tendon issue, then combine hands-on treatment with a stability and strengthening plan - including the gait and core work that stops hip pain from traveling to the knee and back.',
      'One-on-one with Dr. Iftikhar each visit.',
    ],
    faqs: [
      { q: 'Why does my hip pain sometimes reach my knee or back?', a: 'The hip shares muscles and nerves with the low back and leg, so pain often refers. We assess the whole chain, not just where it hurts.' },
      { q: 'How long until I feel better?', a: 'It depends on the cause; we set milestones at your first visit.' },
      { q: 'Do I need a referral?', a: 'No, you can start without one.' },
    ],
    related: ['lower-back-pain-sciatica', 'knee-and-leg', 'post-surgical-rehabilitation'],
  },
  {
    slug: 'elbow-wrist-hand',
    title: 'Elbow, Wrist & Hand',
    h1: 'Elbow, wrist & hand',
    category: 'condition',
    metaDescription: conditionDesc('elbow, wrist and hand pain'),
    hero:
      'Tennis and golfer’s elbow, carpal tunnel, and sprains. We quiet the inflammation, correct the mechanics that caused it, and rebuild grip and wrist strength.',
    feelsLike: [
      'Elbow pain when gripping (tennis or golfer’s elbow)',
      'Wrist or hand pain, numbness, or tingling',
      'Reduced grip strength',
      'Pain that built up after repetitive tasks',
      'Stiffness or swelling in the wrist or fingers',
    ],
    helpsHeading: 'How we help elbow, wrist and hand pain',
    helps: [
      'We identify what is inflamed and what mechanics are driving it - then calm the irritation with hands-on treatment and rebuild strength and endurance in the forearm, wrist, and hand so it stops recurring.',
      'One-on-one with Dr. Iftikhar each visit.',
    ],
    faqs: [
      { q: 'Will I have to stop the activity that caused it?', a: 'Not usually - we modify how you do it and rebuild the tissue’s tolerance so you can keep going.' },
      { q: 'How long until it improves?', a: 'Tendon issues can take time; we set realistic milestones at your first visit.' },
      { q: 'Do I need a referral?', a: 'No, you can start without one.' },
    ],
    related: ['shoulder-rotator-cuff', 'auto-injury-no-fault', 'workers-compensation'],
  },
  {
    slug: 'ankle-and-foot',
    title: 'Ankle & Foot',
    h1: 'Ankle & foot',
    category: 'condition',
    metaDescription: conditionDesc('ankle sprains and foot pain'),
    hero:
      'Sprains, plantar fasciitis, and Achilles trouble. We rebuild balance and the support chain above the ankle so it stops rolling and stops hurting with every step.',
    feelsLike: [
      'Ankle pain or instability after a sprain',
      'Heel or arch pain first thing in the morning',
      'Achilles pain or tightness',
      'Swelling and trouble bearing weight',
      'A feeling the ankle will "roll"',
    ],
    helpsHeading: 'How we help ankle and foot pain',
    helps: [
      'We assess the ankle, the foot, and everything above it - balance, calf strength, and how you walk - then rebuild the support chain so the ankle stops rolling and the foot stops hurting with every step.',
      'One-on-one with Dr. Iftikhar each visit.',
    ],
    faqs: [
      { q: 'Why does my ankle keep spraining?', a: 'Often it is poor balance and strength in the chain above the ankle. We rebuild both so it stops recurring.' },
      { q: 'How long until I feel better?', a: 'It depends on whether it is a fresh sprain or a long-standing issue; we set milestones at your first visit.' },
      { q: 'Do I need a referral?', a: 'No, you can start without one.' },
    ],
    related: ['knee-and-leg', 'hip-and-pelvis', 'workers-compensation'],
  },
  {
    slug: 'post-surgical-rehabilitation',
    title: 'Post-Surgical Rehabilitation',
    h1: 'Post-surgical rehabilitation',
    category: 'condition',
    metaDescription: conditionDesc('post-surgical rehabilitation'),
    hero:
      'Guided recovery after orthopedic surgery - knee, shoulder, back, and more. We rebuild strength, movement, and confidence so you return to the life you had before surgery, safely.',
    feelsLike: [
      'Recovering from orthopedic surgery',
      'Stiffness, weakness, or guarded movement',
      'Unsure how hard to push without risking the repair',
      'Wanting to return to work, sport, or daily life',
      'Needing a structured plan, not guesswork',
    ],
    helpsHeading: 'How we help after surgery',
    helps: [
      'We coordinate with your surgeon’s protocol, then build a structured progression that restores your range of motion and strength at the right pace - pushing enough to progress, never enough to risk the repair.',
      'One-on-one with Dr. Iftikhar each visit.',
    ],
    faqs: [
      { q: 'Do you follow my surgeon’s protocol?', a: 'Yes. We work from your surgeon’s guidelines and communicate with their office when needed.' },
      { q: 'How soon after surgery can I start?', a: 'Usually as soon as you are cleared - often within days to weeks. Bring your operative report or protocol if you have one.' },
      { q: 'Do I need a referral?', a: 'Often your surgeon will have referred you; if not, you can still start - we verify your coverage first.' },
    ],
    related: ['knee-and-leg', 'shoulder-rotator-cuff', 'lower-back-pain-sciatica'],
  },
  {
    slug: 'auto-injury-no-fault',
    title: 'Auto Injury / No-Fault',
    h1: 'Auto injury & No-Fault physical therapy',
    category: 'pathway',
    metaDescription:
      'Physical therapy after a car accident, covered under New York No-Fault, in Floral Park & Carle Place, NY. Bring your claim number - we handle the rest. No referral needed to start.',
    hero:
      'Hurt in a car accident? New York No-Fault covers your physical therapy regardless of who was at fault. Bring your claim number and we will handle the details - so you can focus on healing.',
    feelsLike: [
      'Neck or back pain after a car accident, even a minor one',
      'Whiplash, headaches, or stiffness that appeared days later',
      'Not sure how New York No-Fault coverage works',
      'Need to start treatment promptly for your claim',
      'Wanting the billing and paperwork handled for you',
    ],
    helpsHeading: 'How we handle No-Fault',
    helps: [
      'We start treatment promptly - which matters for both your recovery and your claim - and we handle the No-Fault billing and paperwork directly with the insurer. You bring your claim number and the accident details; we do the rest.',
      'One-on-one with Dr. Iftikhar every visit.',
    ],
    faqs: [
      { q: 'What is New York No-Fault?', a: 'It is coverage that pays for medical care after a car accident regardless of who was at fault. Your physical therapy is typically covered at no out-of-pocket cost to you.' },
      { q: 'What do I need to bring?', a: 'Your No-Fault claim number, the claim adjuster’s contact information, and the date of the accident. We will take it from there.' },
      { q: 'How soon should I start?', a: 'As soon as possible. Prompt treatment helps your recovery and supports your claim. If your pain started days after the accident, that is common - come in anyway.' },
    ],
    related: ['neck-pain-whiplash', 'lower-back-pain-sciatica', 'workers-compensation'],
  },
  {
    slug: 'workers-compensation',
    title: "Workers' Compensation",
    h1: 'Workers’ compensation physical therapy',
    category: 'pathway',
    metaDescription:
      "Physical therapy after a work injury, covered by Workers' Compensation, in Floral Park & Carle Place, NY. We manage the authorizations and paperwork so you can focus on healing. No referral needed to start.",
    hero:
      "Hurt on the job? Workers' Compensation covers your physical therapy. We manage the authorizations and paperwork so you can focus on healing and getting back to work safely.",
    feelsLike: [
      'Pain or injury from a work-related incident',
      'Recovering and wanting to return to work safely',
      'Confused by the workers’ comp authorization process',
      'Needing PT that coordinates with your case adjuster and doctor',
      'Wanting the paperwork and approvals managed',
    ],
    helpsHeading: 'How we handle Workers’ Comp',
    helps: [
      'We coordinate with your authorized treating doctor, your case adjuster, and your employer to get physical therapy approved and keep your recovery on track. We handle the paperwork and authorizations; you focus on healing.',
      'One-on-one with Dr. Iftikhar every visit.',
    ],
    faqs: [
      { q: 'Is my work-injury PT covered?', a: 'Yes - Workers’ Compensation covers treatment for an accepted work-related injury. We will confirm your claim details at intake.' },
      { q: 'What do I need to bring?', a: 'Your claim number (or the C-3 form), your authorized doctor’s information, and the adjuster’s contact details if you have them.' },
      { q: 'Do you coordinate with my doctor and adjuster?', a: 'Yes. We send progress reports and work with everyone involved to keep your claim and your recovery moving.' },
    ],
    related: ['lower-back-pain-sciatica', 'shoulder-rotator-cuff', 'auto-injury-no-fault'],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
