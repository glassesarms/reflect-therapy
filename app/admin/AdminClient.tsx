'use client';
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminClient() {
  const router = useRouter();
  const { data, mutate } = useSWR('/api/bookings', fetcher);

  const createRoom = async (id: string) => {
    const res = await fetch('/api/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const { url } = await res.json();
    mutate();
    router.push(`/room?url=${encodeURIComponent(url)}`);
  };

  if (!data) return <p>Loading...</p>

  return (
    <main className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.map((b: any) => (
            <Card key={b.id} className="border p-4">
              <div className="font-medium">
                {b.date} {b.time}
              </div>
              <div className="text-sm text-muted-foreground mb-2">{b.notes}</div>
              {!b.roomUrl ? (
                <Button size="sm" onClick={() => createRoom(b.id)}>
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
            </Card>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
