'use client'

import { useState, useTransition } from 'react'
import { toggleLike } from '@/app/actions/likes'

type Props = {
  itemId: string
  initialLiked: boolean
  initialCount: number
  isLoggedIn: boolean
}

export default function LikeButton({ itemId, initialLiked, initialCount, isLoggedIn }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      alert('로그인이 필요해요.')
      return
    }

    const nextLiked = !liked
    setLiked(nextLiked)
    setCount(prev => nextLiked ? prev + 1 : prev - 1)

    startTransition(async () => {
      const result = await toggleLike(itemId)
      if (result?.error) {
        setLiked(!nextLiked)
        setCount(prev => nextLiked ? prev - 1 : prev + 1)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all
        ${liked
          ? 'bg-red-50 border-red-300 text-red-500'
          : 'bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400'
        }
        disabled:opacity-60`}
    >
      <span className="text-base">{liked ? '❤️' : '🤍'}</span>
      <span>좋아요 {count > 0 ? count : ''}</span>
    </button>
  )
}
