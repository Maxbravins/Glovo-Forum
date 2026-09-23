const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding Glovo Forum Database...');

  // --------------------------------------------------
  // CATEGORIES
  // --------------------------------------------------

  const categories = [
    {
      name: 'General Discussion',
      slug: 'general',
      description: 'General forum for riders, customers, restaurants, stores, and staff',
      icon: '',
      color: '#FFC244',
    },
    {
      name: 'Glovo Riders Corner',
      slug: 'riders',
      description: 'Rider tips, earnings, gear, routes, shifts, and delivery experiences',
      icon: '',
      color: '#4CAF50',
    },
    {
      name: 'Customer Feedback',
      slug: 'customer-feedback',
      description: 'Customer experiences, reviews, complaints, suggestions, and appreciation',
      icon: '⭐',
      color: '#FF9800',
    },
    {
      name: 'Restaurants & Stores',
      slug: 'restaurants-stores',
      description: 'Discussions about restaurants, stores, merchants, menus, orders, and partnerships',
      icon: '',
      color: '#E91E63',
    },
    {
      name: 'Tips & Equipment',
      slug: 'tips-equipment',
      description: 'Bikes, phones, mounts, delivery bags, rain gear, and useful equipment',
      icon: '',
      color: '#2196F3',
    },
    {
      name: 'App Issues & Support',
      slug: 'support',
      description: 'App problems, technical issues, payments, orders, and account support',
      icon: '',
      color: '#9C27B0',
    },
  ];

  const categoryMap = {};

  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });

    categoryMap[category.slug] = saved;
  }

  // --------------------------------------------------
  // USERS
  // --------------------------------------------------

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@glovo.com' },
    update: {
      username: 'GlovoAdmin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      username: 'GlovoAdmin',
      email: 'admin@glovo.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      bio: 'Forum administrator',
      location: 'Nairobi',
    },
  });

  const rider = await prisma.user.upsert({
    where: { email: 'rider@glovo.com' },
    update: {
      username: 'MarcoRider',
      role: 'RIDER',
      status: 'ACTIVE',
    },
    create: {
      username: 'MarcoRider',
      email: 'rider@glovo.com',
      password: hashedPassword,
      role: 'RIDER',
      status: 'ACTIVE',
      bio: 'Delivery rider sharing tips and experiences',
      location: 'Nairobi',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@glovo.com' },
    update: {
      username: 'SarahDev',
      role: 'USER',
      status: 'ACTIVE',
    },
    create: {
      username: 'SarahDev',
      email: 'customer@glovo.com',
      password: hashedPassword,
      role: 'USER',
      status: 'ACTIVE',
      bio: 'Customer and community member',
      location: 'Nairobi',
    },
  });

  const restaurant = await prisma.user.upsert({
    where: { email: 'restaurant@glovo.com' },
    update: {
      username: 'NairobiRestaurant',
      role: 'RESTAURANT',
      status: 'ACTIVE',
    },
    create: {
      username: 'NairobiRestaurant',
      email: 'restaurant@glovo.com',
      password: hashedPassword,
      role: 'RESTAURANT',
      status: 'ACTIVE',
      bio: 'Restaurant representative',
      location: 'Nairobi',
    },
  });

  const store = await prisma.user.upsert({
    where: { email: 'store@glovo.com' },
    update: {
      username: 'NairobiStore',
      role: 'STORE',
      status: 'ACTIVE',
    },
    create: {
      username: 'NairobiStore',
      email: 'store@glovo.com',
      password: hashedPassword,
      role: 'STORE',
      status: 'ACTIVE',
      bio: 'Store representative',
      location: 'Nairobi',
    },
  });

  // --------------------------------------------------
  // TAGS
  // --------------------------------------------------

  const tagDefinitions = [
    ['late-delivery', 'Late Delivery'],
    ['refund', 'Refund'],
    ['nairobi', 'Nairobi'],
    ['rider', 'Rider'],
    ['restaurant', 'Restaurant'],
    ['store', 'Store'],
    ['customer', 'Customer'],
    ['app', 'App'],
    ['payments', 'Payments'],
    ['delivery', 'Delivery'],
  ];

  const tagMap = {};

  for (const [slug, name] of tagDefinitions) {
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });

    tagMap[slug] = tag;
  }

  // --------------------------------------------------
  // REMOVE DEMO CONTENT
  // --------------------------------------------------

  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.postFollow.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();

  // --------------------------------------------------
  // POSTS
  // --------------------------------------------------

  const welcomePost = await prisma.post.create({
    data: {
      title: 'Welcome to the Glovo Community Forum! ',
      content:
        'Welcome to the community. This forum brings together riders, customers, restaurants, stores, and other members of the delivery ecosystem. Share experiences, ask questions, report issues, exchange useful information, and help each other.',
      status: 'ACTIVE',
      pinned: true,
      categoryId: categoryMap.general.id,
      userId: admin.id,
      tags: {
        create: [
          { tagId: tagMap.delivery.id },
          { tagId: tagMap.customer.id },
          { tagId: tagMap.rider.id },
        ],
      },
    },
  });

  const riderPost = await prisma.post.create({
    data: {
      title: 'What equipment makes delivery easier during rainy weather?',
      content:
        'Riders, what equipment are you using during the rainy season? I am particularly interested in waterproof bags, phone protection, rain jackets, gloves, and anything that makes long shifts easier.',
      status: 'ACTIVE',
      categoryId: categoryMap.riders.id,
      userId: rider.id,
      tags: {
        create: [
          { tagId: tagMap.rider.id },
          { tagId: tagMap.delivery.id },
          { tagId: tagMap.nairobi.id },
        ],
      },
    },
  });

  const customerPost = await prisma.post.create({
    data: {
      title: 'What should happen when an order arrives very late?',
      content:
        'I would like to hear from customers and riders about late deliveries. What usually causes the delay, and what would make the experience better for everyone involved?',
      status: 'ACTIVE',
      solved: false,
      categoryId: categoryMap['customer-feedback'].id,
      userId: customer.id,
      tags: {
        create: [
          { tagId: tagMap.customer.id },
          { tagId: tagMap['late-delivery'].id },
          { tagId: tagMap.delivery.id },
        ],
      },
    },
  });

  const restaurantPost = await prisma.post.create({
    data: {
      title: 'Restaurant perspective: improving order preparation times',
      content:
        'From a restaurant perspective, order preparation and rider pickup need good coordination. What communication improvements would make restaurant-to-rider handoff smoother?',
      status: 'ACTIVE',
      categoryId: categoryMap['restaurants-stores'].id,
      userId: restaurant.id,
      tags: {
        create: [
          { tagId: tagMap.restaurant.id },
          { tagId: tagMap.rider.id },
          { tagId: tagMap.delivery.id },
        ],
      },
    },
  });

  const storePost = await prisma.post.create({
    data: {
      title: 'Store orders and stock availability',
      content:
        'For store orders, stock availability can sometimes change quickly. What information should customers receive when an item becomes unavailable after an order has been placed?',
      status: 'ACTIVE',
      categoryId: categoryMap['restaurants-stores'].id,
      userId: store.id,
      tags: {
        create: [
          { tagId: tagMap.store.id },
          { tagId: tagMap.customer.id },
          { tagId: tagMap.delivery.id },
        ],
      },
    },
  });

  // --------------------------------------------------
  // COMMENTS
  // --------------------------------------------------

  const comment1 = await prisma.comment.create({
    data: {
      content:
        'Great idea. It will be useful to have riders, customers, restaurants, and stores in the same conversation.',
      postId: welcomePost.id,
      userId: customer.id,
    },
  });

  const reply1 = await prisma.comment.create({
    data: {
      content:
        'Exactly. The goal is to make the forum useful for every part of the delivery ecosystem.',
      postId: welcomePost.id,
      userId: admin.id,
      parentId: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        'Looking forward to sharing rider experiences and practical tips here.',
      postId: welcomePost.id,
      userId: rider.id,
      parentId: reply1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        'A waterproof phone setup is one of the biggest improvements for rainy shifts.',
      postId: riderPost.id,
      userId: rider.id,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        'Communication about delays would definitely help customers understand what is happening.',
      postId: customerPost.id,
      userId: restaurant.id,
    },
  });

  // --------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------

  await prisma.notification.create({
    data: {
      type: 'SYSTEM',
      title: 'Welcome to the forum',
      message:
        'Welcome to the Glovo community forum. Explore discussions and join the conversation.',
      recipientId: customer.id,
      senderId: admin.id,
      postId: welcomePost.id,
    },
  });

  console.log(' Seeding completed successfully!');
  console.log('');
  console.log('Demo accounts:');
  console.log('Admin:      admin@glovo.com / password123');
  console.log('Rider:      rider@glovo.com / password123');
  console.log('Customer:   customer@glovo.com / password123');
  console.log('Restaurant: restaurant@glovo.com / password123');
  console.log('Store:      store@glovo.com / password123');
}

main()
  .catch((error) => {
    console.error(' Seeding error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
