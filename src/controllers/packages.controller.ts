// src/controllers/packages.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/packages.services';

export const getPackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packages = await svc.getPackages();
    res.json({ success: true, data: packages });
  } catch (err) { next(err); }
};

export const getAddons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addons = await svc.getAddons();
    res.json({ success: true, data: addons });
  } catch (err) { next(err); }
};

export const getDrinks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const drinks = await svc.getDrinks();
    res.json({ success: true, data: drinks });
  } catch (err) { next(err); }
};

export const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const pkg = await svc.updatePackage(id as string, req.body);
    res.json({ success: true, data: pkg });
  } catch (err) {
    next(err);
  }
};