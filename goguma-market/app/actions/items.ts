'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type ItemState = {
  error?: string
} | null

export async function createItem(prevState: ItemState, formData: FormData): Promise<ItemState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요해요.' }
  }

  const title = formData.get('title') as string
  const price = formData.get('price') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const imageUrls = formData.getAll('image_url') as string[]

  if (!title || !price || !category || !description) {
    return { error: '모든 항목을 입력해주세요.' }
  }

  const priceNum = parseInt(price.replace(/,/g, ''), 10)
  if (isNaN(priceNum) || priceNum < 0) {
    return { error: '올바른 가격을 입력해주세요.' }
  }

  const nickname = user.user_metadata?.nickname ?? user.email ?? '알 수 없음'

  const { error } = await supabase.from('items').insert({
    user_id: user.id,
    title: title.trim(),
    price: priceNum,
    category,
    description: description.trim(),
    seller_nickname: nickname,
    image_urls: imageUrls.filter(Boolean),
  })

  if (error) {
    return { error: '등록 중 오류가 생겼어요. 다시 시도해주세요.' }
  }

  redirect('/')
}

export async function updateItem(id: string, prevState: ItemState, formData: FormData): Promise<ItemState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '로그인이 필요해요.' }
  }

  const title = formData.get('title') as string
  const price = formData.get('price') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const imageUrls = formData.getAll('image_url') as string[]

  if (!title || !price || !category || !description) {
    return { error: '모든 항목을 입력해주세요.' }
  }

  const priceNum = parseInt(price.replace(/,/g, ''), 10)
  if (isNaN(priceNum) || priceNum < 0) {
    return { error: '올바른 가격을 입력해주세요.' }
  }

  const { error } = await supabase
    .from('items')
    .update({
      title: title.trim(),
      price: priceNum,
      category,
      description: description.trim(),
      image_urls: imageUrls.filter(Boolean),
    })
    .eq('id', id)

  if (error) {
    return { error: '수정 중 오류가 생겼어요. 다시 시도해주세요.' }
  }

  redirect(`/items/${id}`)
}

export async function deleteItem(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 삭제 전 이미지 URL 조회
  const { data: item } = await supabase
    .from('items')
    .select('image_urls')
    .eq('id', id)
    .single()

  // Storage에서 이미지 파일 삭제
  if (item?.image_urls?.length) {
    const paths = item.image_urls
      .map((url: string) => url.split('/item-images/')[1])
      .filter(Boolean)
    if (paths.length) {
      await supabase.storage.from('item-images').remove(paths)
    }
  }

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('삭제 중 오류가 생겼어요.')
  }

  redirect('/')
}
