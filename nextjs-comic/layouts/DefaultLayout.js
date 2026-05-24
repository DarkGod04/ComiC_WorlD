import Footer from '@/components/common/Footer'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import Body from './Body'
import Navbar from './Navbar'

function DefaultLayout({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') console.log('home')
  })

  return (
    <>
      <div className="fixed inset-0 z-[-10] h-[100vh] w-[100vw] overflow-hidden bg-slate-50 transition-colors duration-300 dark:bg-dark-blue-darker">
        <div className="absolute -inset-[10%] h-[120%] w-[120%] animate-pan-bg bg-[url('/static/images/cinematic_bg.png')] bg-cover bg-center opacity-0 mix-blend-screen transition-opacity duration-300 dark:opacity-40" />
        <div className="dark:via-dark-blue-DEFAULT/50 absolute inset-0 bg-gradient-to-b from-slate-100/80 via-slate-50/50 to-slate-100 transition-colors duration-300 dark:from-dark-blue-darker/80 dark:to-dark-blue-darker" />
      </div>
      <div className="relative z-0 text-slate-900 transition-colors duration-300 dark:text-slate-100">
        <Navbar />
        <Body>{children}</Body>
        <Footer />
      </div>
    </>
  )
}

DefaultLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default DefaultLayout
