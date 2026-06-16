'use client'

import { useState, useTransition } from 'react'
import { updateItemStatus } from '@/app/actions/items'

type Props = {
  itemId: string
  initialStatus: string | null
}

export default function StatusToggle({ itemId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus === 'sold' ? 'sold' : 'selling')
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    const next = status === 'sold' ? 'selling' : 'sold'
    setStatus(next)
    startTransition(async () => {
      const result = await updateItemStatus(itemId, next)
      if (result?.error) {
        alert(result.error)
        setStatus(status)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex-1 text-center font-semibold py-3 rounded-xl text-sm transition disabled:opacity-60
        ${status === 'sold'
          ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
    >
      {isPending ? '변경 중...' : status === 'sold' ? '판매중으로 변경' : '판매완료로 변경'}
    </button>
  )
}
