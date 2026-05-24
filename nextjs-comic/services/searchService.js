import * as httpRequest from '@/lib/utils/httpRequest'

export const search = async (q, type = 'less') => {
  try {
    const res = await httpRequest.get('comics', {
      params: {
        q,
        type,
      },
    })
    return res.results
  } catch (error) {
    console.log(error)
  }
}

export const searchSuggest = async (q) => {
  try {
    const res = await httpRequest.get('comics/search-suggest', {
      params: {
        q,
      },
    })
    return res
  } catch (error) {
    console.log(error)
  }
}
