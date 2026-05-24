import Image from '@/components/common/Image'
import CustomLink from '@/components/common/Link'
import Spinner from '@/components/Skeleton/Spinner'
import comicsToJSON from '@/lib/toJSON/comicsToJSON'
import { publicRoutes } from '@/lib/utils/getRoutes'
import * as searchServices from '@/services/searchService'
import { Popover, Transition } from '@headlessui/react'
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

function Search() {
  const buttonRef = useRef(null)
  const router = useRouter()

  const [searchValue, setSearchValue] = useState('')
  const [searchResult, setSearchResult] = useState([])
  const [loading, setLoading] = useState(false)
  const [isShowing, setIsShowing] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const shouldShowResult = searchResult?.length > 0
  const inputRef = useRef()
  const ONE_SECOND = 1000

  // Hit the database for matches after debounced change
  const checkValueAndSearch = useCallback(
    debounce(async (searchValue) => {
      if (!searchValue.trim()) {
        setIsShowing(false)
        setFocusedIndex(-1)
        setTimeout(() => setSearchResult([]), ONE_SECOND)
        return
      }

      const fetchApi = async () => {
        setLoading(true)
        const result = await searchServices.searchSuggest(searchValue)

        if (result?.length) {
          setSearchResult(comicsToJSON(result))
        } else {
          setSearchResult([])
        }
        setIsShowing(true)
        setFocusedIndex(-1)
        setLoading(false)
      }

      fetchApi()
    }, 500),
    []
  )

  useEffect(() => {
    checkValueAndSearch(searchValue)
  }, [searchValue, checkValueAndSearch])

  const handleClear = () => {
    setSearchValue('')
    setSearchResult([])
    setFocusedIndex(-1)
    inputRef.current.focus()
  }

  const handleChange = (e) => {
    const searchValue = e.target.value
    if (!searchValue.startsWith(' ')) {
      setSearchValue(searchValue)
    }
  }

  // Handle Keyboard Navigation for Autocomplete List
  const handleKeyDown = (e) => {
    if (!shouldShowResult) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev < searchResult.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : searchResult.length - 1))
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && focusedIndex < searchResult.length) {
        e.preventDefault()
        const selectedComic = searchResult[focusedIndex]
        router.push(publicRoutes.comicDetail.getDynamicPath(selectedComic.slug))
        // Programmatically close the Popover
        buttonRef.current?.click()
        handleClear()
      }
    } else if (e.key === 'Escape') {
      buttonRef.current?.click()
      handleClear()
    }
  }

  return (
    <Popover className="mt-1">
      <Popover.Button ref={buttonRef}>
        <span className="icon-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
            aria-label="Search Icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </span>
      </Popover.Button>

      <Popover.Overlay
        onClick={() => buttonRef.current?.click()}
        className="fixed inset-0 z-[100] bg-gray-400 opacity-90 dark:bg-slate-800"
      />
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        className="fixed top-0 left-0 z-[101] flex w-full flex-col p-6"
      >
        <Popover.Panel className="fixed top-0 left-0 z-[101] contents w-screen flex-col p-6">
          <form className="group relative mx-auto w-full max-w-2xl ">
            <svg
              width="20"
              height="20"
              fill="currentColor"
              className="pointer-events-none absolute left-3 top-1/2 -mt-2.5 text-slate-400 group-focus-within:text-blue-500"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              />
            </svg>
            <input
              autoFocus={true}
              ref={inputRef}
              value={searchValue}
              spellCheck={false}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="border-theme w-full appearance-none rounded-t-md border-b py-2 pl-10 text-sm leading-6 text-slate-400 placeholder-slate-400 shadow-sm outline-none dark:bg-slate-700 "
              type="text"
              aria-label="Filter comics"
              placeholder="Filter comics..."
              aria-autocomplete="list"
            />

            {/* Spinner */}
            {loading && <Spinner className="absolute right-14 top-3 " />}

            {/* Close btn */}
            <Popover.Button
              aria-label="Close Search button"
              onClick={handleClear}
              className="icon-primary absolute right-[10px] top-[10px]"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Popover.Button>
          </form>

          <section className="bg-slate-white mx-auto max-h-[26rem] w-full max-w-2xl overflow-auto p-5 pt-0 ">
            <Transition
              show={isShowing}
              enter="transform transition duration-[400ms]"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              {!shouldShowResult ? (
                <h2 className=" py-4 text-center font-medium">No results found</h2>
              ) : (
                <h2 className="border-theme border-b py-4 font-medium">Comics</h2>
              )}
              {shouldShowResult && (
                <ul role="list" className="border-theme space-y-1 border-b py-2">
                  {searchResult.map((comic, index) => (
                    <CustomLink
                      key={comic.slug}
                      href={publicRoutes.comicDetail.getDynamicPath(comic.slug)}
                      aria-label={comic.title}
                      onClick={() => {
                        buttonRef.current?.click()
                        handleClear()
                      }}
                    >
                      <li
                        key={comic.title}
                        className={`mb-1 flex items-center rounded-xl border border-transparent p-3 text-sm font-semibold uppercase transition duration-150 ${
                          index === focusedIndex
                            ? 'border-indigo-500/30 bg-indigo-600/10 dark:bg-indigo-600/20'
                            : 'bg-sky-hover hover:bg-indigo-50/50 dark:hover:bg-neutral-800/30'
                        }`}
                      >
                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200/50 dark:border-gray-800">
                          <Image
                            className="aspect-square h-full w-full object-cover"
                            width={40}
                            height={40}
                            src={comic.src}
                            alt={comic.title}
                          />
                        </div>
                        <div className="ml-3.5 overflow-hidden">
                          <p className="font-bold text-gray-800 dark:text-gray-100">
                            {comic.title}
                          </p>
                          <ul
                            role="list"
                            className="mt-0.5 flex flex-row items-center space-x-2 text-xs font-normal text-gray-400"
                          >
                            {comic.categories?.slice(0, 3).map((category) => (
                              <li
                                key={category.id}
                                className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] dark:bg-neutral-800"
                              >
                                {category.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    </CustomLink>
                  ))}
                </ul>
              )}
            </Transition>
          </section>

          <section className="bg-slate-white border-theme mx-auto w-full max-w-2xl rounded-b border-t p-3 text-center">
            <span className="text-[10px] font-medium text-gray-400">
              💡 Use Arrow keys ⬆⬇ to select, Enter to open, Esc to close
            </span>
          </section>
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}

export default Search
