// 📁 src/services/packages.service.ts
import { prisma } from '../prisma/client';

export const getPackages = async () => {
  return prisma.package.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
};

export const getAddons = async () => {
  return prisma.addon.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
};

export const getDrinks = async () => {
  return prisma.drink.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
};

export const updatePackage = async (id: string, data: any) => {
  return prisma.package.update({ where: { id }, data });
};