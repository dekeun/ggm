'use client'

import Link from 'next/link'
import { deleteItem } from '@/app/actions/items'

export default function ItemActions({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm('정말 삭제할까요?')) return
    await deleteItem(id)
  }

  return (
    <div className="flex gap-3">
      <Link
        href={`/items/${id}/edit`}
        className="flex-1 text-center border border-orange-400 text-orange-500 hover:bg-orange-50 font-semibold py-3 rounded-xl text-sm transition"
      >
        수정
      </Link>
      <button
        onClick={handleDelete}
        className="flex-1 border border-red-300 text-red-400 hover:bg-red-50 font-semibold py-3 rounded-xl text-sm transition"
      >
        삭제
      </button>
    </div>
  )
}
