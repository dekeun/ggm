'use client'

import { useState } from 'react'

export default function ImageGallery({ urls }: { urls: string[] }) {
  const [current, setCurrent] = useState(0)

  if (urls.length === 1) {
    return (
      <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
        <img src={urls[0]} alt="상품 사진" className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* 메인 이미지 */}
      <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 relative">
        <img src={urls[current]} alt={`상품 사진 ${current + 1}`} className="w-full h-full object-cover" />
        {/* 이전/다음 버튼 */}
        {current > 0 && (
          <button
            onClick={() => setCurrent(c => c - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-sm transition"
          >
            ‹
          </button>
        )}
        {current < urls.length - 1 && (
          <button
            onClick={() => setCurrent(c => c + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-sm transition"
          >
            ›
          </button>
        )}
        {/* 페이지 표시 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full">
          {current + 1} / {urls.length}
        </div>
      </div>

      {/* 썸네일 목록 */}
      <div className="flex gap-2">
        {urls.map((url, i) => (
          <button
            key={url}
            onClick={() => setCurrent(i)}
            className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${
              i === current ? 'border-orange-500' : 'border-transparent opacity-60 hover:opacity-90'
            }`}
          >
            <img src={url} alt={`썸네일 ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
