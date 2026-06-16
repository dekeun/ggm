'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  existingUrls?: string[]
  maxImages?: number
}

export default function ImageUploader({ existingUrls = [], maxImages = 5 }: Props) {
  const [urls, setUrls] = useState<string[]>(existingUrls)
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !userId) return

    const remaining = maxImages - urls.length
    const toUpload = files.slice(0, remaining)

    setUploading(true)
    const newUrls: string[] = []

    for (const file of toUpload) {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('item-images')
        .upload(path, file)

      if (!error) {
        const { data } = supabase.storage.from('item-images').getPublicUrl(path)
        newUrls.push(data.publicUrl)
      }
    }

    setUrls(prev => [...prev, ...newUrls])
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = async (url: string) => {
    const pathMatch = url.split('/item-images/')[1]
    if (pathMatch) {
      await supabase.storage.from('item-images').remove([pathMatch])
    }
    setUrls(prev => prev.filter(u => u !== url))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {urls.map((url, i) => (
          <div key={url} className="relative w-20 h-20 flex-shrink-0">
            <img
              src={url}
              alt={`사진 ${i + 1}`}
              className="w-full h-full object-cover rounded-xl border border-orange-100"
            />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 hover:bg-gray-900 text-white rounded-full text-xs flex items-center justify-center leading-none transition"
            >
              ×
            </button>
          </div>
        ))}

        {urls.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !userId}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 flex flex-col items-center justify-center text-orange-400 text-xs gap-0.5 transition disabled:opacity-50"
          >
            {uploading ? (
              <span className="text-xs">올리는 중...</span>
            ) : (
              <>
                <span className="text-2xl font-light leading-none">+</span>
                <span>사진 추가</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">{urls.length}/{maxImages}장 · JPG, PNG, WEBP</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {urls.map(url => (
        <input key={url} type="hidden" name="image_url" value={url} />
      ))}
    </div>
  )
}
