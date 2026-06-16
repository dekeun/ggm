import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditForm from './EditForm'

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: item }, { data: { user } }] = await Promise.all([
    supabase.from('items').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!item) notFound()
  if (!user || user.id !== item.user_id) redirect('/')

  return <EditForm item={item} />
}
