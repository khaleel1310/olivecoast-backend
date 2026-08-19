"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByNumber = exports.updateStatus = exports.getBooking = exports.getBookings = exports.createBooking = void 0;
const svc = __importStar(require("../services/bookings.service"));
const createBooking = async (req, res, next) => {
    try {
        const booking = await svc.createBooking(req.body);
        res.status(201).json({ success: true, data: booking, message: 'Booking request submitted!' });
    }
    catch (err) {
        next(err);
    }
};
exports.createBooking = createBooking;
const getBookings = async (req, res, next) => {
    try {
        const { status } = req.query;
        const bookings = await svc.getBookings(status);
        res.json({ success: true, data: bookings });
    }
    catch (err) {
        next(err);
    }
};
exports.getBookings = getBookings;
const getBooking = async (req, res, next) => {
    try {
        const id = req.params.id;
        const booking = await svc.getBooking(id);
        if (!booking)
            return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: booking });
    }
    catch (err) {
        next(err);
    }
};
exports.getBooking = getBooking;
const updateStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const booking = await svc.updateStatus(id, req.body.status);
        res.json({ success: true, data: booking });
    }
    catch (err) {
        next(err);
    }
};
exports.updateStatus = updateStatus;
const getByNumber = async (req, res, next) => {
    try {
        const num = req.params.num;
        const booking = await svc.getByNumber(num);
        if (!booking)
            return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: booking });
    }
    catch (err) {
        next(err);
    }
};
exports.getByNumber = getByNumber;
