import { prisma } from '../prisma/client';
import { BookingStatus } from '@prisma/client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

export const createBooking = async (data: any) => {
  const { 
    packageId, 
    guestCount, 
    addons, 
    drinks, 
    eventDate, 
    eventLocation, 
    customerName, 
    customerEmail, 
    customerPhone, 
    notes,
    tipPercentage = 0 // e.g. 0, 0.025, 0.05, 0.075
  } = data;

  // 1. Enforce minimum guest count (20 guests)
  if (!guestCount || guestCount < 20) {
    throw new Error('Minimum guest requirement is 20 guests.');
  }

  // 2. Fetch package
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) throw new Error('Package not found');

  const packageTotal = Number(pkg.pricePerPerson) * guestCount;

  // 3. Process Add-ons with quantities
  let addonsTotal = 0;
  const addonDetails = [];
  if (addons && Array.isArray(addons)) {
    for (const item of addons) {
      const addonRecord = await prisma.addon.findUnique({ where: { id: item.addonId } });
      if (addonRecord) {
        const qty = item.quantity || 1;
        const subtotal = Number(addonRecord.pricePerPerson) * qty;
        addonsTotal += subtotal;
        addonDetails.push({ 
          addonId: item.addonId, 
          quantity: qty, 
          subtotal 
        });
      }
    }
  }

  // 4. Process Drinks with quantities
  let drinksTotal = 0;
  const drinkDetails = [];
  if (drinks && Array.isArray(drinks)) {
    for (const item of drinks) {
      const drinkRecord = await prisma.drink.findUnique({ where: { id: item.drinkId } });
      if (drinkRecord) {
        const qty = item.quantity || 1;
        const subtotal = Number(drinkRecord.pricePerPerson) * qty;
        drinksTotal += subtotal;
        drinkDetails.push({ 
          drinkId: item.drinkId, 
          quantity: qty, 
          subtotal 
        });
      }
    }
  }

  // 5. Financial & Fee Calculations
  const foodAndDrinksSubtotal = packageTotal + addonsTotal + drinksTotal;
  
  // Service fee is 10% of food/drinks subtotal (excluding delivery)
  const serviceFee = foodAndDrinksSubtotal * 0.10;
  const deliveryFee = 100.00; // Fixed delivery fee

  // Subtotal before tax including fees
  const subtotalWithExtras = foodAndDrinksSubtotal + serviceFee + deliveryFee;
  
  // Tax (8%) applies to food, drinks, service fee, and delivery fee
  const taxAmount = subtotalWithExtras * 0.08; 
  
  // Tip calculation
  const tipAmount = subtotalWithExtras * tipPercentage; 
  
  // Grand Total after tax & tips
  const grandTotal = subtotalWithExtras + taxAmount + tipAmount; 
  const downPayment = grandTotal * 0.25; // 25% Down Payment

  // Generate unique booking number
  const bookingNumber = `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 6. Create Stripe Checkout Session for the 25% Down Payment
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `25% Down Payment - Olive Coast Catering (${bookingNumber})`,
            description: `Event Date: ${new Date(eventDate).toLocaleDateString()} | Grand Total: $${grandTotal.toFixed(2)}`,
          },
          unit_amount: Math.round(downPayment * 100), // Stripe expects amounts in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel`,
    metadata: {
      bookingNumber,
      customerName,
      customerPhone,
    },
  });

  // 7. Save to Database using official BookingStatus enum
  const newBooking = await prisma.booking.create({
    data: {
      bookingNumber,
      packageId,
      guestCount,
      eventDate: new Date(eventDate),
      eventLocation,
      customerName,
      customerEmail: customerEmail || null,
      customerPhone,
      notes: notes || null,
      packageTotal,
      addonsTotal,
      drinksTotal,
      deliveryFee,
      serviceFee,
      taxAmount,
      tipAmount,
      grandTotal,
      downPayment,
      status: BookingStatus.PENDING,
      addons: { create: addonDetails },
      drinks: { create: drinkDetails },
    },
    include: { 
      package: true, 
      addons: { include: { addon: true } }, 
      drinks: { include: { drink: true } } 
    }
  });

  return {
    ...newBooking,
    checkoutUrl: session.url
  };
};

export const getBookings = async (status?: string) => {
  const whereClause = status ? { status: status as BookingStatus } : {};
  return await prisma.booking.findMany({
    where: whereClause,
    include: { 
      package: true, 
      addons: { include: { addon: true } }, 
      drinks: { include: { drink: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getBooking = async (id: string) => {
  return await prisma.booking.findUnique({
    where: { id },
    include: { 
      package: true, 
      addons: { include: { addon: true } }, 
      drinks: { include: { drink: true } } 
    }
  });
};

export const updateStatus = async (id: string, status: BookingStatus) => {
  return await prisma.booking.update({
    where: { id },
    data: { status },
    include: { 
      package: true, 
      addons: { include: { addon: true } }, 
      drinks: { include: { drink: true } } 
    }
  });
};

export const getByNumber = async (num: string) => {
  return await prisma.booking.findUnique({
    where: { bookingNumber: num },
    include: { 
      package: true, 
      addons: { include: { addon: true } }, 
      drinks: { include: { drink: true } } 
    }
  });
};