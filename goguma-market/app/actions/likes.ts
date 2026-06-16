'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('item_id', itemId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('likes').insert({ item_id: itemId, user_id: user.id })
  }

  revalidatePath(`/items/${itemId}`)
  return { liked: !existing }
}

export async function getLikeStatus(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('item_id', itemId)

  if (!user) return { liked: false, count: count ?? 0 }

  const { data: myLike } = await supabase
    .from('likes')
    .select('id')
    .eq('item_id', itemId)
    .eq('user_id', user.id)
    .single()

  return { liked: !!myLike, count: count ?? 0 }
}
