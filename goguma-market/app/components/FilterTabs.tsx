'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const TABS = [
  { label: '전체', value: 'all' },
  { label: '판매중', value: 'selling' },
  { label: '판매완료', value: 'sold' },
]

export default function FilterTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('filter') ?? 'all'

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', value)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 pb-3 pt-1">
      {TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => handleClick(tab.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition
            ${current === tab.value
              ? 'bg-orange-500 text-white'
              : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
