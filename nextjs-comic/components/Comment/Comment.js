import CommentForm from '@/components/Comment/CommentForm'
import CommentList from '@/components/Comment/CommentList'
import Image from '@/components/common/Image'
import { useCommentContext } from '@/contexts/CommentProvider'
import { useAsyncFn } from '@/hooks/useAsync'
import { useAuthState } from '@/hooks/useAuthState'
import { formatTimeAgo } from '@/lib/utils/dateFormatter'
import useCommentApi from '@/services/commentService'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FaCaretDown, FaCaretUp, FaThumbsUp, FaThumbsDown } from 'react-icons/fa'
import toast from 'react-hot-toast'
import IconBtn from '../Buttons/IconBtn'
import TextTruncate from '../Utilities/TextTruncate'

function Comment({
  id,
  content: message,
  creator: user,
  updated_date: updatedAt,
  is_spoiler: isSpoiler = false,
  likes_count: likesCountProp = 0,
  dislikes_count: dislikesCountProp = 0,
  liked_by_me: likedByMeProp = false,
  disliked_by_me: dislikedByMeProp = false,
}) {
  const router = useRouter()
  const {
    query: { comicSlug },
  } = router
  const { user: currentUser } = useAuthState()
  const [areChildrenHidden, setAreChildrenHidden] = useState(true)
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Like & Dislike states
  const [likesCount, setLikesCount] = useState(likesCountProp)
  const [dislikesCount, setDislikesCount] = useState(dislikesCountProp)
  const [likedByMe, setLikedByMe] = useState(likedByMeProp)
  const [dislikedByMe, setDislikedByMe] = useState(dislikedByMeProp)

  // Spoiler reveal state
  const [revealSpoiler, setRevealSpoiler] = useState(false)

  const { createComment, deleteComment, updateComment, likeComment, dislikeComment } =
    useCommentApi()
  const { getReplies, createLocalComment, deleteLocalComment, updateLocalComment } =
    useCommentContext()
  const childComments = getReplies(id)

  const createCommentFn = useAsyncFn(createComment)
  const updateCommentFn = useAsyncFn(updateComment)
  const deleteCommentFn = useAsyncFn(deleteComment)

  const oncommentReply = (message, isSpoiler) => {
    return createCommentFn
      .execute({ comicSlug: comicSlug, content: message, reply_to: id, is_spoiler: isSpoiler })
      .then((reply) => {
        setIsReplying(false)
        createLocalComment(reply)
      })
  }

  function onCommentDelete() {
    if (window.confirm('Are you sure you wish to delete this item?'))
      return deleteCommentFn.execute({ id }).then((res) => {
        if (res?.status == 204) deleteLocalComment(id)
      })
  }

  function onCommentUpdate(message) {
    return updateCommentFn.execute({ id, content: message }).then((res) => {
      if (res) {
        setIsEditing(false)
        updateLocalComment(res.id, res.content)
      }
    })
  }

  const handleLike = () => {
    if (!currentUser) {
      return toast.error('You need to be logged in to like comments')
    }
    likeComment({ id }).then((res) => {
      if (res) {
        setLikedByMe(res.liked)
        setLikesCount(res.likes_count)
        setDislikesCount(res.dislikes_count)
        setDislikedByMe(false) // Liked removes dislike
      }
    })
  }

  const handleDislike = () => {
    if (!currentUser) {
      return toast.error('You need to be logged in to dislike comments')
    }
    dislikeComment({ id }).then((res) => {
      if (res) {
        setDislikedByMe(res.disliked)
        setLikesCount(res.likes_count)
        setDislikesCount(res.dislikes_count)
        setLikedByMe(false) // Disliked removes like
      }
    })
  }

  return (
    <div className="comic-detail-section-border flex flex-col rounded-xl border border-gray-200/50 bg-dark-gray-lighter p-4 shadow-sm transition duration-300 dark:border-gray-800 dark:bg-dark-blue">
      <div className="flex flex-col space-y-3">
        {/* User Info & Levels */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <div className="mr-3.5 h-9 w-9 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
              <Image
                className="h-9 w-9"
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                }
                alt="user avatar"
                width={36}
                height={36}
                unoptimized
              />
            </div>
            <div className="leading-2 flex flex-col">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
                {user.username}
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  LV.{user.level || 1}
                </span>
              </span>
              <span className="text-xs text-gray-400">about {formatTimeAgo(updatedAt)}</span>
            </div>
          </div>
          {isSpoiler && (
            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
              Spoiler
            </span>
          )}
        </div>

        {/* User Comment Text / Spoiler Cover */}
        {isEditing ? (
          <CommentForm
            autoFocus
            initialValue={message}
            onSubmit={onCommentUpdate}
            loading={updateCommentFn.loading}
            error={updateCommentFn.error}
            showSpoilerCheckbox={false}
          />
        ) : isSpoiler && !revealSpoiler ? (
          <div
            onClick={() => setRevealSpoiler(true)}
            className="bg-gray-950 my-3 cursor-pointer select-none rounded-lg border border-yellow-500/30 px-4 py-3 text-center text-xs font-semibold text-gray-400 transition duration-200 hover:bg-black"
          >
            ⚠️ Spoiler content. Click to reveal.
          </div>
        ) : (
          <TextTruncate text={message} className="prose-sm my-3 text-gray-700 dark:text-gray-200" />
        )}

        {/* Actions Section */}
        <div className="flex flex-row items-center gap-3">
          {/* Like */}
          <IconBtn
            onClick={handleLike}
            isActive={likedByMe}
            aria-label={likedByMe ? 'Unlike' : 'Like'}
            Icon={FaThumbsUp}
          >
            <span className="ml-1 text-xs">{likesCount}</span>
          </IconBtn>

          {/* Dislike */}
          <IconBtn
            onClick={handleDislike}
            isActive={dislikedByMe}
            aria-label={dislikedByMe ? 'Remove Dislike' : 'Dislike'}
            Icon={FaThumbsDown}
          >
            <span className="ml-1 text-xs">{dislikesCount}</span>
          </IconBtn>

          {/* Reply */}
          <IconBtn
            onClick={() => setIsReplying((prev) => !prev)}
            isActive={isReplying}
            Icon={ReplyIcon}
            aria-label={isReplying ? 'Cancel Reply' : 'Reply'}
          />

          {user.id === currentUser?.id && (
            <>
              <IconBtn
                onClick={() => setIsEditing((prev) => !prev)}
                isActive={isEditing}
                aria-label={isEditing ? 'Cancel Edit' : 'Edit'}
                Icon={EditIcon}
              />
              <IconBtn
                disabled={deleteCommentFn.loading}
                onClick={onCommentDelete}
                aria-label="Delete"
                color="danger"
                Icon={DeleteIcon}
              />
            </>
          )}
        </div>

        {isReplying && (
          <div className="mt-2 ml-3">
            <CommentForm
              autoFocus
              onSubmit={oncommentReply}
              loading={createCommentFn.loading}
              error={createCommentFn.error}
            />
          </div>
        )}

        {/* Show/Hide Replies Button */}
        {childComments?.length > 0 && (
          <div className="pt-1">
            <IconBtn
              aria-label={areChildrenHidden ? 'Show Replies' : 'Hide Replies'}
              Icon={areChildrenHidden ? FaCaretDown : FaCaretUp}
              onClick={() => setAreChildrenHidden(!areChildrenHidden)}
            >
              <span className="ml-1 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                {childComments.length} {childComments.length === 1 ? 'Reply' : 'Replies'}
              </span>
            </IconBtn>
          </div>
        )}

        {/* Child comments */}
        {childComments?.length > 0 && (
          <div className={`nested-comments-stack ${areChildrenHidden ? 'hide' : ''}`}>
            <div className="nested-comments mt-2 space-y-3 border-l-2 border-gray-200 pl-4 dark:border-gray-800">
              <CommentList comments={childComments} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReplyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  )
}

export default Comment
