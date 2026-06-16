'use client'

import { useState, useTransition } from 'react'
import { createComment, updateComment, deleteComment } from '@/app/actions/comments'
import { createReply, updateReply, deleteReply } from '@/app/actions/replies'

type Reply = {
  id: string
  comment_id: string
  user_id: string
  nickname: string
  content: string
  created_at: string
  updated_at: string
}

type Comment = {
  id: string
  user_id: string
  nickname: string
  content: string
  created_at: string
  updated_at: string
  replies: Reply[]
}

type Props = {
  itemId: string
  initialComments: Comment[]
  currentUserId: string | null
  sellerUserId: string
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

export default function CommentSection({ itemId, initialComments, currentUserId, sellerUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newContent, setNewContent] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  // 답글 상태
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editReplyContent, setEditReplyContent] = useState('')

  const [isPending, startTransition] = useTransition()

  const isSeller = currentUserId === sellerUserId

  // ── 댓글 CRUD ──────────────────────────────────────

  function handleCreateComment() {
    if (!currentUserId) { alert('로그인이 필요해요.'); return }
    if (!newContent.trim()) return
    const content = newContent.trim()
    setNewContent('')
    startTransition(async () => {
      const result = await createComment(itemId, content)
      if (result?.error) { alert(result.error); setNewContent(content) }
      else if (result?.comment) {
        setComments(prev => [...prev, { ...result.comment, replies: [] }])
      }
    })
  }

  function handleUpdateComment(commentId: string) {
    if (!editCommentContent.trim()) return
    const content = editCommentContent.trim()
    startTransition(async () => {
      const result = await updateComment(commentId, itemId, content)
      if (result?.error) { alert(result.error) }
      else {
        setComments(prev => prev.map(c =>
          c.id === commentId ? { ...c, content, updated_at: new Date().toISOString() } : c
        ))
        setEditingCommentId(null)
      }
    })
  }

  function handleDeleteComment(commentId: string) {
    if (!confirm('댓글을 삭제할까요?')) return
    startTransition(async () => {
      const result = await deleteComment(commentId, itemId)
      if (result?.error) { alert(result.error) }
      else { setComments(prev => prev.filter(c => c.id !== commentId)) }
    })
  }

  // ── 답글 CRUD ──────────────────────────────────────

  function handleCreateReply(commentId: string) {
    if (!replyContent.trim()) return
    const content = replyContent.trim()
    setReplyContent('')
    setReplyingToCommentId(null)
    startTransition(async () => {
      const result = await createReply(commentId, itemId, content)
      if (result?.error) { alert(result.error) }
      else if (result?.reply) {
        setComments(prev => prev.map(c =>
          c.id === commentId ? { ...c, replies: [...c.replies, result.reply] } : c
        ))
      }
    })
  }

  function handleUpdateReply(replyId: string, commentId: string) {
    if (!editReplyContent.trim()) return
    const content = editReplyContent.trim()
    startTransition(async () => {
      const result = await updateReply(replyId, itemId, content)
      if (result?.error) { alert(result.error) }
      else {
        setComments(prev => prev.map(c =>
          c.id === commentId
            ? { ...c, replies: c.replies.map(r => r.id === replyId ? { ...r, content, updated_at: new Date().toISOString() } : r) }
            : c
        ))
        setEditingReplyId(null)
      }
    })
  }

  function handleDeleteReply(replyId: string, commentId: string) {
    if (!confirm('답글을 삭제할까요?')) return
    startTransition(async () => {
      const result = await deleteReply(replyId, itemId)
      if (result?.error) { alert(result.error) }
      else {
        setComments(prev => prev.map(c =>
          c.id === commentId ? { ...c, replies: c.replies.filter(r => r.id !== replyId) } : c
        ))
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
        <ul className="space-y-4">
          {comments.map(comment => (
            <li key={comment.id} className="border-b border-orange-50 last:border-0 pb-4 last:pb-0">

              {/* 댓글 */}
              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editCommentContent}
                    onChange={e => setEditCommentContent(e.target.value)}
                    rows={2} maxLength={500}
                    className="w-full text-sm border border-orange-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingCommentId(null)} className="text-xs text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-50">취소</button>
                    <button onClick={() => handleUpdateComment(comment.id)} disabled={isPending} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-60">수정 완료</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{comment.nickname}</span>
                      <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                      {comment.updated_at !== comment.created_at && <span className="text-xs text-gray-300">(수정됨)</span>}
                    </div>
                    <div className="flex gap-2">
                      {isSeller && (
                        <button
                          onClick={() => { setReplyingToCommentId(comment.id); setReplyContent('') }}
                          className="text-xs text-orange-400 hover:text-orange-600 font-medium transition"
                        >
                          답글
                        </button>
                      )}
                      {currentUserId === comment.user_id && (
                        <>
                          <button onClick={() => { setEditingCommentId(comment.id); setEditCommentContent(comment.content) }} className="text-xs text-gray-400 hover:text-orange-500 transition">수정</button>
                          <button onClick={() => handleDeleteComment(comment.id)} disabled={isPending} className="text-xs text-gray-400 hover:text-red-500 transition disabled:opacity-60">삭제</button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.content}</p>
                </>
              )}

              {/* 답글 목록 */}
              {comment.replies.length > 0 && (
                <ul className="mt-3 space-y-2 pl-4 border-l-2 border-orange-100">
                  {comment.replies.map(reply => (
                    <li key={reply.id}>
                      {editingReplyId === reply.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editReplyContent}
                            onChange={e => setEditReplyContent(e.target.value)}
                            rows={2} maxLength={500}
                            className="w-full text-sm border border-orange-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingReplyId(null)} className="text-xs text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-50">취소</button>
                            <button onClick={() => handleUpdateReply(reply.id, comment.id)} disabled={isPending} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 disabled:opacity-60">수정 완료</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded">판매자</span>
                              <span className="text-xs font-semibold text-gray-700">{reply.nickname}</span>
                              <span className="text-xs text-gray-400">{timeAgo(reply.created_at)}</span>
                              {reply.updated_at !== reply.created_at && <span className="text-xs text-gray-300">(수정됨)</span>}
                            </div>
                            {currentUserId === reply.user_id && (
                              <div className="flex gap-2">
                                <button onClick={() => { setEditingReplyId(reply.id); setEditReplyContent(reply.content) }} className="text-xs text-gray-400 hover:text-orange-500 transition">수정</button>
                                <button onClick={() => handleDeleteReply(reply.id, comment.id)} disabled={isPending} className="text-xs text-gray-400 hover:text-red-500 transition disabled:opacity-60">삭제</button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{reply.content}</p>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* 답글 입력창 */}
              {replyingToCommentId === comment.id && (
                <div className="mt-3 pl-4 border-l-2 border-orange-200 flex gap-2">
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreateReply(comment.id) } }}
                    placeholder="답글을 입력하세요 (Enter로 등록)"
                    rows={2} maxLength={500} autoFocus
                    className="flex-1 text-sm border border-orange-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <div className="flex flex-col gap-1 self-end">
                    <button onClick={() => handleCreateReply(comment.id)} disabled={isPending || !replyContent.trim()} className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-xl hover:bg-orange-600 disabled:opacity-40 transition">등록</button>
                    <button onClick={() => setReplyingToCommentId(null)} className="px-3 py-1.5 text-gray-400 text-xs rounded-xl hover:bg-gray-50">취소</button>
                  </div>
                </div>
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
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreateComment() } }}
            placeholder="댓글을 입력하세요 (Enter로 등록)"
            rows={2} maxLength={500}
            className="flex-1 text-sm border border-orange-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button
            onClick={handleCreateComment}
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
