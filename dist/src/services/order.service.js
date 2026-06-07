"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const client_1 = require("../prisma/client");
class OrderService {
    static async createCustomerOrder(data) {
        if (!data.items || data.items.length === 0) {
            throw new Error('An order must contain at least one item.');
        }
        // Wrap the entire process in a robust database transaction
        return await client_1.prisma.$transaction(async (tx) => {
            // 1. Generate the sequential order number (e.g., ORD-001)
            const lastOrder = await tx.order.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { orderNumber: true }
            });
            let nextNumber = 1;
            if (lastOrder && lastOrder.orderNumber.startsWith('ORD-')) {
                const lastSequence = parseInt(lastOrder.orderNumber.split('-')[1], 10);
                if (!isNaN(lastSequence)) {
                    nextNumber = lastSequence + 1;
                }
            }
            const formattedOrderNumber = `ORD-${String(nextNumber).padStart(3, '0')}`;
            // 2. Resolve and validate all menu items to calculate totals safely
            let runningTotal = 0;
            const detailedOrderItems = [];
            for (const entry of data.items) {
                const item = await tx.menuItem.findUnique({
                    where: { id: entry.menuItemId }
                });
                if (!item) {
                    throw new Error(`Menu item with ID ${entry.menuItemId} does not exist.`);
                }
                if (!item.isAvailable) {
                    throw new Error(`"${item.name}" is currently sold out.`);
                }
                const priceNum = Number(item.price);
                const itemSubtotal = priceNum * entry.quantity;
                runningTotal += itemSubtotal;
                detailedOrderItems.push({
                    menuItemId: item.id,
                    itemName: item.name, // Historical snapshot auditing
                    itemPrice: item.price, // Historical snapshot auditing
                    quantity: entry.quantity,
                    subtotal: itemSubtotal
                });
            }
            // 3. Persist the Order and its child line items to PostgreSQL
            return await tx.order.create({
                data: {
                    orderNumber: formattedOrderNumber,
                    customerName: data.customerName,
                    phoneNumber: data.phoneNumber,
                    deliveryAddress: data.deliveryAddress,
                    notes: data.notes,
                    total: runningTotal,
                    status: 'PENDING',
                    items: {
                        create: detailedOrderItems
                    }
                },
                include: {
                    items: true
                }
            });
        });
    }
    /**
     * Fetches dashboard orders based on the staff role.
     * OWNER sees every order history record.
     * CHEF only sees incoming PENDING tickets.
     */
    static async getOrdersByRole(role) {
        const filterCondition = role === 'CHEF' ? { status: 'PENDING' } : {};
        return await client_1.prisma.order.findMany({
            where: filterCondition,
            include: {
                items: true // Includes the breakdown of individual quantities and items ordered
            },
            orderBy: {
                createdAt: 'desc' // Newest tickets show up at the top
            }
        });
    }
    /**
     * Updates an order status from PENDING to COMPLETED.
     * Enforces validation to ensure the order exists before updating.
     */
    static async markOrderAsCompleted(orderId) {
        // 1. Verify the order exists first
        const existingOrder = await client_1.prisma.order.findUnique({
            where: { id: orderId }
        });
        if (!existingOrder) {
            throw new Error(`Order with ID ${orderId} not found.`);
        }
        // 2. Perform the atomic update status flip
        return await client_1.prisma.order.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' }, // Flips the enum state cleanly
            include: { items: true }
        });
    }
}
exports.OrderService = OrderService;
