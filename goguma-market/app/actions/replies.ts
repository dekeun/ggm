'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getSellerUserId(itemId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from('items').select('user_id').eq('id', itemId).single()
  return data?.user_id ?? null
}

export async function createReply(commentId: string, itemId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }
  if (!content.trim()) return { error: '답글 내용을 입력해주세요.' }

  const sellerUserId = await getSellerUserId(itemId, supabase)
  if (user.id !== sellerUserId) return { error: '판매자만 답글을 달 수 있어요.' }

  const nickname = user.user_metadata?.nickname ?? user.email ?? '알 수 없음'

  const { data, error } = await supabase
    .from('replies')
    .insert({ comment_id: commentId, item_id: itemId, user_id: user.id, nickname, content: content.trim() })
    .select()
    .single()

  if (error) return { error: '답글 등록 중 오류가 생겼어요.' }

  revalidatePath(`/items/${itemId}`)
  return { reply: data }
}

export async function updateReply(replyId: string, itemId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }
  if (!content.trim()) return { error: '답글 내용을 입력해주세요.' }

  const { error } = await supabase
    .from('replies')
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq('id', replyId)
    .eq('user_id', user.id)

  if (error) return { error: '답글 수정 중 오류가 생겼어요.' }

  revalidatePath(`/items/${itemId}`)
  return {}
}

export async function deleteReply(replyId: string, itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }

  const { error } = await supabase
    .from('replies')
    .delete()
    .eq('id', replyId)
    .eq('user_id', user.id)

  if (error) return { error: '답글 삭제 중 오류가 생겼어요.' }

  revalidatePath(`/items/${itemId}`)
  return {}
}
