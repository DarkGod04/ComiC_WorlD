import CustomLink from '@/components/common/Link'
import MobileNav from '@/components/common/MobileNav'
import Search from '@/components/common/Search'
import ThemeSwitch from '@/components/common/ThemeSwitch'
import UserProfile from '@/components/common/UserProfile'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/logo.svg'
import { siteMetadata } from 'data/siteMetadata'
import { useEffect } from 'react'

function Navbar() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') console.log('navbar re-render')
  })

  return (
    <header className="sticky top-0 z-50 min-h-[64px] w-full bg-dark-blue-darker/60 backdrop-blur-md border-b border-white/5 shadow-lg">
      <div
        // style={{ boxShadow: '0 4px 2px -2px gray' }}
        className="mx-4 lg:mx-8 flex max-h-16 items-center justify-between py-4"
      >
        {/* Left Logo */}
        <div>
          <CustomLink href="/" aria-label={siteMetadata.headerTitle}>
            <div className="flex items-center justify-between">
              <div className="mr-3 h-4 w-7">
                <Logo />
              </div>
              {typeof siteMetadata.headerTitle === 'string' ? (
                <div className="hidden h-6 text-xl font-semibold md:block">
                  {siteMetadata.headerTitle}
                </div>
              ) : (
                siteMetadata.headerTitle
              )}
            </div>
          </CustomLink>
        </div>
        {/* Right navlinks */}
        <div className="flex items-center text-base leading-5">
          <div className="hidden space-x-4 sm:space-x-6 md:block xl:hidden">
            {headerNavLinks.map((link) => (
              <CustomLink
                key={link.title}
                href={link.href}
                className="text-sm font-medium  hover:text-primary-500  dark:hover:text-primary-400"
              >
                {link.title}
              </CustomLink>
            ))}
          </div>
          <div className="ml-5 flex items-center space-x-4 border-slate-200 pl-6 dark:border-slate-800 sm:space-x-6  sm:border-l xl:border-0">
            <Search />
            <span className="hidden md:block" aria-label="Theme Swicher">
              <ThemeSwitch />
            </span>
            <MobileNav />
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
