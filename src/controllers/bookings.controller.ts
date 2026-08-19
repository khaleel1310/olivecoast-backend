import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/bookings.service';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await svc.createBooking(req.body);
    res.status(201).json({ success: true, data: booking, message: 'Booking request submitted!' });
  } catch (err) {
    next(err);
  }
};

export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query as { status?: string };
    const bookings = await svc.getBookings(status);
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const booking = await svc.getBooking(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const booking = await svc.updateStatus(id, req.body.status);
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const getByNumber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const num = req.params.num as string;
    const booking = await svc.getByNumber(num);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};