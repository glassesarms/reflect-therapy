export interface Booking {
  id: string;
  date: string;
  time: string;
  notes: string;
  roomUrl?: string;
}

export const bookings: Booking[] = [];
