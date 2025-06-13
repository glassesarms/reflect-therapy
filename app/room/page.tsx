'use client';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function RoomPage() {
  const params = useSearchParams();
  const url = params.get('url');

  if (!url) return <p className="p-4">No room URL provided.</p>;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard');
  };

  return (
    <main className="container mx-auto p-4 space-y-4">
      <Button onClick={copyLink}>Copy Link</Button>
      <iframe
        src={url}
        className="w-full h-[80vh] border"
        allow="camera; microphone"
      />
    </main>
  );
}
