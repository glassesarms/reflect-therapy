'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  transcript: string;
}

export default function TranscriptClient({ transcript }: Props) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const download = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transcript.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Textarea
        value={transcript}
        readOnly
        className="h-96 whitespace-pre-wrap mb-4"
      />
      <div className="flex gap-2">
        <Button onClick={copyToClipboard}>{copied ? 'Copied!' : 'Copy'}</Button>
        <Button onClick={download} variant="secondary">Download</Button>
      </div>
    </>
  );
}
