import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../../features/auth/store/useAuthStore'
import {
  createComment,
  createReply,
  deleteComment,
  fetchComments,
  updateComment,
} from '../../shared/api/commentApi'

function formatCommentDate(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function countComments(comments) {
  return comments.reduce((total, comment) => total + 1 + countComments(comment.children ?? []), 0)
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.message) return data.message
  return fallback
}

export default function CommentSection({ requestId }) {
  const queryClient = useQueryClient()
  const { user, isLoggedIn } = useAuthStore()
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')

  const commentsQuery = useQuery({
    queryKey: ['requestComments', requestId],
    queryFn: () => fetchComments(requestId),
    enabled: Boolean(requestId),
  })

  const invalidateComments = () => {
    queryClient.invalidateQueries({ queryKey: ['requestComments', requestId] })
  }

  const createMutation = useMutation({
    mutationFn: (nextContent) => createComment(requestId, nextContent),
    onSuccess: () => {
      setContent('')
      setMessage('')
      invalidateComments()
    },
    onError: (error) => {
      setMessage(getErrorMessage(error, '댓글 등록에 실패했습니다.'))
    },
  })

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextContent = content.trim()
    if (!nextContent) {
      setMessage('댓글 내용을 입력해 주세요.')
      return
    }

    createMutation.mutate(nextContent)
  }

  const comments = commentsQuery.data ?? []

  return (
    <section className="border-t border-gray-200 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">
          댓글 <span className="text-green-800">{countComments(comments)}</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-5 rounded-md border border-gray-200 bg-gray-50 p-4">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={!isLoggedIn || createMutation.isPending}
          rows={3}
          maxLength={1000}
          className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-green-800 disabled:cursor-not-allowed disabled:bg-gray-100"
          placeholder={isLoggedIn ? '댓글을 입력하세요.' : '로그인 후 댓글을 작성할 수 있습니다.'}
        />
        {message && <p className="mt-2 text-sm text-red-600">{message}</p>}
        <div className="mt-3 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={!isLoggedIn || createMutation.isPending}
            className="inline-flex h-9 items-center rounded-md bg-green-900 px-4 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending ? '등록 중' : '댓글 등록'}
          </button>
        </div>
      </form>

      {commentsQuery.isLoading && (
        <div className="rounded-md border border-gray-200 bg-white p-5 text-center text-sm text-gray-500">
          댓글을 불러오는 중입니다.
        </div>
      )}

      {commentsQuery.isError && (
        <div className="rounded-md border border-red-100 bg-red-50 p-5 text-center text-sm text-red-600">
          {getErrorMessage(commentsQuery.error, '댓글을 불러오지 못했습니다.')}
        </div>
      )}

      {!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 && (
        <div className="rounded-md border border-gray-200 bg-white p-5 text-center text-sm text-gray-500">
          아직 등록된 댓글이 없습니다.
        </div>
      )}

      {!commentsQuery.isLoading && !commentsQuery.isError && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              requestId={requestId}
              loginUserId={user?.userId}
              isLoggedIn={isLoggedIn}
              onChanged={invalidateComments}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CommentItem({ comment, requestId, loginUserId, isLoggedIn, onChanged, level = 0 }) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editContent, setEditContent] = useState(comment.content ?? '')
  const [message, setMessage] = useState('')
  const isDeleted = Boolean(comment.deleted ?? comment.isDeleted)
  const isOwner = isLoggedIn && Number(loginUserId) === Number(comment.userId)

  const replyMutation = useMutation({
    mutationFn: (nextContent) => createReply(requestId, comment.commentId, nextContent),
    onSuccess: () => {
      setReplyContent('')
      setReplyOpen(false)
      setMessage('')
      onChanged()
    },
    onError: (error) => {
      setMessage(getErrorMessage(error, '답글 등록에 실패했습니다.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (nextContent) => updateComment(requestId, comment.commentId, nextContent),
    onSuccess: () => {
      setEditOpen(false)
      setMessage('')
      onChanged()
    },
    onError: (error) => {
      setMessage(getErrorMessage(error, '댓글 수정에 실패했습니다.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(requestId, comment.commentId),
    onSuccess: () => {
      setMessage('')
      onChanged()
    },
    onError: (error) => {
      setMessage(getErrorMessage(error, '댓글 삭제에 실패했습니다.'))
    },
  })

  const handleReplySubmit = (event) => {
    event.preventDefault()

    const nextContent = replyContent.trim()
    if (!nextContent) {
      setMessage('답글 내용을 입력해 주세요.')
      return
    }

    replyMutation.mutate(nextContent)
  }

  const handleEditSubmit = (event) => {
    event.preventDefault()

    const nextContent = editContent.trim()
    if (!nextContent) {
      setMessage('댓글 내용을 입력해 주세요.')
      return
    }

    updateMutation.mutate(nextContent)
  }

  const handleDelete = () => {
    if (deleteMutation.isPending) return

    const confirmed = window.confirm('댓글을 삭제하시겠습니까?')
    if (!confirmed) return

    deleteMutation.mutate()
  }

  return (
    <article
      className={`rounded-md border border-gray-200 bg-white p-4 ${level > 0 ? 'ml-5 border-l-4 border-l-green-100' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <strong className="text-sm font-bold text-gray-900">
            {comment.userNickname || '알 수 없음'}
          </strong>
          <p className="mt-1 text-xs text-gray-500">{formatCommentDate(comment.createdAt)}</p>
        </div>

        {!isDeleted && (
          <div className="flex flex-wrap gap-2">
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  setReplyOpen((current) => !current)
                  setEditOpen(false)
                  setMessage('')
                }}
                className="text-xs font-semibold text-green-800 hover:underline"
              >
                답글
              </button>
            )}
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditOpen((current) => !current)
                    setReplyOpen(false)
                    setEditContent(comment.content ?? '')
                    setMessage('')
                  }}
                  className="text-xs font-semibold text-gray-700 hover:underline"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-xs font-semibold text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteMutation.isPending ? '삭제 중' : '삭제'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className={`mt-3 whitespace-pre-wrap text-sm leading-6 ${isDeleted ? 'text-gray-400' : 'text-gray-800'}`}>
        {comment.content}
      </p>

      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}

      {replyOpen && (
        <CommentInlineForm
          value={replyContent}
          onChange={setReplyContent}
          onSubmit={handleReplySubmit}
          onCancel={() => setReplyOpen(false)}
          isPending={replyMutation.isPending}
          submitLabel="답글 등록"
          placeholder="답글을 입력하세요."
        />
      )}

      {editOpen && (
        <CommentInlineForm
          value={editContent}
          onChange={setEditContent}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditOpen(false)}
          isPending={updateMutation.isPending}
          submitLabel="수정 저장"
          placeholder="댓글 내용을 수정하세요."
        />
      )}

      {(comment.children ?? []).length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.children.map((child) => (
            <CommentItem
              key={child.commentId}
              comment={child}
              requestId={requestId}
              loginUserId={loginUserId}
              isLoggedIn={isLoggedIn}
              onChanged={onChanged}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </article>
  )
}

function CommentInlineForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
  placeholder,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        maxLength={1000}
        required
        disabled={isPending}
        placeholder={placeholder}
        className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-green-800 disabled:cursor-not-allowed disabled:bg-gray-100"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-8 items-center rounded-md bg-green-900 px-3 text-xs font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? '저장 중' : submitLabel}
        </button>
      </div>
    </form>
  )
}
