import { login } from '@/services/userService'
import toast from 'react-hot-toast'
import { useAsyncFn } from './useAsync'
import { useAuthDispatch } from './useAuthDispatch'
import { useAuthState } from './useAuthState'
import { useRouter } from 'next/router'

export const useLogin = () => {
  const router = useRouter()
  const { dispatch } = useAuthDispatch()
  const { setToken } = useAuthState()

  const { execute: loginFn, loading, error, setError } = useAsyncFn(login)

  const loginUser = (username, password, onCloseBtnClick) => {
    return loginFn({ username, password })
      .then((data) => {
        // save the token to local storage
        setToken(data)

        // Close form
        if (onCloseBtnClick) {
          onCloseBtnClick()
        }

        // Show message
        toast.success('Login successfully')

        // Redirect to home page
        router.push('/')
      })
      .catch((err) => setError(err))
  }

  return { loginUser, loading, error }
}
