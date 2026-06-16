'use client'

import { useActionState } from 'react'
import { updateItem, type ItemState } from '@/app/actions/items'
import Link from 'next/link'
import ImageUploader from '@/app/items/components/ImageUploader'

const CATEGORIES = ['디지털/가전', '의류', '도서', '스포츠/레저', '가구/인테리어', '생활용품', '식물', '기타']

type Item = {
  id: string
  title: string
  price: number
  category: string
  description: string
  image_urls?: string[]
}

export default function EditForm({ item }: { item: Item }) {
  const action = updateItem.bind(null, item.id)
  const [state, formAction, pending] = useActionState<ItemState, FormData>(action, null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/items/${item.id}`} className="text-gray-500 hover:text-orange-500 transition text-lg leading-none">
            ←
          </Link>
          <h1 className="font-bold text-gray-800 text-base">판매글 수정</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form action={formAction} className="space-y-5">

          {/* 사진 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              사진 <span className="text-gray-400 font-normal">(최대 5장)</span>
            </label>
            <ImageUploader existingUrls={item.image_urls ?? []} />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
              제목 <span className="text-orange-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={item.title}
              required
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm transition bg-white"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
              카테고리 <span className="text-orange-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              defaultValue={item.category}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm transition bg-white appearance-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">
              가격 <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <input
                id="price"
                name="price"
                type="number"
                defaultValue={item.price}
                required
                min={0}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm transition bg-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              내용 <span className="text-orange-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={item.description}
              required
              rows={7}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 text-sm transition bg-white resize-none"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl text-sm transition"
          >
            {pending ? '저장 중...' : '수정 완료'}
          </button>
        </form>
      </main>
    </div>
  )
}
