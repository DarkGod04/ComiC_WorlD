import Container from '@/components/common/Container'
import Image from '@/components/common/Image'
import CustomLink from '@/components/common/Link'
import CommentSection from '@/components/Section/CommentSection'
import { PageSEO } from '@/components/SEO'
import { chapterDetailMetaData } from '@/data/siteMetadata'
import useFetchV2 from '@/hooks/api/useFetchV2'
import { useAuthState } from '@/hooks/useAuthState'
import chapterToJSON from '@/lib/toJSON/chapterToJSON'
import chapterSLugify from '@/lib/utils/chapterSlugify'
import classNames from '@/lib/utils/classNames'
import { layouts } from '@/lib/utils/getLayout'
import { publicRoutes } from '@/lib/utils/getRoutes'
import { getChapterDetail, getChapters, incChapterViews } from '@/services/comicService'
import useUserApi from '@/services/userService'
import { Transition } from '@headlessui/react'
import probe from 'probe-image-size'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCaretUp, FaExclamation, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import ReaderWatermark from '@/components/Reader/ReaderWatermark'
import ReaderControls from '@/components/Reader/ReaderControls'
import Navbar from '@/layouts/Navbar'
import Footer from '@/components/common/Footer'
import { CommentProvider } from '@/contexts/CommentProvider'

export async function getStaticProps({ params }) {
  try {
    const { comicSlug, chapterSlug } = params
    const staticChapter = chapterToJSON(await getChapterDetail(comicSlug, chapterSlug))

    const imagesWithSizes = await Promise.all(
      staticChapter.images.map(async (image) => {
        const imageWithSize = image
        imageWithSize.size = await probe(image.thumbnail)

        return imageWithSize
      })
    )

    return {
      props: { staticChapter, imagesWithSizes, comicSlug, chapterSlug },
      revalidate: parseInt(process.env.NEXT_PUBLIC_REVALIDATE_IN_1_HOUR),
    }
  } catch (error) {
    return {
      notFound: true,
    }
  }
}

export async function getStaticPaths() {
  if (process.env.NODE_ENV === 'development') {
    return {
      paths: [],
      fallback: 'blocking',
    }
  }

  const chapters = await getChapters()

  const paths = chapters.map((chapter) => {
    const { comic_slug: comicSlug, slug: chapterSlug } = chapter
    return {
      params: { comicSlug, chapterSlug },
    }
  })
  return {
    paths,
    fallback: 'blocking',
  }
}

function ChapterDetail({ staticChapter: chapter, imagesWithSizes, comicSlug, chapterSlug }) {
  const [bgColor, setBgColor] = useState('dark')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBg = localStorage.getItem('reader_bg')
      if (savedBg) setBgColor(savedBg)
    }
  }, [])

  const getPrevChapter = (chapter) => {
    const hasPrevChapter = chapter?.chapter_num - 1 === 0 ? false : true
    return hasPrevChapter ? chapter?.chapter_num - 1 : null
  }
  const getNextChapter = (chapter) => {
    return chapter?.chapter_num + 1
  }

  const chap = {
    ...chapter,
    comicSlug: comicSlug,
  }

  useEffect(function incView() {
    incChapterViews(comicSlug, chapterSlug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`reader-theme-${bgColor} min-h-screen transition-colors duration-500`}>
      <Navbar />
      <PageSEO
        title={chapterDetailMetaData.title(chap.comic_title, chapter?.chapter_num + 1)}
        description={chapterDetailMetaData.description}
      />

      <CommentProvider>
        <DetailContainer
          chap={chap}
          comicSlug={comicSlug}
          chapterSlug={chapterSlug}
          getPrevChapter={getPrevChapter}
          getNextChapter={getNextChapter}
          imagesWithSizes={imagesWithSizes}
          bgColor={bgColor}
          setBgColor={setBgColor}
        />

        <ScrollToTopButton />

        <Container>
          <CommentSection className="mt-10 flex-[100%]" comicSlug={comicSlug} />
        </Container>
      </CommentProvider>
      <Footer />
    </div>
  )
}

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  return (
    <Transition
      show={isVisible}
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        onClick={scrollToTop}
        className={classNames(
          'group fixed right-4 bottom-8 z-40 h-8 w-8 cursor-pointer rounded-full bg-dark-gray-darker transition-all duration-700 ease-out dark:bg-dark-blue-light sm:right-8'
        )}
      >
        <span className="flex h-full w-full items-center justify-center">
          <FaCaretUp className="h-5 w-5 fill-dark-blue-lighter group-hover:fill-dark-blue dark:group-hover:fill-dark-green-darker" />
        </span>
      </div>
    </Transition>
  )
}

function DetailContainer(props) {
  const [shouldShowImageList, setShouldShowImageList] = useState(true)
  const { user, isUserFetched } = useAuthState()
  const { comicSlug, chapterSlug, bgColor, setBgColor } = props

  // Reader Settings States
  const [layoutMode, setLayoutMode] = useState('webtoon')
  const [readerWidth, setReaderWidth] = useState('800px')
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(2)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { checkUserChapterPayment } = useUserApi()
  const { data: paymentState, mutate: paymentMutate } = useFetchV2({
    func: checkUserChapterPayment,
    deps: isUserFetched && !!chapterSlug,
    passProps: { comicSlug, chapterSlug },
  })

  // Load configuration from localstorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLayout = localStorage.getItem('reader_layout')
      const savedBg = localStorage.getItem('reader_bg')
      const savedWidth = localStorage.getItem('reader_width')
      const savedSpeed = localStorage.getItem('reader_speed')
      if (savedLayout) setLayoutMode(savedLayout)
      if (savedBg) setBgColor(savedBg)
      if (savedWidth) setReaderWidth(savedWidth)
      if (savedSpeed) setAutoScrollSpeed(parseInt(savedSpeed))
    }
  }, [])

  // Persist configurations
  useEffect(() => {
    localStorage.setItem('reader_layout', layoutMode)
  }, [layoutMode])
  useEffect(() => {
    localStorage.setItem('reader_bg', bgColor)
  }, [bgColor])
  useEffect(() => {
    localStorage.setItem('reader_width', readerWidth)
  }, [readerWidth])
  useEffect(() => {
    localStorage.setItem('reader_speed', autoScrollSpeed.toString())
  }, [autoScrollSpeed])

  // Handle Auto Scroll
  useEffect(() => {
    if (!isAutoScrolling || layoutMode !== 'webtoon') return

    let lastTime = performance.now()
    let frameId

    const scroll = (time) => {
      const elapsed = time - lastTime
      // Calculate speed in pixels per second based on the selected autoScrollSpeed setting
      const pixelsPerSecond = autoScrollSpeed * 35
      const scrollStep = (pixelsPerSecond * elapsed) / 1000

      window.scrollBy(0, scrollStep)
      lastTime = time

      const currentScroll = window.scrollY || window.pageYOffset
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (currentScroll >= maxScroll - 10) {
        setIsAutoScrolling(false)
      } else {
        frameId = requestAnimationFrame(scroll)
      }
    }

    frameId = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(frameId)
  }, [isAutoScrolling, autoScrollSpeed, layoutMode])

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return

      if (e.code === 'Space') {
        if (layoutMode === 'webtoon') {
          e.preventDefault()
          setIsAutoScrolling((prev) => !prev)
        }
      } else if (e.code === 'ArrowLeft') {
        if (layoutMode === 'manga') {
          e.preventDefault()
          setCurrentImageIndex((prev) => Math.max(0, prev - 1))
        }
      } else if (e.code === 'ArrowRight') {
        if (layoutMode === 'manga') {
          e.preventDefault()
          setCurrentImageIndex((prev) => Math.min(props.chap.images.length - 1, prev + 1))
        }
      } else if (e.code === 'KeyR') {
        setBgColor('dark')
        setLayoutMode('webtoon')
        setReaderWidth('800px')
        setAutoScrollSpeed(2)
        setIsAutoScrolling(false)
        setCurrentImageIndex(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [layoutMode, props.chap.images, isAutoScrolling, autoScrollSpeed])

  useEffect(() => {
    if (props.chap.price !== 0) {
      if (!user) {
        return setShouldShowImageList(false)
      }
      if (paymentState?.owned) {
        return setShouldShowImageList(true)
      }
      if (!paymentState?.owned) {
        return setShouldShowImageList(false)
      }
    }
    if (props.chap.price === 0) {
      setShouldShowImageList(true)
    }
  }, [isUserFetched, paymentState, user, props.chap.price])

  const prevChapterNum = props.getPrevChapter(props.chap)
  const nextChapterNum = props.getNextChapter(props.chap)

  return (
    <div className="py-6">
      {shouldShowImageList && <ReaderWatermark username={user?.username} />}

      <Container className="relative">
        {/* Top Mini Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-neutral-200/20 px-4 pb-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold">{props.chap.comic_title}</h1>
            <p className="mt-1 text-sm opacity-60">Chapter {props.chap.chapter_num}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-600/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              {layoutMode === 'webtoon'
                ? 'Scroll Mode'
                : `Page ${currentImageIndex + 1} / ${props.chap.images.length}`}
            </span>
          </div>
        </div>

        {/* Dynamic Reader Width Wrapper */}
        <div
          className="relative mx-auto select-none transition-all duration-300"
          style={{ maxWidth: readerWidth }}
          onContextMenu={(e) => e.preventDefault()} // Disable Right-Click
        >
          {shouldShowImageList ? (
            layoutMode === 'webtoon' ? (
              <ImageList
                images={props.chap.images}
                imagesWithSizes={props.imagesWithSizes}
                comicTitle={props.chap.comic_title}
              />
            ) : (
              <MangaSlider
                images={props.chap.images}
                imagesWithSizes={props.imagesWithSizes}
                comicTitle={props.chap.comic_title}
                currentIndex={currentImageIndex}
                setCurrentIndex={setCurrentImageIndex}
              />
            )
          ) : (
            <BuyChapter
              price={props.chap.price}
              paymentMutate={paymentMutate}
              comicSlug={comicSlug}
              chapterSlug={chapterSlug}
            />
          )}
        </div>

        {/* Navigation Quick Actions */}
        {shouldShowImageList && (
          <div className="mx-auto mt-10 flex max-w-xl items-center justify-between px-4">
            {prevChapterNum ? (
              <CustomLink
                href={publicRoutes.chapterDetail.getDynamicPath(
                  comicSlug,
                  chapterSLugify(prevChapterNum)
                )}
                className="flex items-center gap-2 rounded-lg bg-neutral-800/80 px-5 py-2.5 font-medium text-white transition hover:bg-neutral-700"
              >
                <FaArrowLeft /> Previous Chapter
              </CustomLink>
            ) : (
              <span className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-neutral-800 px-5 py-2.5 text-neutral-500 opacity-40">
                <FaArrowLeft /> First Chapter
              </span>
            )}

            {nextChapterNum ? (
              <CustomLink
                href={publicRoutes.chapterDetail.getDynamicPath(
                  comicSlug,
                  chapterSLugify(nextChapterNum)
                )}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white shadow-lg transition hover:bg-indigo-700"
              >
                Next Chapter <FaArrowRight />
              </CustomLink>
            ) : (
              <span className="flex cursor-not-allowed items-center gap-2 rounded-lg bg-neutral-800 px-5 py-2.5 text-neutral-500 opacity-40">
                Last Chapter <FaArrowRight />
              </span>
            )}
          </div>
        )}
      </Container>

      {/* Floating Reader Controls Panel */}
      {shouldShowImageList && (
        <ReaderControls
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
          bgColor={bgColor}
          setBgColor={setBgColor}
          readerWidth={readerWidth}
          setReaderWidth={setReaderWidth}
          autoScrollSpeed={autoScrollSpeed}
          setAutoScrollSpeed={setAutoScrollSpeed}
          isAutoScrolling={isAutoScrolling}
          setIsAutoScrolling={setIsAutoScrolling}
          comicSlug={comicSlug}
          prevChapterNum={prevChapterNum}
          nextChapterNum={nextChapterNum}
        />
      )}
    </div>
  )
}

function ImageList({ images, imagesWithSizes, comicTitle }) {
  if (!images || images.length === 0) {
    return <NoImagesFallback />
  }

  return (
    <ul className="flex flex-col gap-2">
      {images.map((item, index) => {
        const { width, height } = imagesWithSizes[index].size
        return (
          <ImageCard
            key={item.id}
            comicTitle={comicTitle}
            width={width}
            height={height}
            {...item}
          />
        )
      })}
    </ul>
  )
}

function MangaSlider({ images, imagesWithSizes, comicTitle, currentIndex, setCurrentIndex }) {
  if (!images || images.length === 0) {
    return <NoImagesFallback />
  }

  const currentImage = images[currentIndex]
  const size = imagesWithSizes[currentIndex].size

  return (
    <div className="group/slider relative select-none overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 shadow-2xl">
      {/* Click-to-prev left half zone */}
      <div
        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        className="absolute left-0 top-0 bottom-0 z-20 w-1/3 cursor-w-resize"
      />
      {/* Click-to-next right half zone */}
      <div
        onClick={() => setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1))}
        className="absolute right-0 top-0 bottom-0 z-20 w-2/3 cursor-e-resize"
      />

      <div className="flex min-h-[500px] items-center justify-center py-6">
        <Image
          className="h-auto max-h-[85vh] w-auto max-w-full select-none"
          alt={`${comicTitle} - Page ${currentIndex + 1}`}
          src={currentImage.src}
          width={size.width}
          height={size.height}
          isImgTag
          unoptimized
        />
      </div>

      {/* Slide Navigation HUD overlays */}
      <div className="group-hover/slider:opacity-100 pointer-events-none absolute left-4 top-1/2 z-30 -translate-y-1/2 opacity-0 transition">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setCurrentIndex((prev) => Math.max(0, prev - 1))
          }}
          disabled={currentIndex === 0}
          className="pointer-events-auto rounded-full bg-black/60 p-3.5 text-white backdrop-blur-sm transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <FaArrowLeft />
        </button>
      </div>

      <div className="group-hover/slider:opacity-100 pointer-events-none absolute right-4 top-1/2 z-30 -translate-y-1/2 opacity-0 transition">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1))
          }}
          disabled={currentIndex === images.length - 1}
          className="pointer-events-auto rounded-full bg-black/60 p-3.5 text-white backdrop-blur-sm transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <FaArrowRight />
        </button>
      </div>

      {/* Progress HUD bar */}
      <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/70 px-4 py-1.5 text-xs font-semibold tracking-widest text-white backdrop-blur-md">
        PAGE {currentIndex + 1} OF {images.length}
      </div>
    </div>
  )
}

function BuyChapter({ price, paymentMutate, comicSlug, chapterSlug }) {
  const { buyChapter } = useUserApi()
  const { mutateUser } = useAuthState()

  const handleBuyChapter = () => {
    if (window.confirm(`Are you sure to buy this Chapter for ${price} coins?`)) {
      return buyChapter({ comicSlug: comicSlug, chapterSlug: chapterSlug })
        .then((res) => {
          if (res?.bought === true) {
            paymentMutate()
            mutateUser()
            toast.success(res?.message)
          } else {
            toast.error(res?.message)
          }
        })
        .catch((err) => toast.error(err))
    }
  }

  return (
    <form onClick={handleBuyChapter} className="my-8 mx-auto max-w-md cursor-pointer space-y-4">
      <span className="group color-card-hover color-border-primary color-card block rounded-xl border p-6 shadow-lg transition duration-300">
        <article className="flex flex-row items-center">
          <div className="flex h-full flex-col">
            <h2 className="color-text-primary color-text-primary-group-hover text-lg font-bold capitalize">
              Unlock for {price} coins
            </h2>
            <span className="color-text-primary color-text-primary-group-hover pt-3 text-sm font-semibold opacity-70">
              You need to buy this chapter to continue reading. Click to unlock.
            </span>
          </div>
          <span className="color-text-primary color-text-primary-group-hover ml-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        </article>
      </span>
    </form>
  )
}

function NoImagesFallback() {
  return (
    <Container className="mt-7">
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaExclamation className="h-5 w-5 text-yellow-600" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Admin did not upload any images in this chapter
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Please contact admin to fix this problem.</p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

function ImageCard({ src, comicTitle, width, height }) {
  return (
    <li className="relative flex w-full justify-center">
      <Image
        className="h-auto w-full select-none"
        alt={comicTitle}
        src={src}
        width={width}
        height={height}
        isImgTag
        unoptimized
      />
    </li>
  )
}

ChapterDetail.layout = null
export default ChapterDetail
