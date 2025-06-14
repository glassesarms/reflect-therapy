import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
      <h1 className="text-xl font-semibold mb-4">Transcript</h1>
      <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
        {data.transcript || 'No transcript available.'}
      </pre>
    </main>
  );
}
