'use client'

import { useState, useRef, useTransition } from 'react'
import { uploadAvatar, deleteAvatar, upsertProfile } from '@/app/actions/profile'

type Props = {
  nickname: string
  initialAvatarUrl: string | null
  initialBio: string
  itemCount: number
}

export default function ProfileEditor({ nickname, initialAvatarUrl, initialBio, itemCount }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [bio, setBio] = useState(initialBio)
  const [bioSaved, setBioSaved] = useState(true)
  const [isPendingAvatar, startAvatarTransition] = useTransition()
  const [isPendingBio, startBioTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  // ── 사진 업로드 (Create / Update) ─────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const preview = URL.createObjectURL(file)
    setAvatarUrl(preview)

    const fd = new FormData()
    fd.append('avatar', file)

    startAvatarTransition(async () => {
      const result = await uploadAvatar(fd)
      if (result?.error) {
        alert(result.error)
        setAvatarUrl(avatarUrl)
      } else if (result?.url) {
        setAvatarUrl(result.url + '?t=' + Date.now())
      }
    })
  }

  // ── 사진 삭제 (Delete) ────────────────────────────────
  function handleDeleteAvatar() {
    if (!confirm('프로필 사진을 삭제할까요?')) return
    const prev = avatarUrl
    setAvatarUrl(null)
    startAvatarTransition(async () => {
      const result = await deleteAvatar()
      if (result?.error) { alert(result.error); setAvatarUrl(prev) }
    })
  }

  // ── 자기소개 저장 (Create / Update) ───────────────────
  function handleSaveBio() {
    startBioTransition(async () => {
      const result = await upsertProfile(bio, nickname)
      if (result?.error) {
        alert(result.error)
      } else {
        setBioSaved(true)
      }
    })
  }

  // ── 자기소개 삭제 (Delete) ────────────────────────────
  function handleDeleteBio() {
    if (!confirm('자기소개를 삭제할까요?')) return
    setBio('')
    startBioTransition(async () => {
      const result = await upsertProfile('', nickname)
      if (result?.error) { alert(result.error); setBio(bio) }
      else setBioSaved(true)
    })
  }

  return (
    <div className="space-y-3">

      {/* ── 프로필 카드 ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-orange-100 px-6 py-5 flex items-center gap-4">
        {/* 사진 영역 */}
        <div className="flex-shrink-0 relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="프로필 사진"
              className="w-20 h-20 rounded-full object-cover border-2 border-orange-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-4xl">
              👤
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <span className="text-white text-xs font-semibold">📷</span>
          </div>
          {isPendingAvatar && (
            <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
              <span className="text-white text-xs">저장중</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* 닉네임 + 사진 버튼 */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-lg">{nickname}</p>
          <p className="text-xs text-gray-400 mt-1">판매 상품 {itemCount}개</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={isPendingAvatar}
              className="text-xs px-3 py-1 rounded-full border border-orange-200 text-orange-500 hover:bg-orange-50 transition disabled:opacity-50"
            >
              📷 사진 변경
            </button>
            {avatarUrl && (
              <button
                onClick={handleDeleteAvatar}
                disabled={isPendingAvatar}
                className="text-xs px-3 py-1 rounded-full border border-red-100 text-red-400 hover:bg-red-50 transition disabled:opacity-50"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 자기소개 섹션 ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-orange-100 px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">✏️ 자기소개</h3>
          {!bioSaved && (
            <span className="text-xs text-orange-400">수정 중...</span>
          )}
        </div>

        {/* 자기소개 입력창 (항상 열려 있음) */}
        <textarea
          value={bio}
          onChange={e => { setBio(e.target.value); setBioSaved(false) }}
          placeholder="나를 소개해주세요. 판매하는 상품, 거래 스타일 등을 자유롭게 입력하세요 (최대 200자)"
          maxLength={200}
          rows={4}
          className="w-full text-sm border border-orange-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-gray-300"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">{bio.length} / 200</span>
          <div className="flex gap-2">
            {bio.length > 0 && (
              <button
                onClick={handleDeleteBio}
                disabled={isPendingBio}
                className="text-xs px-3 py-1.5 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition disabled:opacity-50"
              >
                삭제
              </button>
            )}
            <button
              onClick={handleSaveBio}
              disabled={isPendingBio || bioSaved}
              className="text-xs px-4 py-1.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition disabled:opacity-40"
            >
              {isPendingBio ? '저장 중...' : bioSaved ? '저장됨 ✓' : '저장'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
