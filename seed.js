require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

const ideas = [
  {
    title: "AI-Powered Mental Health Companion",
    shortDescription: "A 24/7 conversational AI that provides emotional support, mood tracking, and personalized coping strategies for people with anxiety and depression.",
    detailedDescription: "Mental health care is inaccessible for millions due to cost and availability. This platform offers an empathetic AI chatbot trained on CBT (Cognitive Behavioral Therapy) frameworks. Users can log moods, identify emotional triggers, and receive evidence-based exercises. It bridges the gap until professional help is available.",
    category: "Health",
    tags: ["mental health", "AI", "wellness", "chatbot"],
    imageURL: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop",
    estimatedBudget: "$80,000",
    targetAudience: "Adults aged 18–45 struggling with anxiety, depression, or daily stress",
    problemStatement: "Over 1 billion people worldwide suffer from mental health disorders, yet 75% never receive treatment due to cost, stigma, and lack of access to therapists.",
    proposedSolution: "An AI companion app using NLP and CBT techniques to provide real-time emotional support, mood journaling, breathing exercises, and escalation to human therapists when needed.",
    authorEmail: "seed@ideavault.dev",
    authorName: "IdeaVault Team",
    likes: ["alice@example.com","bob@example.com","carol@example.com","dan@example.com","eve@example.com","frank@example.com","gina@example.com","hank@example.com"],
    commentCount: 14,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    title: "HyperLocal Food Rescue Network",
    shortDescription: "A mobile platform connecting restaurants and grocery stores with surplus food to nearby shelters, food banks, and low-income families in real time.",
    detailedDescription: "Every day, restaurants and supermarkets discard tons of perfectly edible food while millions go hungry. This app creates a logistics network where food businesses can post available surplus, and verified NGOs or individuals can claim it within a 2-hour window. Gamification encourages consistent donations.",
    category: "Tech",
    tags: ["food waste", "sustainability", "social impact", "logistics"],
    imageURL: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop",
    estimatedBudget: "$45,000",
    targetAudience: "Restaurants, grocery stores, food banks, and low-income families in urban areas",
    problemStatement: "Globally, 1/3 of all food produced is wasted while 820 million people are undernourished. Surplus redistribution is inefficient due to lack of real-time coordination.",
    proposedSolution: "A two-sided marketplace app with real-time notifications, route optimization for pickups, and a tax-deduction tracker for donating businesses.",
    authorEmail: "seed@ideavault.dev",
    authorName: "IdeaVault Team",
    commentCount: 22,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    title: "SkillBridge — Peer-to-Peer Micro-Learning",
    shortDescription: "A platform where professionals teach 30-minute live skill sessions in exchange for credits they can spend learning from others — no money needed.",
    detailedDescription: "Traditional online courses are long, passive, and expensive. SkillBridge flips the model: users list a skill they can teach (Excel, Figma, public speaking, cooking) and earn credits by hosting live 30-min sessions. Credits are spent attending sessions from others. Community ratings ensure quality.",
    category: "Education",
    tags: ["e-learning", "peer-to-peer", "skills", "community"],
    imageURL: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
    estimatedBudget: "$30,000",
    targetAudience: "Professionals, students, and lifelong learners aged 20–50 who want affordable upskilling",
    problemStatement: "Quality skill education is expensive and inaccessible. Platforms like Udemy offer passive video learning but lack real-time interaction and community accountability.",
    proposedSolution: "A credit-based barter system for live micro-lessons. Users become both teachers and learners, creating a self-sustaining knowledge economy with zero cash transactions.",
    authorEmail: "seed@ideavault.dev",
    authorName: "IdeaVault Team",
    commentCount: 31,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: "GreenCommute — Carbon-Neutral Ride Matching",
    shortDescription: "An AI-powered carpooling app that matches office commuters on similar routes, reducing carbon emissions while saving users up to 60% on transport costs.",
    detailedDescription: "Urban traffic congestion wastes billions of hours and pumps millions of tons of CO₂ annually. GreenCommute uses ML to predict commute patterns, match compatible riders from nearby locations, and optimize routes dynamically. A carbon credit system rewards consistent users and integrates with employer wellness programs.",
    category: "Tech",
    tags: ["sustainability", "carpooling", "climate", "commute"],
    imageURL: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    estimatedBudget: "$120,000",
    targetAudience: "Office workers in metro areas commuting 5+ days a week, aged 25–45",
    problemStatement: "Transportation accounts for 27% of global CO₂ emissions. Single-occupancy vehicles are the dominant commute mode despite the majority of commuters sharing overlapping routes.",
    proposedSolution: "ML-based ride matching with calendar integration, real-time route optimization, employer partnership portals, and a gamified carbon savings leaderboard.",
    authorEmail: "seed@ideavault.dev",
    authorName: "IdeaVault Team",
    commentCount: 19,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    title: "MedVault — Personal Health Records on Blockchain",
    shortDescription: "A patient-owned, blockchain-secured health records platform that lets individuals share verified medical history with any doctor worldwide instantly.",
    detailedDescription: "Medical records are fragmented across hospitals and clinics, leading to redundant tests, misdiagnoses, and poor continuity of care. MedVault stores encrypted health records on a private blockchain. Patients control access with a QR code or biometric key. Doctors get a complete history in seconds.",
    category: "Health",
    tags: ["blockchain", "healthtech", "medical records", "privacy"],
    imageURL: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop",
    estimatedBudget: "$200,000",
    targetAudience: "Patients with chronic conditions, frequent travelers, and healthcare providers globally",
    problemStatement: "Healthcare systems globally are siloed. Patients see an average of 19 different doctors in their lifetime and critical medical history is often unavailable in emergencies.",
    proposedSolution: "A blockchain-based personal health record wallet. Patients own their data, grant time-limited access to providers, and get AI-powered health summaries and drug interaction alerts.",
    authorEmail: "seed@ideavault.dev",
    authorName: "IdeaVault Team",
    commentCount: 27,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    title: "FinLit — Financial Literacy for Gen Z",
    shortDescription: "A gamified mobile app teaching teenagers budgeting, investing, and credit management through real-world simulations and bite-sized daily challenges.",
    detailedDescription: "Financial illiteracy costs young people decades of wealth-building potential. FinLit uses game mechanics — XP points, streaks, virtual portfolios — to teach real financial concepts. Users simulate stock investing, practice budget allocation, and learn about compound interest through interactive stories. Parental dashboard included.",
    category: "Finance",
    tags: ["fintech", "education", "gen-z", "gamification"],
    imageURL: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=800&auto=format&fit=crop",
    estimatedBudget: "$55,000",
    targetAudience: "Teenagers aged 13–22 and their parents who want to build financial habits early",
    problemStatement: "Only 24% of millennials demonstrate basic financial literacy. Schools rarely teach practical money management, leaving young adults vulnerable to debt and poor financial decisions.",
    proposedSolution: "A Duolingo-style app for finance with daily missions, virtual investment simulators, peer challenges, and a parent-child mode for shared financial goal-setting.",
    authorEmail: "seed@ideavault.dev",
    authorName: "IdeaVault Team",
    commentCount: 35,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: "RemoteHire AI — Bias-Free Recruitment Platform",
    shortDescription: "An AI hiring platform that evaluates candidates on skills and performance data alone, removing names, photos, and universities to eliminate unconscious bias.",
    detailedDescription: "Studies show resumes with 'white-sounding' names get 50% more callbacks than identical resumes with 'ethnic' names. RemoteHire anonymizes all applications, uses AI skill assessments and work-sample tasks to rank candidates objectively. Companies see bias metrics in real time.",
    category: "AI",
    tags: ["HR tech", "diversity", "AI hiring", "bias-free"],
    imageURL: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop",
    estimatedBudget: "$150,000",
    targetAudience: "HR teams and hiring managers at mid-to-large companies committed to DEI hiring practices",
    problemStatement: "Unconscious bias in recruitment leads to homogeneous teams, missed talent, and legal risk. Traditional ATS systems perpetuate bias by filtering on pedigree rather than potential.",
    proposedSolution: "Blind recruitment pipeline with AI skill tests, anonymized video interviews, structured scoring rubrics, and a diversity analytics dashboard showing bias patterns over time.",
    authorEmail: "seed@ideavault.dev",
    authorName: "IdeaVault Team",
    commentCount: 41,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: "CropSense — Smart Farming for Small Farmers",
    shortDescription: "An affordable IoT + AI platform that gives smallholder farmers real-time soil, weather, and crop health insights via SMS — no smartphone required.",
    detailedDescription: "800 million smallholder farmers produce 70% of the world's food yet lack access to precision agriculture tools. CropSense uses low-cost soil sensors and satellite imagery to deliver crop recommendations via SMS. Farmers learn when to irrigate, fertilize, and harvest to maximize yield without expensive equipment.",
    category: "AI",
    tags: ["agritech", "IoT", "AI", "sustainability", "developing world"],
    imageURL: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop",
    estimatedBudget: "$95,000",
    targetAudience: "Smallholder farmers in developing countries across Africa, South Asia, and Southeast Asia",
    problemStatement: "Small farmers face unpredictable yields due to climate change, soil degradation, and lack of agronomic advice. They lose 30-40% of potential yield annually from preventable causes.",
    proposedSolution: "Ruggedized soil sensors with LoRa connectivity, satellite crop monitoring, and an AI model that delivers personalized farm advice via SMS in local languages.",
    authorEmail: "seed@ideavault.dev",
    authorName: "IdeaVault Team",
    commentCount: 18,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    title: "SleepLab — Science-Backed Sleep Optimization",
    shortDescription: "A wearable + app ecosystem that analyzes sleep architecture, identifies disruptions, and generates a personalized sleep improvement plan backed by neuroscience.",
    detailedDescription: "Poor sleep affects 1 in 3 adults and is linked to obesity, heart disease, and reduced productivity. SleepLab uses a comfortable headband to track brainwave patterns (EEG-lite), heart rate, and movement. The AI correlates your habits — screen time, caffeine, exercise timing — with sleep quality and prescribes changes.",
    category: "Health",
    tags: ["wearable", "sleep", "neuroscience", "wellness"],
    imageURL: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop",
    estimatedBudget: "$300,000",
    targetAudience: "Working professionals aged 28–55 suffering from chronic sleep issues or wanting to optimize performance",
    problemStatement: "Sleep deprivation costs the US economy $411 billion annually. Existing solutions (sleep apps) are inaccurate without hardware, while clinical sleep studies cost $3,000+ and are inaccessible.",
    proposedSolution: "A $99 sleep headband with EEG sensors paired with an AI app. Tracks sleep stages, provides root-cause analysis of disruptions, and gives a 30-day evidence-based improvement protocol.",
    authorEmail: "seed@ideavault.dev",
    authorName: "IdeaVault Team",
    commentCount: 29,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  },
  {
    title: "LegalEase — AI Contract Simplifier for Freelancers",
    shortDescription: "An AI tool that reads complex legal contracts, flags risky clauses in plain English, and generates fair counter-proposals — built specifically for independent workers.",
    detailedDescription: "Freelancers sign dozens of contracts per year but can't afford a lawyer for each one. LegalEase uses a fine-tuned LLM to scan contracts, highlight problematic clauses (IP ownership, non-competes, payment terms), explain them in plain English, and suggest negotiation points. One-click template contracts included.",
    category: "AI",
    tags: ["legaltech", "AI", "freelancers", "contracts"],
    imageURL: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop",
    estimatedBudget: "$60,000",
    targetAudience: "Freelancers, independent contractors, and solopreneurs who regularly sign client contracts",
    problemStatement: "73 million freelancers in the US alone regularly sign contracts they don't fully understand. Predatory clauses cost them lost IP rights, unpaid invoices, and legal disputes.",
    proposedSolution: "Upload any contract and get a risk score, clause-by-clause explanation, and AI-generated redlines within 60 seconds. Subscription model at $12/month with a free tier for 3 contracts.",
    authorEmail: "seed@ideavault.dev",
    authorName: "IdeaVault Team",
    commentCount: 47,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

async function seed() {
  try {
    await client.connect();
    const db = client.db("ideaVaultDB");
    const ideasCol = db.collection("ideas");

    const existing = await ideasCol.countDocuments({ authorEmail: "seed@ideavault.dev" });
    if (existing > 0) {
      console.log(`Already seeded (${existing} ideas found). Skipping.`);
      return;
    }

    const result = await ideasCol.insertMany(ideas);
    console.log(`✅ Seeded ${result.insertedCount} ideas successfully!`);
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await client.close();
  }
}

seed();
