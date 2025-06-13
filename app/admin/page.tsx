import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export default function AdminPage() {
  const cookie = cookies().get('auth');
  if (!cookie) {
    redirect('/login');
  }
  return <AdminClient />;
}
