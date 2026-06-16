import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProfile } from '@/app/actions/profile'
import ProfileEditor from './ProfileEditor'

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

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profile, itemsResult] = await Promise.all([
    getProfile(id),
    supabase
      .from('items')
      .select('id, title, price, category, created_at, status, image_urls, seller_nickname')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
  ])

  const items = itemsResult.data ?? []

  const sellerNickname = profile?.nickname
    || (items[0] as { seller_nickname?: string })?.seller_nickname
    || '알 수 없음'

  if (!profile && items.length === 0) notFound()

  const isOwnProfile = user?.id === id

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-orange-500 transition text-lg leading-none">←</Link>
          <h1 className="font-bold text-gray-800 text-base">프로필</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* 프로필 카드 — 본인이면 인라인 편집, 다른 사람이면 읽기 전용 */}
        {isOwnProfile ? (
          <ProfileEditor
            nickname={sellerNickname}
            initialAvatarUrl={profile?.avatar_url ?? null}
            initialBio={profile?.bio ?? ''}
            itemCount={items.length}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-orange-100 px-6 py-6 flex items-start gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${sellerNickname} 프로필`}
                className="w-20 h-20 rounded-full object-cover border-2 border-orange-200 flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-4xl flex-shrink-0">
                👤
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-lg">{sellerNickname}</p>
              {profile?.bio ? (
                <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <p className="text-sm text-gray-300 mt-1 italic">아직 자기소개가 없어요.</p>
              )}
              <p className="text-xs text-gray-400 mt-2">판매 상품 {items.length}개</p>
            </div>
          </div>
        )}

        {/* 이 사람의 글 모아보기 */}
        <div className="bg-white rounded-2xl border border-orange-100 px-5 py-4">
          <h2 className="font-bold text-gray-800 mb-3">
            판매 상품 <span className="text-orange-500">{items.length}</span>
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">아직 등록된 상품이 없어요.</p>
          ) : (
            <ul className="divide-y divide-orange-50">
              {items.map(item => (
                <li key={item.id}>
                  <Link href={`/items/${item.id}`} className="flex items-center gap-3 py-3 hover:bg-orange-50/60 rounded-xl px-2 -mx-2 transition">
                    <div className="w-14 h-14 rounded-xl bg-orange-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl">
                      {item.image_urls?.length > 0 ? (
                        <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover" />
                      ) : '🍠'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.category} · {timeAgo(item.created_at)}</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{item.price.toLocaleString('ko-KR')}원</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 font-medium
                      ${item.status === 'sold' ? 'bg-gray-200 text-gray-500' : 'bg-orange-100 text-orange-600'}`}>
                      {item.status === 'sold' ? '판매완료' : '판매중'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
