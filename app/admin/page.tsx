'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminPage() {
  const { data, mutate } = useSWR('/api/bookings', fetcher);

  const createRoom = async (id: string) => {
    const res = await fetch('/api/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const { url } = await res.json();
    alert(`Room created: ${url}`);
    mutate();
  };

  if (!data) return <p>Loading...</p>;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      <ul className="space-y-2">
        {data.map((b: any) => (
          <li key={b.id} className="border p-2">
            <div>{b.date} {b.time}</div>
            <div>{b.notes}</div>
            {!b.roomUrl && (
              <button
                className="bg-green-600 text-white px-2 py-1 mt-2"
                onClick={() => createRoom(b.id)}
              >
                Create Room
              </button>
            )}
            {b.roomUrl && <div>Room: {b.roomUrl}</div>}
          </li>
        ))}
      </ul>
    </main>
  );
}
