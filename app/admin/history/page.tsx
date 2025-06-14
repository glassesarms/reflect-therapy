import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminClient from '../AdminClient';

export default function HistoryPage() {
  const cookie = cookies().get('auth');
  if (!cookie) {
    redirect('/login');
  }
  return <AdminClient past />;
}
