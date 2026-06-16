'use client'

import { useActionState } from 'react'
import { createItem } from '@/app/actions/items'
import Link from 'next/link'
import ImageUploader from '@/app/items/components/ImageUploader'

const CATEGORIES = ['디지털/가전', '의류', '도서', '스포츠/레저', '가구/인테리어', '생활용품', '식물', '기타']

export default function NewItemPage() {
  const [state, action, pending] = useActionState(createItem, null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-orange-500 transition text-lg leading-none">
            ←
          </Link>
          <h1 className="font-bold text-gray-800 text-base">판매글 작성</h1>
        </div>
      </header>

      {/* 폼 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <form action={action} className="space-y-5">

          {/* 사진 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              사진 <span className="text-gray-400 font-normal">(최대 5장)</span>
            </label>
            <ImageUploader />
          </div>

          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
              제목 <span className="text-orange-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="제목을 입력하세요"
              required
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm transition bg-white"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
              카테고리 <span className="text-orange-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue=""
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm transition bg-white appearance-none"
            >
              <option value="" disabled>카테고리를 선택하세요</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 가격 */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">
              가격 <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <input
                id="price"
                name="price"
                type="number"
                placeholder="0"
                required
                min={0}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm transition bg-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
            </div>
          </div>

          {/* 내용 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              내용 <span className="text-orange-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="상품에 대해 자세히 설명해주세요 (상태, 구매 시기, 사용감 등)"
              required
              rows={7}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm transition bg-white resize-none"
            />
          </div>

          {/* 에러 메시지 */}
          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{state.error}</p>
          )}

          {/* 등록 버튼 */}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl text-sm transition"
          >
            {pending ? '등록 중...' : '판매글 등록'}
          </button>
        </form>
      </main>
    </div>
  )
}
