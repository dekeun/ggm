'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadAvatar, deleteAvatar } from '@/app/actions/profile'

type Props = {
  currentUrl: string | null
  nickname: string
}

export default function AvatarUploader({ currentUrl, nickname }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('avatar', file)

    startTransition(async () => {
      const result = await uploadAvatar(formData)
      if (result?.error) {
        alert(result.error)
        setPreview(currentUrl)
      }
    })
  }

  function handleDelete() {
    if (!confirm('프로필 사진을 삭제할까요?')) return
    setPreview(null)
    startTransition(async () => {
      const result = await deleteAvatar()
      if (result?.error) {
        alert(result.error)
        setPreview(currentUrl)
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        {preview ? (
          <img src={preview} alt="프로필 사진" className="w-24 h-24 rounded-full object-cover border-2 border-orange-200" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-4xl">
            👤
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
            <span className="text-white text-xs">업로드 중...</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="text-sm px-4 py-1.5 rounded-full border border-orange-300 text-orange-500 hover:bg-orange-50 transition disabled:opacity-50"
        >
          사진 변경
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm px-4 py-1.5 rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition disabled:opacity-50"
          >
            삭제
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
