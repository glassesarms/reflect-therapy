'use client'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import Calendar from '../Calendar'
import { Button } from '@/components/ui/button'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CalendarClient() {
  const router = useRouter()
  const { data, mutate } = useSWR('/api/bookings', fetcher)

  const createRoom = async (id: string) => {
    const res = await fetch('/api/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    const { adminUrl, error } = await res.json()
    mutate()
    if (!res.ok || !adminUrl) {
      alert(error || 'Failed to create room')
      return
    }
    router.push(adminUrl)
  }

  const sendLink = async (id: string) => {
    const res = await fetch('/api/send-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (!res.ok) {
      const { error } = await res.json()
      alert(error || 'Failed to send link')
    } else {
      alert('Link sent')
    }
  }

  const cancelBooking = async (id: string) => {
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
    mutate()
  }

  if (!data) return <p>Loading...</p>

  const bookings = data.sort((a: any, b: any) => {
    const ta = new Date(`${a.date}T${a.time}:00Z`).getTime()
    const tb = new Date(`${b.date}T${b.time}:00Z`).getTime()
    return ta - tb
  })

  return (
    <main className="container mx-auto p-4">
      <Button className="mb-4" variant="outline" onClick={() => router.push('/admin')}>
        Back to Admin
      </Button>
      <Calendar
        bookings={bookings}
        past={false}
        createRoom={createRoom}
        sendLink={sendLink}
        cancelBooking={cancelBooking}
      />
    </main>
  )
}
