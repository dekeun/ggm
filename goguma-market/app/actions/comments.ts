'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createComment(itemId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }
  if (!content.trim()) return { error: '댓글 내용을 입력해주세요.' }

  const nickname = user.user_metadata?.nickname ?? user.email ?? '알 수 없음'

  const { data, error } = await supabase
    .from('comments')
    .insert({
      item_id: itemId,
      user_id: user.id,
      nickname,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) return { error: '댓글 등록 중 오류가 생겼어요.' }

  revalidatePath(`/items/${itemId}`)
  return { comment: data }
}

export async function updateComment(commentId: string, itemId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }
  if (!content.trim()) return { error: '댓글 내용을 입력해주세요.' }

  const { error } = await supabase
    .from('comments')
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: '댓글 수정 중 오류가 생겼어요.' }

  revalidatePath(`/items/${itemId}`)
  return {}
}

export async function deleteComment(commentId: string, itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: '댓글 삭제 중 오류가 생겼어요.' }

  revalidatePath(`/items/${itemId}`)
  return {}
}
