import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'

export default function CalendarPage() {
  const cookie = cookies().get('auth')
  if (!cookie) {
    redirect('/login')
  }
  return <CalendarClient />
}
