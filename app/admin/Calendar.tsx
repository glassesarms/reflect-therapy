'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

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

  const today = new Date()
  const ref = new Date(today)
  if (past) ref.setDate(ref.getDate() - 7)
  const weekStart = new Date(ref)
  weekStart.setDate(ref.getDate() - weekStart.getDay())

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const dayKeys = days.map(d => d.toISOString().slice(0, 10))

  const byDay = new Map<string, Booking[]>()
  dayKeys.forEach(d => byDay.set(d, []))
  bookings.forEach(b => {
    if (byDay.has(b.date)) byDay.get(b.date)!.push(b)
  })
  dayKeys.forEach(d => byDay.get(d)!.sort((a, b) => a.time.localeCompare(b.time)))

  const hours = Array.from({ length: 10 }, (_, i) => 8 + i)

  const cellClass = 'border min-h-[4rem] p-1 text-xs'

  return (
    <div className="overflow-x-auto">
      <div className="grid" style={{ gridTemplateColumns: '80px repeat(7, minmax(140px,1fr))' }}>
        <div></div>
        {days.map(d => (
          <div key={d.toDateString()} className="border p-2 text-center font-medium bg-muted">
            {d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
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
                    <div key={b.id} className="space-y-1">
                      <div className="font-medium truncate" title={b.notes}>{b.notes}</div>
                      {b.status === 'cancelled' && !past ? (
                        <div className="text-red-500">Cancelled</div>
                      ) : (
                        <div className="flex gap-1 flex-wrap">
                          {!past && (
                            <>
                              {!b.adminUrl ? (
                                <Button
                                  size="sm"
                                  onClick={() => createRoom(b.id)}
                                  variant={
                                    new Date(`${b.date}T${b.time}:00Z`).getTime() - Date.now() > 15 * 60 * 1000
                                      ? 'secondary'
                                      : 'default'
                                  }
                                >
                                  Create
                                </Button>
                              ) : (
                                <>
                                  <Button size="sm" onClick={() => router.push(b.adminUrl!)}>
                                    Open
                                  </Button>
                                  <Button size="sm" onClick={() => sendLink(b.id)}>
                                    Send
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="destructive" onClick={() => cancelBooking(b.id)}>
                                Cancel
                              </Button>
                            </>
                          )}
                          {(past || b.transcript) && (
                            <Button
                              size="sm"
                              onClick={() => router.push(`/admin/transcripts/${b.id}`)}
                              variant={b.transcript ? 'default' : 'secondary'}
                              disabled={!b.transcript}
                            >
                              Transcript
                            </Button>
                          )}
                        </div>
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
  )
}
