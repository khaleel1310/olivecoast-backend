// src/services/bookings.service.ts
import { prisma } from '../prisma/client';

async function generateBookingNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const last = await prisma.booking.findFirst({
    where:   { bookingNumber: { startsWith: `BK-${year}-` } },
    orderBy: { bookingNumber: 'desc' },
  });
  let next = 1;
  if (last) {
    const parts = last.bookingNumber.split('-');
    next = parseInt(parts[parts.length - 1]) + 1;
  }
  return `BK-${year}-${String(next).padStart(4, '0')}`;
}

export const createBooking = async (data: any) => {
  const pkg = await prisma.package.findUnique({ where: { id: data.packageId } });
  if (!pkg) throw { status: 400, message: 'Package not found' };

  const guestCount    = parseInt(data.guestCount);
  const packageTotal  = Number(pkg.pricePerPerson) * guestCount;

  // Calculate add-ons total
  let addonsTotal = 0;
  const addonDetails: { addonId: string; quantity: number; subtotal: number }[] = [];

  if (data.addons && data.addons.length > 0) {
    for (const selected of data.addons) {
      const addon = await prisma.addon.findUnique({ where: { id: selected.addonId } });
      if (addon) {
        const subtotal = Number(addon.pricePerPerson) * guestCount;
        addonsTotal += subtotal;
        addonDetails.push({ addonId: selected.addonId, quantity: guestCount, subtotal });
      }
    }
  }

  const grandTotal      = packageTotal + addonsTotal;
  const bookingNumber   = await generateBookingNumber();

  return prisma.booking.create({
    data: {
      bookingNumber,
      packageId:    data.packageId,
      guestCount,
      eventDate:    new Date(data.eventDate),
      eventLocation: data.eventLocation,
      customerName:  data.customerName,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone,
      packageTotal,
      addonsTotal,
      grandTotal,
      notes:         data.notes || null,
      status:        'PENDING',
      addons: {
        create: addonDetails,
      },
    },
    include: { package: true, addons: { include: { addon: true } } },
  });
};

export const getBookings = async (status?: string) => {
  return prisma.booking.findMany({
    where:   status ? { status: status as any } : {},
    include: { package: true, addons: { include: { addon: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const getBooking = async (id: string) => {
  return prisma.booking.findUnique({
    where:   { id },
    include: { package: true, addons: { include: { addon: true } } },
  });
};

export const updateStatus = async (id: string, status: string) => {
  return prisma.booking.update({
    where: { id },
    data:  { status: status as any },
    include: { package: true, addons: { include: { addon: true } } },
  });
};

export const getByNumber = async (bookingNumber: string) => {
  return prisma.booking.findUnique({
    where:   { bookingNumber },
    include: { package: true, addons: { include: { addon: true } } },
  });
};