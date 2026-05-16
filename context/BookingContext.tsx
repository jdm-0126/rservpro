import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled';

export type Booking = {
  id: string;
  villaId: string;
  villaName: string;
  userId: string;
  userName: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  guests: number;
  totalPrice: number;
  status: BookingStatus;
};

// Admin-managed blocked date ranges per villa
export type BlockedRange = {
  id: string;
  villaId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason?: string;
};

type BookingContextType = {
  bookings: Booking[];
  blockedRanges: BlockedRange[];
  addBooking: (booking: Omit<Booking, 'id'>) => Promise<Booking>;
  cancelBooking: (id: string) => Promise<void>;
  addBlockedRange: (range: Omit<BlockedRange, 'id'>) => Promise<void>;
  removeBlockedRange: (id: string) => Promise<void>;
  getBookedDatesForVilla: (villaId: string) => string[];
  getBlockedDatesForVilla: (villaId: string) => string[];
  isDateRangeAvailable: (villaId: string, checkIn: string, checkOut: string) => boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns all YYYY-MM-DD strings between start and end (inclusive) */
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

// ─── Context ──────────────────────────────────────────────────────────────────

const BookingContext = createContext<BookingContextType>({} as BookingContextType);

const BOOKINGS_KEY = 'villa_bookings_v2';
const BLOCKED_KEY = 'villa_blocked_ranges';

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);

  // Load from storage on mount
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(BOOKINGS_KEY),
      AsyncStorage.getItem(BLOCKED_KEY),
    ]).then(([b, bl]) => {
      if (b) setBookings(JSON.parse(b));
      if (bl) setBlockedRanges(JSON.parse(bl));
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

  const addBooking = async (booking: Omit<Booking, 'id'>): Promise<Booking> => {
    const newBooking: Booking = { ...booking, id: Date.now().toString() };
    await persistBookings([...bookings, newBooking]);
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
    const booked = new Set(getBookedDatesForVilla(villaId));
    const blocked = new Set(getBlockedDatesForVilla(villaId));
    return requested.every((d) => !booked.has(d) && !blocked.has(d));
  }, [getBookedDatesForVilla, getBlockedDatesForVilla]);

  return (
    <BookingContext.Provider value={{
      bookings, blockedRanges,
      addBooking, cancelBooking,
      addBlockedRange, removeBlockedRange,
      getBookedDatesForVilla, getBlockedDatesForVilla,
      isDateRangeAvailable,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBookings = () => useContext(BookingContext);
