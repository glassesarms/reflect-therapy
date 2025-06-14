'use client';
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { FormEvent } from 'react'

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminClient() {
  const router = useRouter();
  const { data, mutate } = useSWR('/api/bookings', fetcher);
  const { data: blocks, mutate: mutateBlocks } = useSWR('/api/blockouts', fetcher);

  const createRoom = async (id: string) => {
    const res = await fetch('/api/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const { url, error } = await res.json();
    mutate();
    if (!res.ok || !url) {
      alert(error || 'Failed to create room');
      return;
    }
    router.push(`/room?url=${encodeURIComponent(url)}`);
  };

  const cancelBooking = async (id: string) => {
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    mutate();
  };

  const addBlockout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    await fetch('/api/blockouts', {
      method: 'POST',
      body: JSON.stringify({
        date: formData.get('date'),
        time: formData.get('time'),
        reason: formData.get('reason'),
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    form.reset();
    mutateBlocks();
  };

  const deleteBlock = async (id: string) => {
    await fetch(`/api/blockouts/${id}`, { method: 'DELETE' });
    mutateBlocks();
  };

  if (!data || !blocks) return <p>Loading...</p>

  return (
    <main className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.map((b: any) => (
            <Card key={b.id} className="border p-4 space-y-2">
              <div className="font-medium">
                {b.date} {b.time}
              </div>
              <div className="text-sm text-muted-foreground">{b.notes}</div>
              {b.status === 'cancelled' ? (
                <div className="text-sm text-red-500">Cancelled</div>
              ) : (
                <div className="flex gap-2">
                  {!b.roomUrl ? (
                    <Button
                      size="sm"
                      onClick={() => createRoom(b.id)}
                      variant={
                        new Date(`${b.date}T${b.time}:00Z`).getTime() - Date.now() >
                        15 * 60 * 1000
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      Create Room
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => router.push(`/room?url=${encodeURIComponent(b.roomUrl)}`)}
                    >
                      Open Room
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => cancelBooking(b.id)}>
                    Cancel
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Blocked Times</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {blocks.map((b: any) => (
            <Card key={b.id} className="border p-4 flex justify-between">
              <div>
                {b.date} {b.time} {b.reason && `- ${b.reason}`}
              </div>
              <Button size="sm" variant="destructive" onClick={() => deleteBlock(b.id)}>
                Remove
              </Button>
            </Card>
          ))}
          <form onSubmit={addBlockout} className="space-y-2">
            <input type="date" name="date" required className="border p-1" />
            <input type="time" name="time" required className="border p-1" />
            <input type="text" name="reason" placeholder="Reason" className="border p-1" />
            <Button type="submit" size="sm" className="ml-2">Add</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
