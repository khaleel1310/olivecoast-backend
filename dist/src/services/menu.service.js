"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
// 📁 backend/src/services/menu.service.ts
const client_1 = require("../prisma/client");
class MenuService {
    static async getPublicMenu() {
        return await client_1.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                items: {
                    where: { isAvailable: true }, // Keeps hidden/deleted items away from customers
                    orderBy: { name: 'asc' },
                },
            },
        });
    }
    // Fixed property key name from 'image' to 'imageUrl' to match your schema!
    static async createItem(data) {
        return client_1.prisma.menuItem.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                categoryId: data.categoryId,
                imageUrl: data.imageUrl || '/assets/placeholder.jpg',
            },
        });
    }
    // Added imageUrl tracking to the update engine
    static async updateItem(id, data) {
        return client_1.prisma.menuItem.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                categoryId: data.categoryId,
                imageUrl: data.imageUrl,
            },
        });
    }
    // 💡 Safe Soft-Delete: Flips availability status to hide it from menus without breaking database historical records
    static async deleteItem(id) {
        return client_1.prisma.menuItem.update({
            where: { id },
            data: { isAvailable: false }
        });
    }
}
exports.MenuService = MenuService;
