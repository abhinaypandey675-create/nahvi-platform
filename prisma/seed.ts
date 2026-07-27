@'
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // ---------- Admin account ----------
  // Change this password immediately after first login.
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || "abhinaypandey675@gmail.com";
  const adminPassword = "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Abhinay",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`Admin account ready: ${adminEmail} / ${adminPassword} (change this password after first login)`);

  // ---------- Apps, ported from the original static site ----------
  const apps = [
    {
      slug: "resumeai",
      name: "ResumeAI",
      tagline: "Autonomous job-application platform",
      description:
        "Autonomous job-application platform: resume generation, ATS optimization, auto-apply across LinkedIn/Indeed/Naukri, interview prep, and application tracking — run by a memory-aware AI router across GPT, Gemini, DeepSeek and NVIDIA models.",
      problem:
        "Job seekers spend hours tailoring resumes and manually applying to each posting, with no visibility into what's actually working.",
      solution:
        "A memory-aware AI router coordinates resume generation, ATS scoring, auto-apply, and analytics into one pipeline — from job discovery to interview prep.",
      status: "BUILDING" as const,
      category: "Career AI",
      tags: ["Auto-apply", "ATS scoring", "Connector framework", "Analytics"],
      technologies: ["React", "Node.js", "GPT-4", "Gemini", "DeepSeek", "NVIDIA NIM"],
      pricing: "Custom quote",
      featured: true,
      published: true,
      sortOrder: 0,
    },
    {
      slug: "voice-agent-suite",
      name: "Voice Agent Suite",
      tagline: "Telephony-native AI agents",
      description:
        "Telephony-native AI agents built on Twilio — inbound/outbound call handling, natural conversation flow, and structured handoff to your CRM or booking system.",
      status: "LIVE" as const,
      category: "Voice AI",
      tags: ["Twilio", "Real-time voice", "CRM handoff"],
      technologies: ["Twilio", "Node.js", "WebRTC"],
      pricing: "Custom quote",
      featured: false,
      published: true,
      sortOrder: 1,
    },
    {
      slug: "llm-agent-framework",
      name: "LLM Agent Framework",
      tagline: "Full-stack agent infrastructure",
      description:
        "Full-stack agent infrastructure — router, memory engine, tool connectors and workflow orchestration — for teams who want a working agent stack instead of another prototype.",
      status: "LIVE" as const,
      category: "Infrastructure",
      tags: ["Multi-model routing", "Memory engine", "Tool use"],
      technologies: ["TypeScript", "Node.js", "Redis"],
      pricing: "Custom quote",
      featured: false,
      published: true,
      sortOrder: 2,
    },
  ];

  for (const app of apps) {
    await prisma.app.upsert({ where: { slug: app.slug }, update: app, create: app });
  }

  console.log(`Seeded ${apps.length} apps.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
'@ | Set-Content -Path prisma\seed.ts -Encoding utf8