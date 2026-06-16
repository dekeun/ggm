'use client'

import { useState, useTransition } from 'react'
import { createComment, updateComment, deleteComment } from '@/app/actions/comments'

type Comment = {
  id: string
  user_id: string
  nickname: string
  content: string
  created_at: string
  updated_at: string
}

type Props = {
  itemId: string
  initialComments: Comment[]
  currentUserId: string | null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

export default function CommentSection({ itemId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newContent, setNewContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    if (!currentUserId) { alert('로그인이 필요해요.'); return }
    if (!newContent.trim()) return

    const content = newContent.trim()
    setNewContent('')

    startTransition(async () => {
      const result = await createComment(itemId, content)
      if (result?.error) {
        alert(result.error)
        setNewContent(content)
      } else if (result?.comment) {
        setComments(prev => [...prev, result.comment])
      }
    })
  }

  function startEdit(comment: Comment) {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  function handleUpdate(commentId: string) {
    if (!editContent.trim()) return

    const content = editContent.trim()

    startTransition(async () => {
      const result = await updateComment(commentId, itemId, content)
      if (result?.error) {
        alert(result.error)
      } else {
        setComments(prev =>
          prev.map(c => c.id === commentId ? { ...c, content, updated_at: new Date().toISOString() } : c)
        )
        setEditingId(null)
      }
    })
  }

  function handleDelete(commentId: string) {
    if (!confirm('댓글을 삭제할까요?')) return

    startTransition(async () => {
      const result = await deleteComment(commentId, itemId)
      if (result?.error) {
        alert(result.error)
      } else {
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-orange-100 px-5 py-5 space-y-4">
      <h3 className="font-bold text-gray-800">
        댓글 <span className="text-orange-500">{comments.length}</span>
      </h3>

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">첫 번째 댓글을 남겨보세요!</p>
      ) : (
        <ul className="space-y-3">
          {comments.map(comment => (
            <li key={comment.id} className="border-b border-orange-50 last:border-0 pb-3 last:pb-0">
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="w-full text-sm border border-orange-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleUpdate(comment.id)}
                      disabled={isPending}
                      className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-60"
                    >
                      수정 완료
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{comment.nickname}</span>
                      <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                      {comment.updated_at !== comment.created_at && (
                        <span className="text-xs text-gray-300">(수정됨)</span>
                      )}
                    </div>
                    {currentUserId === comment.user_id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(comment)}
                          className="text-xs text-gray-400 hover:text-orange-500 transition"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={isPending}
                          className="text-xs text-gray-400 hover:text-red-500 transition disabled:opacity-60"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.content}</p>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 댓글 작성 */}
      {currentUserId ? (
        <div className="flex gap-2 pt-1">
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreate() } }}
            placeholder="댓글을 입력하세요 (Enter로 등록)"
            rows={2}
            maxLength={500}
            className="flex-1 text-sm border border-orange-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button
            onClick={handleCreate}
            disabled={isPending || !newContent.trim()}
            className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 disabled:opacity-40 transition self-end"
          >
            등록
          </button>
        </div>
      ) : (
        <p className="text-sm text-center text-gray-400 border border-dashed border-orange-200 rounded-xl py-3">
          댓글을 달려면 <a href="/login" className="text-orange-500 font-medium">로그인</a>이 필요해요
        </p>
      )}
    </div>
  )
}
