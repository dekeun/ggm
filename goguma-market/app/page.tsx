import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import Link from 'next/link'
import { Suspense } from 'react'
import FilterTabs from '@/app/components/FilterTabs'

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

export default async function Home({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('items')
    .select('id, title, price, category, seller_nickname, created_at, status, image_urls')
    .order('created_at', { ascending: false })

  if (filter === 'sold') {
    query = query.eq('status', 'sold')
  } else if (filter === 'selling') {
    query = query.neq('status', 'sold')
  }

  const { data: items } = await query

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-orange-600 text-lg">
            <span>🍠</span>
            <span>고구마마켓</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/items/new"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  + 판매하기
                </Link>
                <form action={logout}>
                  <button type="submit" className="text-sm text-gray-500 hover:text-orange-500 transition">
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <div className="flex gap-3 text-sm">
                <Link href="/login" className="text-gray-500 hover:text-orange-500 transition">
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {/* 필터 탭 */}
        <Suspense>
          <FilterTabs />
        </Suspense>

        {items && items.length > 0 ? (
          <ul className="divide-y divide-orange-100">
            {items.map((item) => (
              <li key={item.id}>
                <Link href={`/items/${item.id}`} className="flex items-center gap-4 py-4 hover:bg-orange-50/60 rounded-xl px-2 -mx-2 transition">
                  {/* 썸네일 */}
                  <div className="w-20 h-20 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 overflow-hidden text-3xl">
                    {item.image_urls?.length > 0 ? (
                      <img
                        src={item.image_urls[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      '🍠'
                    )}
                  </div>
                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.category} · {timeAgo(item.created_at)}
                    </p>
                    <p className="font-bold text-gray-900 text-sm mt-1">
                      {item.price.toLocaleString('ko-KR')}원
                    </p>
                  </div>
                  {/* 상태 배지 */}
                  <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 font-medium
                    ${item.status === 'sold'
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-orange-100 text-orange-600'
                    }`}>
                    {item.status === 'sold' ? '판매완료' : '판매중'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🍠</div>
            <p className="text-gray-500 text-sm">아직 등록된 상품이 없어요.</p>
            {user ? (
              <Link
                href="/items/new"
                className="inline-block mt-5 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition"
              >
                첫 번째 상품 등록하기
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-block mt-5 text-orange-500 font-semibold text-sm hover:underline"
              >
                로그인하고 판매 시작하기 →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
