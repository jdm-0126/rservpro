import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

export type Booking = {
  id: string;
  referenceNumber: string; // e.g. CL-20260518-A3F2
  villaId: string;
  villaName: string;
  userId: string;
  userName: string;
  userEmail: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string; // ISO timestamp
};

export type BlockedRange = {
  id: string;
  villaId: string;
  startDate: string;
  endDate: string;
  reason?: string;
};

export type AdminNotification = {
  id: string;
  bookingId: string;
  referenceNumber: string;
  villaName: string;
  userName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  read: boolean;
  createdAt: string;
};

type BookingContextType = {
  bookings: Booking[];
  blockedRanges: BlockedRange[];
  notifications: AdminNotification[];
  unreadCount: number;
  addBooking: (booking: Omit<Booking, 'id' | 'referenceNumber' | 'createdAt'>) => Promise<Booking>;
  cancelBooking: (id: string) => Promise<void>;
  addBlockedRange: (range: Omit<BlockedRange, 'id'>) => Promise<void>;
  removeBlockedRange: (id: string) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  getBookedDatesForVilla: (villaId: string) => string[];
  getBlockedDatesForVilla: (villaId: string) => string[];
  isDateRangeAvailable: (villaId: string, checkIn: string, checkOut: string) => boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function expandDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function generateRefNumber(): string {
  const date = new Date();
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `CL-${datePart}-${rand}`;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const BookingContext = createContext<BookingContextType>({} as BookingContextType);

const BOOKINGS_KEY   = 'villa_bookings_v3';
const BLOCKED_KEY    = 'villa_blocked_ranges';
const NOTIFS_KEY     = 'villa_admin_notifications';

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings]           = useState<Booking[]>([]);
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(BOOKINGS_KEY),
      AsyncStorage.getItem(BLOCKED_KEY),
      AsyncStorage.getItem(NOTIFS_KEY),
    ]).then(([b, bl, n]) => {
      if (b)  setBookings(JSON.parse(b));
      if (bl) setBlockedRanges(JSON.parse(bl));
      if (n)  setNotifications(JSON.parse(n));
    });
  }, []);

  const persistBookings = async (data: Booking[]) => {
    setBookings(data);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(data));
  };
  const persistBlocked = async (data: BlockedRange[]) => {
    setBlockedRanges(data);
    await AsyncStorage.setItem(BLOCKED_KEY, JSON.stringify(data));
  };
  const persistNotifs = async (data: AdminNotification[]) => {
    setNotifications(data);
    await AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(data));
  };

  const addBooking = async (booking: Omit<Booking, 'id' | 'referenceNumber' | 'createdAt'>): Promise<Booking> => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      referenceNumber: generateRefNumber(),
      createdAt: new Date().toISOString(),
    };
    await persistBookings([...bookings, newBooking]);

    // Create admin notification
    const notif: AdminNotification = {
      id: `n-${Date.now()}`,
      bookingId: newBooking.id,
      referenceNumber: newBooking.referenceNumber,
      villaName: newBooking.villaName,
      userName: newBooking.userName,
      checkIn: newBooking.checkIn,
      checkOut: newBooking.checkOut,
      guests: newBooking.guests,
      totalPrice: newBooking.totalPrice,
      read: false,
      createdAt: newBooking.createdAt,
    };
    await persistNotifs([notif, ...notifications]);

    return newBooking;
  };

  const cancelBooking = async (id: string) => {
    await persistBookings(bookings.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b));
  };

  const addBlockedRange = async (range: Omit<BlockedRange, 'id'>) => {
    await persistBlocked([...blockedRanges, { ...range, id: Date.now().toString() }]);
  };

  const removeBlockedRange = async (id: string) => {
    await persistBlocked(blockedRanges.filter((r) => r.id !== id));
  };

  const markNotificationsRead = async () => {
    await persistNotifs(notifications.map((n) => ({ ...n, read: true })));
  };

  const getBookedDatesForVilla = useCallback((villaId: string): string[] => {
    return bookings
      .filter((b) => b.villaId === villaId && b.status !== 'cancelled')
      .flatMap((b) => expandDateRange(b.checkIn, b.checkOut));
  }, [bookings]);

  const getBlockedDatesForVilla = useCallback((villaId: string): string[] => {
    return blockedRanges
      .filter((r) => r.villaId === villaId)
      .flatMap((r) => expandDateRange(r.startDate, r.endDate));
  }, [blockedRanges]);

  const isDateRangeAvailable = useCallback((villaId: string, checkIn: string, checkOut: string): boolean => {
    const requested = expandDateRange(checkIn, checkOut);
    const booked  = new Set(getBookedDatesForVilla(villaId));
    const blocked = new Set(getBlockedDatesForVilla(villaId));
    return requested.every((d) => !booked.has(d) && !blocked.has(d));
  }, [getBookedDatesForVilla, getBlockedDatesForVilla]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <BookingContext.Provider value={{
      bookings, blockedRanges, notifications, unreadCount,
      addBooking, cancelBooking,
      addBlockedRange, removeBlockedRange, markNotificationsRead,
      getBookedDatesForVilla, getBlockedDatesForVilla, isDateRangeAvailable,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBookings = () => useContext(BookingContext);
