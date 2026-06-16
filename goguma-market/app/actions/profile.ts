'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
  return data
}

export async function upsertProfile(bio: string, nickname: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { error } = await supabase.from('profiles').upsert({
    user_id: user.id,
    bio: bio.trim(),
    nickname: nickname.trim(),
    updated_at: new Date().toISOString(),
  })

  if (error) return { error: '프로필 저장 중 오류가 생겼어요.' }

  revalidatePath(`/users/${user.id}`)
  return {}
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) return { error: '파일을 선택해주세요.' }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: '이미지 업로드 중 오류가 생겼어요.' }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  const { error: updateError } = await supabase.from('profiles').upsert({
    user_id: user.id,
    avatar_url: publicUrl,
    updated_at: new Date().toISOString(),
  })

  if (updateError) return { error: '프로필 업데이트 중 오류가 생겼어요.' }

  revalidatePath(`/users/${user.id}`)
  return { url: publicUrl }
}

export async function deleteAvatar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif']
  await Promise.all(exts.map(ext =>
    supabase.storage.from('avatars').remove([`${user.id}/avatar.${ext}`])
  ))

  await supabase.from('profiles').update({ avatar_url: null, updated_at: new Date().toISOString() }).eq('user_id', user.id)

  revalidatePath(`/users/${user.id}`)
  return {}
}
