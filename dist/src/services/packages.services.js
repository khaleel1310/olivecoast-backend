"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePackage = exports.getAddons = exports.getPackages = void 0;
// src/services/packages.service.ts
const client_1 = require("../prisma/client");
const getPackages = async () => {
    return client_1.prisma.package.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
    });
};
exports.getPackages = getPackages;
const getAddons = async () => {
    return client_1.prisma.addon.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
    });
};
exports.getAddons = getAddons;
const updatePackage = async (id, data) => {
    return client_1.prisma.package.update({ where: { id }, data });
};
exports.updatePackage = updatePackage;
