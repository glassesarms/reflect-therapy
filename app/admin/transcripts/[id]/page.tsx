import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TranscriptClient from '../TranscriptClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props { params: { id: string } }

export default async function TranscriptPage({ params }: Props) {
  const cookie = cookies().get('auth');
  if (!cookie) {
    redirect('/login');
  }
  const res = await fetch(`${process.env.SITE_URL || ''}/api/bookings/${params.id}/transcript`, { cache: 'no-store' });
  if (!res.ok) {
    return <p className="p-4 text-red-500">Transcript not found.</p>;
  }
  const data = await res.json();
  return (
    <main className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <TranscriptClient transcript={data.transcript || ''} />
        </CardContent>
      </Card>
    </main>
  );
}
