'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Booking {
  id: string
  date: string
  time: string
  notes: string
  adminUrl?: string
  status?: 'booked' | 'cancelled'
  transcript?: string
}

interface Props {
  bookings: Booking[]
  past: boolean
  createRoom: (id: string) => Promise<void>
  sendLink: (id: string) => Promise<void>
  cancelBooking: (id: string) => Promise<void>
}

export default function Calendar({ bookings, past, createRoom, sendLink, cancelBooking }: Props) {
  const router = useRouter()

  const [weekOffset, setWeekOffset] = useState(past ? -1 : 0)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const base = new Date()
  base.setDate(base.getDate() + weekOffset * 7 + (past ? -7 : 0))
  const weekStart = new Date(base)
  weekStart.setDate(base.getDate() - weekStart.getDay())

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const dayKeys = days.map(d => d.toISOString().slice(0, 10))
  const todayKey = new Date().toISOString().slice(0, 10)

  const byDay = new Map<string, Booking[]>()
  dayKeys.forEach(d => byDay.set(d, []))
  bookings.forEach(b => {
    if (byDay.has(b.date)) byDay.get(b.date)!.push(b)
  })
  dayKeys.forEach(d => byDay.get(d)!.sort((a, b) => a.time.localeCompare(b.time)))

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const cellClass = 'border min-h-[4rem] p-1 text-xs'

  useEffect(() => {
    const h = new Date().getHours()
    if (scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, (h - 4) * 64)
    }
  }, [])

  return (
    <div className="md:flex">
      <div className="flex-1 overflow-x-auto">
        <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="icon" onClick={() => setWeekOffset(weekOffset - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {weekStart.toLocaleDateString()} -{' '}
          {days[6].toLocaleDateString()}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setWeekOffset(weekOffset + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns: '80px repeat(7, minmax(140px,1fr))' }}>
          <div></div>
          {days.map(d => (
            <div
              key={d.toDateString()}
              className={`border p-2 text-center font-medium bg-muted ${
                d.toISOString().slice(0, 10) === todayKey ? 'bg-primary/10' : ''
              }`}
            >
              {d.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          ))}
        {hours.map(h => (
          <>
            <div key={`t-${h}`} className="border p-2 text-right text-sm bg-muted">
              {String(h).padStart(2, '0')}:00
            </div>
            {dayKeys.map(dk => {
              const cells = (byDay.get(dk) || []).filter(b => b.time.startsWith(String(h).padStart(2, '0')))
              return (
                <div key={`${dk}-${h}`} className={cellClass}>
                  {cells.map(b => (
                    <div
                      key={b.id}
                      className={`rounded-md p-2 shadow-sm cursor-pointer hover:bg-accent space-y-1 ${
                        selectedBooking?.id === b.id ? 'ring-2 ring-primary' : 'bg-card'
                      } ${b.status === 'cancelled' ? 'opacity-50' : ''}`}
                      onClick={() => setSelectedBooking(b)}
                    >
                      <div className="font-medium truncate" title={b.notes}>{b.notes}</div>
                      {b.status === 'cancelled' && !past && (
                        <div className="text-red-500 text-xs">Cancelled</div>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </>
        ))}
        </div>
      </div>
      </div>
      {selectedBooking && (
        <aside className="md:w-80 md:ml-4 mt-4 md:mt-0">
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
            <div className="font-semibold text-lg">Booking Details</div>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium">Date:</span> {selectedBooking.date}
              </div>
              <div>
                <span className="font-medium">Time:</span> {selectedBooking.time}
              </div>
              <div>
                <span className="font-medium">Notes:</span> {selectedBooking.notes}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!past && (
                <>
                  {!selectedBooking.adminUrl ? (
                    <Button
                      size="sm"
                      onClick={() => createRoom(selectedBooking.id)}
                      variant={
                        new Date(`${selectedBooking.date}T${selectedBooking.time}:00Z`).getTime() - Date.now() >
                        15 * 60 * 1000
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      Create Room
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => router.push(selectedBooking.adminUrl!)}>
                        Open Room
                      </Button>
                      <Button size="sm" onClick={() => sendLink(selectedBooking.id)}>Send Link</Button>
                    </>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => cancelBooking(selectedBooking.id)}>
                    Cancel Booking
                  </Button>
                </>
              )}
              {(past || selectedBooking.transcript) && (
                <Button
                  size="sm"
                  onClick={() => router.push(`/admin/transcripts/${selectedBooking.id}`)}
                  variant={selectedBooking.transcript ? 'default' : 'secondary'}
                  disabled={!selectedBooking.transcript}
                >
                  View Transcript
                </Button>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
