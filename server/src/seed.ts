import bcrypt from 'bcryptjs';
import {
  UserRepo,
  PostRepo,
  ChatRequestRepo,
  ConversationRepo,
  MessageRepo,
  ReportRepo,
} from './services/dataService.js';

export async function seedDatabase(force = false) {
  try {
    const existingUsersCount = await UserRepo.count();
    if (existingUsersCount > 0 && !force) {
      console.log('ℹ️ [Seed] Database already contains records. Skipping initial seeding.');
      return;
    }

    console.log('🌱 [Seed] Populating realistic compassionate seed data...');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Companion@2026!', salt);

    // 1. Admin User
    const admin = await UserRepo.create({
      anonymousUsername: 'QuietGuardian_01',
      nickname: 'Guardian Angel',
      email: 'admin@truecompanion.org',
      passwordHash: defaultPasswordHash,
      avatar: 'avatar-1',
      bio: 'Community Care & Safety Team Lead. Ensuring True Companion remains a calm, safe sanctuary for all.',
      role: 'admin',
      status: 'active',
    });

    // 2. Empathetic Community Members
    const user1 = await UserRepo.create({
      anonymousUsername: 'SilentSoul_482',
      nickname: 'Quiet Thinker',
      email: 'silentsoul@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'avatar-2',
      bio: 'Final year university student navigating transitions. Looking for genuine conversations without societal masks.',
      role: 'user',
      status: 'active',
    });

    const user2 = await UserRepo.create({
      anonymousUsername: 'HopeSeeker_91',
      nickname: 'Gentle Horizon',
      email: 'hopeseeker@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'avatar-3',
      bio: 'Recovering from deep corporate burnout. Always here to listen with patience and empathy.',
      role: 'user',
      status: 'active',
    });

    const user3 = await UserRepo.create({
      anonymousUsername: 'MoonWalker_238',
      nickname: 'Night Owl',
      email: 'moonwalker@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'avatar-4',
      bio: 'Introvert, book lover, and quiet listener. Dealing with family relationship challenges.',
      role: 'user',
      status: 'active',
    });

    const user4 = await UserRepo.create({
      anonymousUsername: 'QuietHeart_52',
      nickname: 'Calm River',
      email: 'quietheart@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'avatar-5',
      bio: 'Lived through severe anxiety and panic attacks for years. You are never as alone as your mind tells you.',
      role: 'user',
      status: 'active',
    });

    const user5 = await UserRepo.create({
      anonymousUsername: 'GentleEcho_12',
      nickname: 'Soft Breeze',
      email: 'gentleecho@example.com',
      passwordHash: defaultPasswordHash,
      avatar: 'avatar-6',
      bio: 'Learning to be kinder to myself every single day.',
      role: 'user',
      status: 'active',
    });

    // 3. Empathetic Posts Across Categories
    const post1 = await PostRepo.create({
      authorId: user1._id,
      title: 'Feeling Completely Lost About My Career & Future',
      description:
        "I am currently in my final year of university, and I feel suffocated by confusion. Everyone around me seems to have accepted internships, received job offers, or have solid plans for their masters. Whenever someone asks me 'So what is next?', my chest tightens and I freeze.\n\nI feel like I spent years studying something just because it was expected of me, but now I don't know who I am or what makes me feel alive. I just want someone who understands what it feels like to have no roadmap.",
      category: 'Career Confusion',
      chatEnabled: true,
      status: 'active',
    });

    const post2 = await PostRepo.create({
      authorId: user2._id,
      title: 'The Heavy, Silent Loneliness of Moving to a New Metropolis',
      description:
        "Six months ago, I moved to Bengaluru for my first tech job. On paper, it was everything I dreamed of. In reality, I spend 10 hours at a desk surrounded by people who are polite but distant, and then I return to an empty studio apartment.\n\nThe silence in the evenings feels almost loud. I eat dinner while watching random videos just to hear a human voice. Is it normal to feel this untethered when everything in your life looks fine on the surface?",
      category: 'Loneliness',
      chatEnabled: true,
      status: 'active',
    });

    const post3 = await PostRepo.create({
      authorId: user3._id,
      title: 'A Painful Breakup with Zero Closure or Explanation',
      description:
        "After four years together, they simply stopped calling, stopped showing up, and sent a two-line message saying they needed space. That was three months ago.\n\nThe hardest part isn't just missing them—it is the endless loops in my head trying to figure out what I did wrong or why I wasn't worth an honest conversation. If anyone has walked this road of sudden abandonment, I'd really appreciate a quiet chat.",
      category: 'Relationship Issues',
      chatEnabled: true,
      status: 'active',
    });

    const post4 = await PostRepo.create({
      authorId: user4._id,
      title: 'Suffocating Parental Pressure Around Competitive Exams',
      description:
        "My parents have sacrificed so much for my education, and I love them deeply. But their expectations feel like an anvil on my chest. Every mealtime conversation is about rank percentiles, mock test scores, and relatives' children who cleared civil services.\n\nI failed my latest assessment by 8 marks. I haven't slept properly in two weeks because of the sheer dread of disappointing them. How do you breathe when your worth feels tied only to your marks?",
      category: 'Academic Pressure',
      chatEnabled: true,
      status: 'active',
    });

    const post5 = await PostRepo.create({
      authorId: user5._id,
      title: 'Some Days, Small Tasks Feel Like Climbing Mount Everest',
      description:
        "Just a reminder to anyone who needs it today: if brushing your teeth, drinking water, and taking a five-minute shower was all you could manage today, that is enough.\n\nHealing isn't a race or an Instagram aesthetic. It is messy, slow, and often invisible. Be proud that you are still here breathing.",
      category: 'Motivation',
      chatEnabled: true,
      status: 'active',
    });

    const post6 = await PostRepo.create({
      authorId: user1._id,
      title: 'Waking Up with Unexplained Morning Anxiety Waves',
      description:
        "Does anyone else wake up at 5:00 AM with a racing heartbeat and a sense of impending doom, even before remembering what day it is? I have been practicing box breathing, but some mornings the anxiety is like a physical weight pressing on my diaphragm. How do you gently ground yourself when your nervous system is in overdrive?",
      category: 'Mental Wellbeing',
      chatEnabled: true,
      status: 'active',
    });

    const post7 = await PostRepo.create({
      authorId: user3._id,
      title: 'Living in a Household Where Emotional Expression is Punished',
      description:
        "Growing up, crying was considered weakness and expressing boundaries was labeled as 'disrespect'. Now that I am an adult living with my parents, the passive aggression and silent treatments are exhausting. I feel like I walk on eggshells from sunrise to sunset.",
      category: 'Family Problems',
      chatEnabled: true,
      status: 'active',
    });

    // 4. Sample Chat Request & Conversation
    const sampleRequest = await ChatRequestRepo.create({
      senderId: user2._id,
      receiverId: user1._id,
      postId: post1._id,
      introductionMessage:
        "Hi friend, I read your post about feeling lost. I went through the exact same dread four years ago. I'd love to listen if you want to vent.",
      status: 'accepted',
    });

    const conversation = await ConversationRepo.create({
      participants: [user1._id, user2._id],
      chatRequestId: sampleRequest._id,
      postId: post1._id,
      status: 'active',
    });

    await MessageRepo.create({
      conversationId: conversation._id,
      senderId: user2._id,
      messageType: 'text',
      content:
        "Hi friend, I read your post about feeling lost. I went through the exact same dread four years ago. I'd love to listen if you want to vent.",
    });

    await MessageRepo.create({
      conversationId: conversation._id,
      senderId: user1._id,
      messageType: 'text',
      content:
        "Thank you so much for reaching out. Honestly just knowing someone else felt this and survived helps me breathe a bit easier today.",
    });

    await MessageRepo.create({
      conversationId: conversation._id,
      senderId: user2._id,
      messageType: 'text',
      content:
        "You will survive this too, I promise. Society creates an illusion that at 21 or 22 you must have your entire 50-year plan formulated. What are you studying right now?",
    });

    // 5. Sample Pending Chat Request
    await ChatRequestRepo.create({
      senderId: user4._id,
      receiverId: user1._id,
      postId: post6._id,
      introductionMessage:
        "I saw your post on morning anxiety. I learned a grounding sensory exercise that helped me a lot. Happy to share if you'd like to chat.",
      status: 'pending',
    });

    // 6. Sample Report for Admin Moderation Demonstration
    await ReportRepo.create({
      reporterId: user3._id,
      reason: 'Spam',
      description: 'Account was sending unsolicited promotional crypto links in multiple threads.',
      status: 'pending',
    });

    console.log('✅ [Seed] Successfully populated seed accounts, posts, conversations, and reports!');
    console.log(`🔑 [Seed Admin Credentials]:`);
    console.log(`   Username: QuietGuardian_01`);
    console.log(`   Email:    admin@truecompanion.org`);
    console.log(`   Password: Companion@2026!`);
    console.log(`🔑 [Seed User Credentials]:`);
    console.log(`   Username: SilentSoul_482  /  Password: Companion@2026!`);
    console.log(`   Username: HopeSeeker_91   /  Password: Companion@2026!`);
  } catch (err: any) {
    console.error('Error seeding database:', err);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase(true).then(() => process.exit(0));
}
