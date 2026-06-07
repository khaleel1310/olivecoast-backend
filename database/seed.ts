import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import { PrismaClient, Role } from '../generated/prisma';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 1. Point directly to the exact DATABASE_URL from your active .env file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // 👈 Dynamically uses your real working database!
});

// 2. Wrap it inside Prisma 7's required Driver Adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter straight into the constructor
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean out existing records to avoid duplicate key errors during local development
  // We use a raw query with CASCADE to cleanly wipe tables in a specific relational order
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User", "Category", "MenuItem", "Order", "OrderItem" CASCADE;`);
  console.log(' Cleaned existing database tables.');

  // 2. Hash default password for development accounts
  const saltRounds = 10;
  const hashedDevPassword = await bcrypt.hash('password123', saltRounds);

  // 3. Seed Users (Owner and Chef roles)
  const owner = await prisma.user.create({
    data: {
      email: 'owner@olivecoast.com',
      password: hashedDevPassword,
      role: Role.OWNER,
    },
  });

  const chef = await prisma.user.create({
    data: {
      email: 'chef@olivecoast.com',
      password: hashedDevPassword,
      role: Role.CHEF,
    },
  });

  console.log('Standard users seeded successfully.');

  // 4. Seed Menu Categories
  const starters = await prisma.category.create({
    data: { name: 'Starters & Appetizers', sortOrder: 1 },
  });

  const mains = await prisma.category.create({
    data: { name: 'Main Platters', sortOrder: 2 },
  });

  const desserts = await prisma.category.create({
    data: { name: 'Desserts', sortOrder: 3 },
  });

  console.log(' Menu categories created.');

  // 5. Seed Menu Items linked to those Categories
  await prisma.menuItem.createMany({
    data: [
      {
        categoryId: starters.id,
        name: 'Hummus with Meat',
        description: 'Smooth blended chickpeas topped with warm spiced minced meat and pine nuts.',
        price: 4.50,
      },
      {
        categoryId: starters.id,
        name: 'Kubbeh',
        description: 'Crispy cracked wheat shells filled with seasoned minced beef and onions (4 pieces).',
        price: 5.00,
      },
      {
        categoryId: mains.id,
        name: 'Traditional Mansaf',
        description: 'Tender lamb cooked in a rich, tangy jameed broth, served over rice with shrak bread.',
        price: 14.50,
      },
      {
        categoryId: mains.id,
        name: 'Mixed Grill Platter',
        description: 'A combination of shish taouk, kebab, and beef tenderloin skewers served with grilled vegetables.',
        price: 16.00,
      },
      {
        categoryId: desserts.id,
        name: 'Knafeh',
        description: 'Warm, cheesy pastry soaked in sweet orange-blossom syrup, topped with crushed pistachios.',
        price: 4.00,
      },
    ],
  });

  console.log('Menu items populated.');
  console.log('Database seeding completed beautifully!');
}

main()
  .catch((e) => {
    console.error(' Error executing the seed file:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect Prisma Client when finished to free up the database connection pool
    await prisma.$disconnect();
  });