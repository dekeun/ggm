import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AvatarUploader from './AvatarUploader'
import { upsertProfile } from '@/app/actions/profile'
import { getProfile } from '@/app/actions/profile'

export default async function ProfileEditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const nickname = user.user_metadata?.nickname ?? user.email ?? ''
  const profile = await getProfile(user.id)

  async function handleSave(formData: FormData) {
    'use server'
    const bio = formData.get('bio') as string ?? ''
    const supabase2 = await createClient()
    const { data: { user: u } } = await supabase2.auth.getUser()
    if (!u) return

    await upsertProfile(bio, u.user_metadata?.nickname ?? '')
    redirect(`/users/${u.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/users/${user.id}`} className="text-gray-500 hover:text-orange-500 transition text-lg leading-none">←</Link>
          <h1 className="font-bold text-gray-800 text-base">프로필 수정</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-orange-100 px-6 py-8 space-y-6">
          {/* 프로필 사진 */}
          <AvatarUploader currentUrl={profile?.avatar_url ?? null} nickname={nickname} />

          {/* 닉네임 (읽기 전용) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">닉네임</label>
            <div className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-500">
              {nickname}
            </div>
            <p className="text-xs text-gray-400">닉네임은 변경할 수 없어요.</p>
          </div>

          {/* 자기소개 */}
          <form action={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="bio" className="text-sm font-medium text-gray-700">자기소개</label>
              <textarea
                id="bio"
                name="bio"
                defaultValue={profile?.bio ?? ''}
                placeholder="나를 소개해주세요 (최대 200자)"
                maxLength={200}
                rows={4}
                className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm transition"
            >
              저장
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
