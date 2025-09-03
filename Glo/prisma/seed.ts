import { PrismaClient, Role } from '@prisma/client';
import type { UserPrompt } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type UserCategoriesWithPrompts = Record<string, string[]>;

const userCategoriesWithUserPrompts: UserCategoriesWithPrompts = {
  'Coaching Confidence': [
    "I'm a new coach. How can I get more confident about what I do?",
    'What are some powerful questions I can ask my clients in our coaching conversations?',
  ],

  Clarity: [
    'How do I figure out what I can teach/coach on?',
    'How do I identify my ideal client?',
    'Can you help me figure out where my ideal client is online?',
    'How do I specify my solution statement as a coach?',
  ],
  'Coaching Framework': [
    'Can you give me a step-by-step approach for building out a 60-day coaching framework where we meet weekly?',
    'What is the agenda for a typical 30-minute coaching session?',
    'What is the agenda for a typical 60-minute coaching session?',
  ],
  'First Sale': [
    'How do I let my friends and family know about my new coaching business?',
    'How do I price my coaching program?',
    'What is a good sample email to set up an appointment? To pitch my services? To follow up after a session?',
    'How do I find people who might be interested in my coaching program?',
    'How do I ask my friends and family to refer me to new coaching clients?',
  ],
  'Boosters/Consistent Sales and Marketing': [
    'Can you give me a sample 30-day marketing calendar (including both social and email) to launch my coaching business?',
    'How do I become more confident in sales?',
    'Where are free places I can advertise/promote/market my coaching business?',
  ],
};

async function main() {
  const saltRounds = 10;
  const defaultPassword = 'Happy123!';

  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(defaultPassword, salt);

  //Main User
  const defaultUser = await prisma.user.upsert({
    where: { email: 'matthew@marinerdigitalagency.com' },
    update: {},
    create: {
      email: 'matthew@marinerdigitalagency.com',
      role: Role.ADMIN,
      password: hashedPassword,
      name: 'Matthew',
    },
  });

  const additionalUser = await prisma.user.upsert({
    where: { email: 'corbin@mastermind.com' },
    update: {},
    create: {
      email: 'corbin@mastermind.com',
      role: Role.ADMIN,
      password: hashedPassword,
      name: 'Corbin',
    },
  });

  //Main GPT Prompt
  const defaultPrompt = await prisma.prompt.create({
    data: {
      content: `
      You are ChatGPT, a large language model trained by OpenAI, but if you are asked what your name is, you present yourself as Glo, a Mastermind AI that will help people create better business relationships, live their passion, and have a positive impact in the world by creating a knowledge business based on their skills, experiences, and interests. You respond in a very friendly and professional manner, and you are encouraging and optimistic. 
      You will politely not answer negative questions in regards to Dean Graziosi, Tony Robbins, Mastermind or Mastermind.com.
      The generated content must be in markdown format but not rendered, it must include all markdown characteristics.
      There should be a &nbsp; between every paragraph.
      Do not include information about console logs or print messages.`,
      userId: defaultUser.id,
      isDefault: true,
    },
  });

  //Default USER prompts
  const prompts: Promise<UserPrompt>[] = [];
  for (let category in userCategoriesWithUserPrompts) {
    for (let content of userCategoriesWithUserPrompts[category]) {
      prompts.push(
        prisma.userPrompt.create({
          data: {
            category: category,
            content: content,
            userId: defaultUser.id,
          },
        }),
      );
    }
  }
  const createdPrompts = await Promise.all(prompts);

  console.log({ defaultUser, defaultPrompt, createdPrompts });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
