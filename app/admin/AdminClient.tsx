'use client';
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { FormEvent } from 'react'

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Props {
  past?: boolean;
}
export default function AdminClient({ past = false }: Props) {
  const router = useRouter();
  const { data, mutate } = useSWR('/api/bookings', fetcher);
  const { data: blocks, mutate: mutateBlocks } = useSWR('/api/blockouts', fetcher);

  const createRoom = async (id: string) => {
    const res = await fetch('/api/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const { adminUrl, error } = await res.json();
    mutate();
    if (!res.ok || !adminUrl) {
      alert(error || 'Failed to create room');
      return;
    }
    router.push(adminUrl);
  };

  const sendLink = async (id: string) => {
    const res = await fetch('/api/send-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      alert(error || 'Failed to send link');
    } else {
      alert('Link sent');
    }
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

  const bookings = data
    .filter((b: any) => {
      const ts = new Date(`${b.date}T${b.time}:00Z`).getTime();
      return past ? ts < Date.now() : ts >= Date.now();
    })
    .sort((a: any, b: any) => {
      const ta = new Date(`${a.date}T${a.time}:00Z`).getTime();
      const tb = new Date(`${b.date}T${b.time}:00Z`).getTime();
      return past ? tb - ta : ta - tb;
    });

  return (
    <main className="container mx-auto p-4">
      <div className="mb-4 flex gap-4 border-b">
        <button
          className={`px-4 py-2 -mb-px border-b-2 ${
            past ? 'border-transparent' : 'border-primary'
          }`}
          onClick={() => router.push('/admin')}
        >
          Upcoming
        </button>
        <button
          className={`px-4 py-2 -mb-px border-b-2 ${
            past ? 'border-primary' : 'border-transparent'
          }`}
          onClick={() => router.push('/admin/history')}
        >
          Past
        </button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookings.map((b: any) => (
            <Card key={b.id} className="border p-4 space-y-2">
              <div className="font-medium">
                {b.date} {b.time}
              </div>
              <div className="text-sm text-muted-foreground">{b.notes}</div>
              {b.status === 'cancelled' && !past ? (
                <div className="text-sm text-red-500">Cancelled</div>
              ) : (
                <div className="flex gap-2">
                  {!past && (
                    <>
                      {!b.adminUrl ? (
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
                        <>
                          <Button size="sm" onClick={() => router.push(b.adminUrl)}>
                            Open Room
                          </Button>
                          <Button size="sm" onClick={() => sendLink(b.id)}>
                            Send Link
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => cancelBooking(b.id)}>
                        Cancel
                      </Button>
                    </>
                  )}
                  {b.transcript && (
                    <Button size="sm" onClick={() => router.push(`/admin/transcripts/${b.id}`)}>
                      Transcript
                    </Button>
                  )}
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
