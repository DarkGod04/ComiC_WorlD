import { DEFAULT_MENU_ITEMS, USER_ITEMS } from '@/data/authenticationMenu'
import { useAuthState } from '@/hooks/useAuthState'
import { useLogout } from '@/hooks/useLogout'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCoins } from 'react-icons/fa'
import { useClickAway } from 'react-use'
import Spinner from '../Skeleton/Spinner'
import AuthCheck from './AuthCheck'
import Image from './Image'
import CustomLink from './Link'
import tempProfileSrc from '/public/userProfile.png'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function UserProfile() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') console.log('profile re-render')
  })

  const { user, isFetchingUser } = useAuthState()
  const { logoutUser } = useLogout()
  const items = user ? USER_ITEMS : DEFAULT_MENU_ITEMS
  const [openDropdown, setOpenDropdown] = useState(false)

  // Handle logic
  const handleMenuChange = (menuItem) => {
    switch (menuItem.type) {
      case 'LOGIN BY USERNAME':
        return
      case 'LOGIN BY GOOGLE':
      case 'SIGNUP BY GOOGLE': {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId || clientId.includes('dummy')) {
          toast.error(
            'Google OAuth Client ID is not configured! Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your nextjs-comic/.env.local file.'
          )
          return
        }
        const redirectUri = `${window.location.origin}/auth/google/callback`
        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_type=token&scope=email%20profile`
        window.location.href = url
        return
      }
      case 'LOGOUT':
        return logoutUser().then(setOpenDropdown(false))
      case 'LANGUAGE':
        // Handle change language
        break
      default:
    }
  }

  // Handle Toggle menu
  const toggleMenu = () => setOpenDropdown((prev) => !prev)

  // Handle Clicked outside menu => Close menu
  const handleMenuClickedOutside = () => setOpenDropdown(false)

  const menuRef = useRef(null)

  useClickAway(menuRef, handleMenuClickedOutside)

  return (
    <div className="relative ml-3">
      <div>
        <button
          onClick={toggleMenu}
          type="button"
          className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
          id="user-menu-button"
          aria-expanded="false"
          aria-haspopup="true"
        >
          <span className="sr-only">Open user menu</span>

          <Image
            className="h-8 w-8 rounded-full"
            width={32}
            height={32}
            hasPlaceholder={false}
            src={
              user
                ? user?.avatar
                  ? user.avatar
                  : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                : tempProfileSrc
            }
            alt={user?.username || 'User Avatar'}
          />
        </button>
      </div>

      <div
        ref={menuRef}
        className={classNames(
          openDropdown ? '' : 'hidden',
          'absolute right-0 z-[100] mt-2 w-48 origin-top-right rounded-xl border border-white/10 bg-dark-blue-darker/80 py-1 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md focus:outline-none'
        )}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
        tabIndex="-1"
      >
        <AuthCheck>
          <div className="mb-1 flex flex-col border-b border-white/10 pb-1">
            <a className="flex flex-row items-center space-x-2 px-4 py-2 text-sm text-gray-300">
              <span>
                <FaCoins className="fill-yellow-400" />
              </span>
              <span className="font-semibold text-white">
                {isFetchingUser && <Spinner className="ml-2" />}
                {!isFetchingUser && user && user.coins + ' coins'}
              </span>
            </a>
            <a className="flex flex-row items-center space-x-2 px-4 py-2 text-sm text-gray-300">
              <span className="font-semibold text-primary-400">{user?.username}</span>
            </a>
          </div>
        </AuthCheck>
        {items.map((item, index) => {
          {
            /* Modal Menu Root */
          }
          if (item.type == 'modal') {
            const Comp = item.comp
            const loginMenu = DEFAULT_MENU_ITEMS.find((i) => i.title === 'Login')?.children
            const registerMenu = DEFAULT_MENU_ITEMS.find((i) => i.title === 'Register')?.children
            return (
              <Comp
                key={item.title}
                title={item.title}
                items={item.children}
                onChange={handleMenuChange}
                loginMenu={loginMenu}
                registerMenu={registerMenu}
              ></Comp>
            )
          }

          {
            /* Normal Menu Root */
          }
          if (item.type != 'modal') {
            return (
              <CustomLink
                key={item.title}
                href={item.to}
                className="block cursor-pointer px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                onClick={() => handleMenuChange(item)}
              >
                {item.title}
              </CustomLink>
            )
          }
        })}
      </div>
    </div>
  )
}
