import { useState } from 'react'
import AuthCheck from '../common/AuthCheck'

export default function CommentForm({
  loading,
  error,
  onSubmit,
  autoFocus = false,
  initialValue = '',
  showSpoilerCheckbox = true,
}) {
  const [message, setMessage] = useState(initialValue)
  const [isSpoiler, setIsSpoiler] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(message, isSpoiler).then(() => {
      setMessage('')
      setIsSpoiler(false)
    })
  }

  return (
    <AuthCheck
      fallback={
        <div className="comic-detail-section-styles space-x-4 p-4 text-center">
          <span className="text-sm">Only users can post comments</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="">
        <div className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
          <div className="flex items-center justify-between border-b py-2 px-3 dark:border-gray-600">
            <div className="flex flex-wrap items-center divide-gray-200 dark:divide-gray-600 sm:divide-x">
              <div className="flex items-center space-x-1 sm:pr-4">
                <button type="button" disabled>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
                    />
                  </svg>
                  <span className="sr-only">Add emoji</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center space-x-1 sm:pl-4"></div>
            </div>
          </div>
          <div className="rounded-b-lg bg-white py-2 px-4 dark:bg-gray-800">
            <label htmlFor="editor" className="sr-only">
              Publish post
            </label>
            <textarea
              autoFocus={autoFocus}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              id="editor"
              rows="4"
              className="block w-full border-0 bg-white px-0 text-sm text-gray-800 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              placeholder="Write a comment..."
              required=""
            ></textarea>
          </div>
          {error && <div className="error-msg my-2 ml-2">{error}</div>}
        </div>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
          >
            {loading ? 'Loading' : 'Publish Comment'}
          </button>

          {showSpoilerCheckbox && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSpoilerCheckbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="isSpoilerCheckbox"
                className="cursor-pointer text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                Hide comment as a spoiler tag
              </label>
            </div>
          )}
        </div>
      </form>
    </AuthCheck>
  )
}
