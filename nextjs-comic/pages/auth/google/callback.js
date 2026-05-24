import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthState } from '@/hooks/useAuthState'
import axios from 'axios'
import toast from 'react-hot-toast'
import Spinner from '@/components/Skeleton/Spinner'

export default function GoogleCallback() {
  const router = useRouter()
  const { setToken } = useAuthState()
  const [error, setError] = useState(null)

  useEffect(() => {
    // Parse the token from window.location.hash
    const hash = window.location.hash
    if (!hash) {
      setError('No authentication data received from Google.')
      return
    }

    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')

    if (!accessToken) {
      setError('Access token not found in URL hash.')
      return
    }

    const baseURL = process.env.NEXT_PUBLIC_BASE_API_ENDPOINT || 'http://127.0.0.1:8000'

    axios
      .post(`${baseURL}/api/auth/google/`, { access_token: accessToken })
      .then((res) => {
        // Save token to state & storage
        setToken(res.data)
        toast.success('Logged in successfully with Google!')
        router.push('/')
      })
      .catch((err) => {
        console.error('Google login error:', err)
        setError(err.response?.data?.error || 'Authentication with backend failed.')
        toast.error('Google authentication failed.')
      })
  }, [router, setToken])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-blue-darker p-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl">
        <h2 className="text-3xl font-extrabold tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          Google Authentication
        </h2>

        {error ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 font-semibold text-red-400">
              {error}
            </div>
            <button
              onClick={() => router.push('/')}
              className="rounded-full border border-white/20 px-6 py-2 transition-colors hover:bg-white/10"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <Spinner className="h-12 w-12 text-primary-500" />
            <p className="font-medium text-slate-300">
              Verifying authorization token, please wait...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
