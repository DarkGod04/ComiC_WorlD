import CardList from '@/components/Card/CardList'
import LongSlimCard from '@/components/Card/LongSlimCard'
import HomeCarousel from '@/components/Carousel/CarouselSlider'
import Container from '@/components/common/Container'
import CustomLink from '@/components/common/Link'
import Pagination from '@/components/common/Pagination'
import PictureTextSkeleton from '@/components/Skeleton/PictureTextSkeleton'
import constant from '@/data/constants'
import headerNavLinks from '@/data/headerNavLinks'
import usePaginatedQuery from '@/hooks/usePaginatedQuery'
import comicsToJSON from '@/lib/toJSON/comicsToJSON'
import classNames from '@/lib/utils/classNames'
import { getComics } from '@/services/comicService'
import { PageSEO } from 'components/SEO'
import { siteMetadata } from 'data/siteMetadata'
import { useRouter } from 'next/router'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export async function getStaticProps() {
  try {
    const LIMIT = 6 // Changed to 6

    const [recommendComics, lastestComic] = await Promise.all([
      getComics({ type: 'less', limit: 10 }), // Keep recommend at 10 for carousel
      getComics({ type: 'less', limit: LIMIT }),
    ])

    return {
      props: { recommendComics, lastestComic },
      revalidate: parseInt(process.env.NEXT_PUBLIC_REVALIDATE_IN_1_HOUR),
    }
  } catch (error) {
    console.log(error)
    return {
      notFound: true,
    }
  }
}

export default function Home(props) {
  return (
    <Container className="overflow-hidden">
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="flex flex-row space-x-0 xl:space-x-10">
        <Sidebar />
        <div className="flex-1">
          <RecommendSection initialComics={comicsToJSON(props.recommendComics.results)} />
          <LastestUpdateSection
            initialComics={comicsToJSON(props.lastestComic.results)}
            totalRecords={props.lastestComic.count}
          />
          <FilterSection
            initialComics={comicsToJSON(props.lastestComic.results)}
            totalRecords={props.lastestComic.count}
          />
        </div>
      </div>
    </Container>
  )
}

function LastestUpdateSection({ initialComics, totalRecords }) {
  const pageSize = 6
  const [lastestComic, setLastestComic] = useState(initialComics)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await getComics({
          params: { type: 'less', limit: pageSize, page: currentPage },
        })
        if (isMounted) {
          const newComics = comicsToJSON(res.results)
          if (currentPage === 1) {
            setLastestComic(newComics)
          } else {
            setLastestComic((prev) => [...prev, ...newComics])
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [currentPage])

  const hasMore = lastestComic?.length < totalRecords

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <section className="min-h-[500px]" aria-label="Lastest Update Section">
        <div className="space-y-2 pt-6 pb-6 md:space-y-5">
          <h1 className="text-xl font-extrabold leading-9 tracking-tight text-slate-900 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] dark:text-gray-100 dark:drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] sm:leading-10 md:text-xl md:leading-14">
            Lastest Update
          </h1>
        </div>

        <div className="relative z-10 w-full" aria-label="Lastest Update container">
          {loading && currentPage === 1 ? (
            <div className="flex flex-row flex-wrap justify-between">
              {Array(pageSize)
                .fill()
                .map((_, index) => (
                  <div
                    key={index}
                    className={classNames(
                      (index == 1 && 'border-white/10 md:border-t-2') ||
                        (index == 0 && 'border-t-2 border-white/10'),
                      'flex w-full items-center space-x-3 self-center border-b-2 border-white/10 p-2 last-of-type:ml-auto md:w-[49%]'
                    )}
                  >
                    <PictureTextSkeleton error={false} height={80} />
                  </div>
                ))}
            </div>
          ) : (
            <CardList
              className="flex flex-row flex-wrap justify-between"
              CardComp={LongSlimCard}
              items={lastestComic}
              limit={lastestComic?.length}
            />
          )}
        </div>
      </section>

      <div className="relative z-10 mt-6 mb-8 flex justify-center space-x-4">
        {hasMore && (
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(6,182,212,0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={loading}
            className="flex items-center space-x-2 rounded-full border border-primary-500/50 bg-dark-blue-darker/80 px-8 py-3 font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-primary-500 hover:bg-primary-500 disabled:opacity-50"
          >
            {loading ? (
              <svg
                className="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <span>Load More</span>
            )}
          </motion.button>
        )}
        {currentPage > 1 && (
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(255,100,100,0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentPage(1)
              setLastestComic((prev) => prev.slice(0, pageSize))
            }}
            disabled={loading}
            className="flex items-center space-x-2 rounded-full border border-red-500/50 bg-dark-blue-darker/80 px-8 py-3 font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-red-500 hover:bg-red-500 disabled:opacity-50"
          >
            <span>Show Less</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

function RecommendSection({ initialComics }) {
  const [recommendComics, setRecommendComics] = useState(initialComics)

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="min-h-[476px] sm:min-h-[496px]"
      aria-label="Recommends Section"
    >
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-xl font-extrabold leading-9 tracking-tight text-slate-900 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] dark:text-gray-100 dark:drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] sm:leading-10 md:text-2xl md:leading-14">
          Recommends
        </h1>
      </div>

      <div
        className="relative max-w-[94vw] xl:max-w-[calc(100vw-360px)]"
        aria-label="Carousel container"
      >
        <HomeCarousel comics={recommendComics} />
      </div>
    </motion.section>
  )
}

function FilterSection({ initialComics, totalRecords }) {
  const pageSize = 6
  const [category, setCategory] = useState('All')
  const [filteredComics, setFilteredComics] = useState(initialComics)
  const [total, setTotal] = useState(totalRecords)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const isFirstRender = useRef(true)

  const categories = ['All', 'Manga', 'Action', 'Adventure', 'Manhwa', 'Manhua']

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const options = { type: 'less', limit: pageSize, page: currentPage }
        if (category !== 'All') {
          options.category = category.toLowerCase()
        }
        const res = await getComics({ params: options })
        if (isMounted) {
          const newComics = comicsToJSON(res.results)
          if (currentPage === 1) {
            setFilteredComics(newComics)
          } else {
            setFilteredComics((prev) => [...prev, ...newComics])
          }
          setTotal(res.count)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [category, currentPage])

  const hasMore = filteredComics?.length < total

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="pb-16"
    >
      <section className="min-h-[500px] pt-12" aria-label="Filter Section">
        <div className="flex flex-col space-y-4 pt-6 pb-6 md:space-y-5 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="text-xl font-extrabold leading-9 tracking-tight text-slate-900 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] dark:text-gray-100 dark:drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] sm:leading-10 md:text-xl md:leading-14">
            Explore Categories
          </h1>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat)
                  setCurrentPage(1)
                }}
                className={classNames(
                  category === cat
                    ? 'border-primary-500 bg-primary-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                    : 'border-slate-200 bg-slate-100/60 text-slate-700 hover:border-primary-500/50 hover:text-slate-900 dark:border-white/10 dark:bg-dark-blue-darker/60 dark:text-gray-300 dark:hover:text-white',
                  'rounded-xl border px-5 py-2 text-sm font-semibold backdrop-blur-md transition-all duration-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 w-full" aria-label="Filtered Update container">
          {loading && currentPage === 1 ? (
            <div className="flex flex-row flex-wrap justify-between">
              {Array(pageSize)
                .fill()
                .map((_, index) => (
                  <div
                    key={index}
                    className={classNames(
                      (index == 1 && 'border-white/10 md:border-t-2') ||
                        (index == 0 && 'border-t-2 border-white/10'),
                      'flex w-full items-center space-x-3 self-center border-b-2 border-white/10 p-2 last-of-type:ml-auto md:w-[49%]'
                    )}
                  >
                    <PictureTextSkeleton error={false} height={80} />
                  </div>
                ))}
            </div>
          ) : (
            <CardList
              className="flex flex-row flex-wrap justify-between"
              CardComp={LongSlimCard}
              items={filteredComics}
              limit={filteredComics?.length}
            />
          )}
        </div>
      </section>

      <div className="relative z-10 mt-6 flex justify-center space-x-4">
        {hasMore && (
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(6,182,212,0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={loading}
            className="flex items-center space-x-2 rounded-full border border-primary-500/50 bg-dark-blue-darker/80 px-8 py-3 font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-primary-500 hover:bg-primary-500 disabled:opacity-50"
          >
            {loading ? (
              <svg
                className="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <span>Load More</span>
            )}
          </motion.button>
        )}
        {currentPage > 1 && (
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(255,100,100,0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentPage(1)
              setFilteredComics((prev) => prev.slice(0, pageSize))
            }}
            disabled={loading}
            className="flex items-center space-x-2 rounded-full border border-red-500/50 bg-dark-blue-darker/80 px-8 py-3 font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-red-500 hover:bg-red-500 disabled:opacity-50"
          >
            <span>Show Less</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="left-0 mt-6 hidden h-[calc(100vh-64px)] min-w-[15rem] rounded-tr-3xl border-r border-slate-200 bg-white/40 shadow-[4px_0_24px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-dark-blue-darker/40 dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)] xl:block"
      aria-label="Side Bar"
    >
      <div className="divide-gray mt-5 max-w-[80%] divide-y">
        <h2 className="text-muted mb-3 text-sm">Menu</h2>
        <NavList links={headerNavLinks} />
      </div>
    </motion.aside>
  )
}

function NavList({ links }) {
  return links?.length > 0 ? (
    <ul className="space-y-2 pt-3" aria-label="Sidebar Menu">
      {links.map((link) => (
        <NavLink key={link.title} href={link.href} title={link.title} icon={link.icon} />
      ))}
    </ul>
  ) : null
}

function NavLink({ href, title, icon }) {
  const router = useRouter()
  return (
    <li>
      <CustomLink
        href={href}
        className={classNames(
          router.pathname == href
            ? 'text-primary-active'
            : 'text-slate-600 hover:text-primary-500 dark:text-slate-300 dark:hover:text-primary-400',
          'bg-primary-hover flex cursor-pointer items-center space-x-2 rounded-md p-2 transition-colors duration-200'
        )}
      >
        <span className="flex h-7 w-7 justify-center">{icon}</span>
        <h3 className="text-base font-medium">{title}</h3>
      </CustomLink>
    </li>
  )
}
