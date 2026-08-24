import { prisma } from '../prisma/client';


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
    notes 
  } = data;

  // 1. Enforce minimum guest count (15 guests)
  if (!guestCount || guestCount < 15) {
    throw new Error('Minimum order requirement is 15 guests.');
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

  // 4. Process Drinks with quantities (using your new Drink table)
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

  // 5. Financial Calculations (Tax & 25% Down Payment)
  const subtotal = packageTotal + addonsTotal + drinksTotal;
  const taxAmount = subtotal * 0.08; // 8% Tax
  const grandTotal = subtotal + taxAmount;
  const downPayment = grandTotal * 0.25; // 25% Down payment (refundable within 72 hrs)

  // Generate unique booking number
  const bookingNumber = `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 6. Save to Database with nested relations
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
      taxAmount,
      grandTotal,
      downPayment,
      status: 'PENDING',
      addons: { create: addonDetails },
      drinks: { create: drinkDetails },
    },
    include: { 
      package: true, 
      addons: { include: { addon: true } }, 
      drinks: { include: { drink: true } } 
    }
  });

  return newBooking;
};

export const getBookings = async (status?: string) => {
  const whereClause = status ? { status: status as any } : {};
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

export const updateStatus = async (id: string, status: any) => {
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