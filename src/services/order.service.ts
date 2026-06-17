import { prisma } from '../prisma/client';
import { Role, OrderStatus } from '@prisma/client';

interface OrderItemInput {
  menuItemId: string;
  quantity: number;
}

interface CreateOrderInput {
  customerName: string;
  phoneNumber: string;
  deliveryAddress: string;
  notes?: string;
  items: OrderItemInput[];
}

export class OrderService {
  /**
   * 1. Public Order Placement Intake
   * Uses an isolated database transaction to ensure sequential number generation
   */
  static async createCustomerOrder(data: CreateOrderInput) {
    if (!data.items || data.items.length === 0) {
      throw new Error('An order must contain at least one item.');
    }

    return await prisma.$transaction(async (tx) => {
      // Generate the sequential order number (e.g., ORD-001)
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

      // Resolve and validate all menu items to calculate totals safely
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
          itemName: item.name,      // Historical snapshot auditing
          itemPrice: item.price,    // Historical snapshot auditing
          quantity: entry.quantity,
          subtotal: itemSubtotal
        });
      }

      // Persist the Order and its child line items to PostgreSQL
      return await tx.order.create({
        data: {
          orderNumber: formattedOrderNumber,
          customerName: data.customerName,
          phoneNumber: data.phoneNumber,
          deliveryAddress: data.deliveryAddress,
          notes: data.notes,
          total: runningTotal,
          status: OrderStatus.PENDING,
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
   * 2. Role-Based Dashboard Filtering Context
   * OWNER sees every single order in history.
   * CHEF sees active live-kitchen tickets (PENDING, PREPARING, READY) so they don't disappear.
   */
  static async getOrdersByRole(role: Role) {
    const filterCondition = role === Role.CHEF 
      ? { status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY] } } 
      : {};

    return await prisma.order.findMany({
      where: filterCondition,
      include: {
        items: true 
      },
      orderBy: {
        createdAt: role === Role.CHEF ? 'asc' : 'desc' // FIFO (First In, First Out) for Chefs; newest first for Owner
      }
    });
  }

  /**
   * 3. Ticket Resolution Pipeline (Chef Action)
   */
  static async markOrderAsCompleted(orderId: string) {
    // Verify the order exists first
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    if (existingOrder.status === OrderStatus.COMPLETED) {
      throw new Error('This order ticket has already been finalized.');
    }

    // Perform the atomic status update
    return await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.COMPLETED }, 
      include: { items: true }
    });
  }
}