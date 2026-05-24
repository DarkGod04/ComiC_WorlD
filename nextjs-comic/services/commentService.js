import useAxios from '@/hooks/auth/useAxios'
import { makeRequest } from '@/lib/utils/httpRequest'

const useCommentApi = () => {
  const { makeAuthRequest } = useAxios()

  function createComment({ comicSlug, content, reply_to, is_spoiler }) {
    return makeAuthRequest(`comics/${comicSlug}/add-comment/`, {
      method: 'POST',
      data: { content, reply_to, is_spoiler },
    })
  }

  function deleteComment({ id: commentId }) {
    return makeAuthRequest(`comments/${commentId}/`, {
      method: 'DELETE',
    })
  }

  function updateComment({ id: commentId, content }) {
    return makeAuthRequest(`comments/${commentId}/`, {
      method: 'PUT',
      data: { content },
    })
  }

  function likeComment({ id: commentId }) {
    return makeAuthRequest(`comments/${commentId}/like/`, {
      method: 'POST',
    })
  }

  function dislikeComment({ id: commentId }) {
    return makeAuthRequest(`comments/${commentId}/dislike/`, {
      method: 'POST',
    })
  }

  return {
    createComment,
    deleteComment,
    updateComment,
    likeComment,
    dislikeComment,
  }
}
export const getCommentByComicSlugUrl = (slug) => {
  return {
    fetcher: makeRequest,
    url: (slug) => `/comics/${slug}/comments/`,
  }
}

export function getCommentByComicSlug({ slug, params, signal }) {
  return makeRequest(`/comics/${slug}/comments/`, {
    method: 'GET',
    params: params,
    signal,
  })
}

export default useCommentApi
