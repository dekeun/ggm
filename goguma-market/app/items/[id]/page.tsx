import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ItemActions from './ItemActions'
import ImageGallery from './ImageGallery'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (!item) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === item.user_id

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-orange-500 transition text-lg leading-none">
            ←
          </Link>
          <h1 className="font-bold text-gray-800 text-base">상품 상세</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* 이미지 갤러리 */}
        {item.image_urls?.length > 0 ? (
          <ImageGallery urls={item.image_urls} />
        ) : (
          <div className="w-full aspect-square bg-orange-100 rounded-2xl flex items-center justify-center text-7xl">
            🍠
          </div>
        )}

        {/* 판매자 정보 */}
        <div className="bg-white rounded-2xl border border-orange-100 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-lg">
            👤
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{item.seller_nickname}</p>
            <p className="text-xs text-gray-400">{timeAgo(item.created_at)}</p>
          </div>
          {item.status === 'sold' && (
            <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-2.5 py-1 rounded-full">
              판매완료
            </span>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="bg-white rounded-2xl border border-orange-100 px-5 py-5 space-y-4">
          <div>
            <span className="inline-block text-xs bg-orange-100 text-orange-600 font-medium px-2.5 py-1 rounded-full mb-2">
              {item.category}
            </span>
            <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
          </div>

          <p className="text-2xl font-bold text-gray-900">
            {item.price.toLocaleString('ko-KR')}원
          </p>

          <hr className="border-orange-50" />

          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {item.description}
          </p>
        </div>

        {/* 본인 글일 때만 수정/삭제 버튼 표시 */}
        {isOwner && <ItemActions id={item.id} />}
      </main>
    </div>
  )
}
