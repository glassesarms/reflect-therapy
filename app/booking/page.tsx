'use client';
import { useState } from 'react';

export default function BookingPage() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time, notes })
    });
    alert('Booking requested');
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Book a Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="date"
          className="border p-2 w-full"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
        <input
          type="time"
          className="border p-2 w-full"
          value={time}
          onChange={e => setTime(e.target.value)}
          required
        />
        <textarea
          className="border p-2 w-full"
          placeholder="Notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2" type="submit">
          Book
        </button>
      </form>
    </main>
  );
}
