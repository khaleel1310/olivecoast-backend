// database/seed.ts — MUST BE ON LINE 1
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding V2 catering database...');

  // ── Users ──────────────────────────────────────────────────────
  const owners = [
    { email: 'owner@olivecoast.com', name: 'Owner', password: 'Zaid19$' },
    { email: 'laura@olivecoast.com', name: 'Laura', password: 'Laura84' },
  ];

  for (const owner of owners) {
    const hashedPassword = await bcrypt.hash(owner.password, 12);
    await prisma.user.upsert({
      where: { email: owner.email },
      update: { password: hashedPassword, role: 'OWNER' },
      create: {
        email: owner.email,
        name: owner.name,
        password: hashedPassword,
        role: 'OWNER',
      },
    });
  }

  // Default CHEF user
  const chefPassword = await bcrypt.hash('Chef123!', 12);
  await prisma.user.upsert({
    where: { email: 'chef@olivecoast.com' },
    update: {},
    create: {
      email: 'chef@olivecoast.com',
      name: 'Chef',
      password: chefPassword,
      role: 'CHEF',
    },
  });
  console.log('✅ Users created');

  // ── Packages ───────────────────────────────────────────────────
  const packages = [
    {
      name: 'Classic Collection',
      pricePerPerson: new Prisma.Decimal(39.95),
      sortOrder: 1,
      description: 'Elegant catering for any occasion — perfect balance of quality and value.',
      includedItems: JSON.stringify({
        hors_doeuvres: ['Bruschetta', 'Spanakopita'],
        salad: ['Greek Salad'],
        entrees: ['Herb-Roasted Chicken', 'Chicken Parmesan'],
        sides: ['Garlic Mashed Potatoes', 'Roasted Seasonal Vegetables'],
        vegetarian: ['Eggplant Parmesan'],
        desserts: ['Classic Cheesecake', 'Baklava'],
        included: ['Bread & Butter', 'Sauces & Garnishes'],
      }),
    },
    {
      name: 'Signature Collection',
      pricePerPerson: new Prisma.Decimal(54.95),
      sortOrder: 2,
      description: 'Premium ingredients and refined presentation for your most memorable events.',
      includedItems: JSON.stringify({
        hors_doeuvres: ['Shrimp Cocktail', 'Smoked Salmon Crostini', 'Arancini'],
        salad: ['Burrata Caprese'],
        entrees: ['Chicken Marsala', 'Braised Short Rib'],
        italian: ['Wild Mushroom Risotto'],
        sides: ['Truffle Mashed Potatoes', 'Grilled Asparagus'],
        vegetarian: ['Vegetarian Moussaka'],
        desserts: ['Tiramisu', 'Cannoli', 'Baklava'],
        included: ['Artisan Bread', 'Signature Sauces & Garnishes'],
      }),
    },
    {
      name: 'Luxury Collection',
      pricePerPerson: new Prisma.Decimal(74.95),
      sortOrder: 3,
      description: 'An extraordinary fine dining experience — the pinnacle of upscale catering.',
      includedItems: JSON.stringify({
        hors_doeuvres: ['Beef Wellington Bites', 'Jumbo Shrimp Cocktail', 'Smoked Salmon Crostini', 'Truffle Arancini'],
        salad: ['Burrata & Heirloom Tomato'],
        entrees: ['Choice of 2: Filet Mignon, Grilled Salmon, Braised Short Rib, Chicken Roulade'],
        italian: ['Choice of 1: Lobster Ravioli, Truffle Risotto, Wild Mushroom Ravioli'],
        greek: ['Choice of 1: Greek Lemon Potatoes, Mediterranean Orzo, Beef Tenderloin Souvlaki'],
        sides: ['Truffle Mashed Potatoes', 'Grilled Asparagus'],
        vegetarian: ['Truffle Wild Mushroom Risotto'],
        desserts: ['Crème Brûlée', 'Tiramisu', 'Chocolate Ganache Tart'],
        included: ['Artisan Bread', 'Luxury Sauces & Garnishes'],
      }),
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: pkg,
      create: pkg,
    });
  }
  console.log('✅ Packages created');

  // ── Add-ons ────────────────────────────────────────────────────
  const addons = [
    { name: 'Filet Mignon Upgrade', pricePerPerson: new Prisma.Decimal(8.00), sortOrder: 1, description: 'Upgrade to premium Filet Mignon per guest' },
    { name: 'Lobster Upgrade', pricePerPerson: new Prisma.Decimal(10.00), sortOrder: 2, description: 'Add Lobster Ravioli or Lobster entrée per guest' },
    { name: 'Lamb Chop Upgrade', pricePerPerson: new Prisma.Decimal(7.00), sortOrder: 3, description: 'Add Grilled Lamb Chops per guest' },
    { name: 'Additional Entrée', pricePerPerson: new Prisma.Decimal(8.00), sortOrder: 4, description: 'Add one more entrée selection per guest' },
    { name: "Additional Hors d'oeuvre", pricePerPerson: new Prisma.Decimal(4.00), sortOrder: 5, description: "Add one more hors d'oeuvre per guest" },
    { name: 'Premium Dessert', pricePerPerson: new Prisma.Decimal(4.00), sortOrder: 6, description: 'Add a premium dessert selection per guest' },
  ];

  for (const addon of addons) {
    await prisma.addon.upsert({
      where: { name: addon.name },
      update: addon,
      create: addon,
    });
  }
  console.log('✅ Add-ons created');
  console.log('🎉 V2 seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });