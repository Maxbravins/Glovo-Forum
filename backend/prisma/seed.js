const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Glovo Forum Database...');

  const categoriesData = [
    { name: 'General Discussion', slug: 'general', description: 'General forum for riders, customers, and staff', icon: '💬' },
    { name: 'Glovo Riders Corner', slug: 'riders', description: 'Rider tips, gear recommendations, and shift discussions', icon: '🛵' },
    { name: 'Customer Feedback', slug: 'customer-feedback', description: 'Experience reviews, suggestions, and appreciation', icon: '⭐' },
    { name: 'Tips & Equipment', slug: 'tips-equipment', description: 'Best bikes, phone mounts, insulated bags, and route hacks', icon: '🔧' },
    { name: 'App Issues & Support', slug: 'support', description: 'Bug reports, payout queries, and app technical help', icon: '📱' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@glovo.com' },
    update: {},
    create: {
      username: 'GlovoAdmin',
      email: 'admin@glovo.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const rider = await prisma.user.upsert({
    where: { email: 'rider@glovo.com' },
    update: {},
    create: {
      username: 'MarcoRider',
      email: 'rider@glovo.com',
      password: hashedPassword,
      role: 'RIDER',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@glovo.com' },
    update: {},
    create: {
      username: 'SarahDev',
      email: 'customer@glovo.com',
      password: hashedPassword,
      role: 'USER',
    },
  });

  const generalCategory = await prisma.category.findUnique({ where: { slug: 'general' } });
  const ridersCategory = await prisma.category.findUnique({ where: { slug: 'riders' } });
  const tipsCategory = await prisma.category.findUnique({ where: { slug: 'tips-equipment' } });

  if (generalCategory && ridersCategory && tipsCategory) {
    const post1 = await prisma.post.create({
      data: {
        title: 'Welcome to the New Official Glovo Forum!',
        content: 'We are thrilled to launch our new community forum for riders and customers! Feel free to share experiences, ask questions, and reply to threads with photos and feedback.',
        pinned: true,
        views: 142,
        categoryId: generalCategory.id,
        userId: admin.id,
      },
    });

    const post2 = await prisma.post.create({
      data: {
        title: 'Best Thermal Bags for Rainy Season Deliveries 🌧️',
        content: 'Hey riders! With the rainy season coming up, keeping food warm and dry is essential. What waterproof delivery backpacks are you all using this year?',
        views: 89,
        categoryId: tipsCategory.id,
        userId: rider.id,
      },
    });

    const comment1 = await prisma.comment.create({
      data: {
        content: 'Super excited for this community! Is there a mobile app planned as well?',
        postId: post1.id,
        userId: customer.id,
      },
    });

    const reply1 = await prisma.comment.create({
      data: {
        content: 'Hi Sarah! Yes, progressive web app (PWA) features and notifications are coming very soon!',
        postId: post1.id,
        userId: admin.id,
        parentId: comment1.id,
      },
    });

    await prisma.comment.create({
      data: {
        content: 'That sounds amazing! Thanks for the quick update Admin!',
        postId: post1.id,
        userId: customer.id,
        parentId: reply1.id,
      },
    });

    await prisma.comment.create({
      data: {
        content: 'I recommend the double-insulated heavy duty backpack with rain cover. Keeps pizza hot for up to 45 mins!',
        postId: post2.id,
        userId: rider.id,
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
