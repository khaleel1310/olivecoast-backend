"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByNumber = exports.updateStatus = exports.getBooking = exports.getBookings = exports.createBooking = void 0;
// src/services/bookings.service.ts
const client_1 = require("../prisma/client");
async function generateBookingNumber() {
    const year = new Date().getFullYear();
    const last = await client_1.prisma.booking.findFirst({
        where: { bookingNumber: { startsWith: `BK-${year}-` } },
        orderBy: { bookingNumber: 'desc' },
    });
    let next = 1;
    if (last) {
        const parts = last.bookingNumber.split('-');
        next = parseInt(parts[parts.length - 1]) + 1;
    }
    return `BK-${year}-${String(next).padStart(4, '0')}`;
}
const createBooking = async (data) => {
    const pkg = await client_1.prisma.package.findUnique({ where: { id: data.packageId } });
    if (!pkg)
        throw { status: 400, message: 'Package not found' };
    const guestCount = parseInt(data.guestCount);
    const packageTotal = Number(pkg.pricePerPerson) * guestCount;
    // Calculate add-ons total
    let addonsTotal = 0;
    const addonDetails = [];
    if (data.addons && data.addons.length > 0) {
        for (const selected of data.addons) {
            const addon = await client_1.prisma.addon.findUnique({ where: { id: selected.addonId } });
            if (addon) {
                const subtotal = Number(addon.pricePerPerson) * guestCount;
                addonsTotal += subtotal;
                addonDetails.push({ addonId: selected.addonId, quantity: guestCount, subtotal });
            }
        }
    }
    const grandTotal = packageTotal + addonsTotal;
    const bookingNumber = await generateBookingNumber();
    return client_1.prisma.booking.create({
        data: {
            bookingNumber,
            packageId: data.packageId,
            guestCount,
            eventDate: new Date(data.eventDate),
            eventLocation: data.eventLocation,
            customerName: data.customerName,
            customerEmail: data.customerEmail || null,
            customerPhone: data.customerPhone,
            packageTotal,
            addonsTotal,
            grandTotal,
            notes: data.notes || null,
            status: 'PENDING',
            addons: {
                create: addonDetails,
            },
        },
        include: { package: true, addons: { include: { addon: true } } },
    });
};
exports.createBooking = createBooking;
const getBookings = async (status) => {
    return client_1.prisma.booking.findMany({
        where: status ? { status: status } : {},
        include: { package: true, addons: { include: { addon: true } } },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getBookings = getBookings;
const getBooking = async (id) => {
    return client_1.prisma.booking.findUnique({
        where: { id },
        include: { package: true, addons: { include: { addon: true } } },
    });
};
exports.getBooking = getBooking;
const updateStatus = async (id, status) => {
    return client_1.prisma.booking.update({
        where: { id },
        data: { status: status },
        include: { package: true, addons: { include: { addon: true } } },
    });
};
exports.updateStatus = updateStatus;
const getByNumber = async (bookingNumber) => {
    return client_1.prisma.booking.findUnique({
        where: { bookingNumber },
        include: { package: true, addons: { include: { addon: true } } },
    });
};
exports.getByNumber = getByNumber;
