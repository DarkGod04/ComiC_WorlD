import { useState, useEffect } from 'react'
import {
  FaBookOpen,
  FaArrowsAltV,
  FaCog,
  FaKeyboard,
  FaPlay,
  FaPause,
  FaSyncAlt,
} from 'react-icons/fa'
import { publicRoutes } from '@/lib/utils/getRoutes'
import chapterSLugify from '@/lib/utils/chapterSlugify'
import CustomLink from '@/components/common/Link'

export default function ReaderControls({
  layoutMode,
  setLayoutMode,
  bgColor,
  setBgColor,
  readerWidth,
  setReaderWidth,
  autoScrollSpeed,
  setAutoScrollSpeed,
  isAutoScrolling,
  setIsAutoScrolling,
  comicSlug,
  prevChapterNum,
  nextChapterNum,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  // BG Color map
  const bgClasses = {
    dark: 'bg-neutral-900 text-neutral-100',
    light: 'bg-white text-neutral-900',
    sepia: 'bg-orange-50 text-amber-900',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Control Drawer / Panel */}
      {isOpen && (
        <div className="reader-settings-panel mb-2 w-80 rounded-2xl border border-neutral-200/80 bg-white/90 p-6 text-neutral-800 shadow-2xl backdrop-blur-md transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-200">
          <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <FaCog className="animate-spin-slow text-indigo-500" /> Reader Settings
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5">
            {/* Reading Mode */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Reading Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLayoutMode('webtoon')}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-all ${
                    layoutMode === 'webtoon'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  <FaArrowsAltV /> Webtoon
                </button>
                <button
                  onClick={() => setLayoutMode('manga')}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-all ${
                    layoutMode === 'manga'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  <FaBookOpen /> Manga (Paged)
                </button>
              </div>
            </div>

            {/* Background Theme */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Viewer Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(bgClasses).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setBgColor(theme)}
                    className={`rounded-lg border py-2 px-3 text-sm font-medium capitalize transition-all ${
                      bgColor === theme
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-neutral-200 dark:border-neutral-800'
                    } ${
                      theme === 'dark'
                        ? 'bg-neutral-900 text-white'
                        : theme === 'light'
                        ? 'text-neutral-950 bg-white'
                        : 'text-amber-950 bg-orange-50'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Reader Width (Zoom) */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Container Width ({readerWidth})
              </label>
              <div className="flex gap-2">
                {['600px', '800px', '1000px', '100%'].map((w) => (
                  <button
                    key={w}
                    onClick={() => setReaderWidth(w)}
                    className={`flex-1 rounded-lg py-1 px-2 text-xs font-semibold transition-all ${
                      readerWidth === w
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {w === '100%' ? 'Full' : w}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Scroll */}
            {layoutMode === 'webtoon' && (
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Auto Scroll
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                    className={`rounded-lg p-3 text-white transition-all ${
                      isAutoScrolling
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isAutoScrolling ? <FaPause /> : <FaPlay />}
                  </button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={autoScrollSpeed}
                      onChange={(e) => setAutoScrollSpeed(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-indigo-600 dark:bg-neutral-800"
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
                      <span>Slow</span>
                      <span>Speed: {autoScrollSpeed}x</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter Quick Switch */}
            <div className="flex gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
              {prevChapterNum ? (
                <CustomLink
                  href={publicRoutes.chapterDetail.getDynamicPath(
                    comicSlug,
                    chapterSLugify(prevChapterNum)
                  )}
                  className="flex-1 rounded-lg bg-neutral-100 py-2 px-3 text-center text-xs font-semibold hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                >
                  ◀ Prev Chap
                </CustomLink>
              ) : (
                <button
                  disabled
                  className="flex-1 cursor-not-allowed rounded-lg bg-neutral-50 py-2 px-3 text-center text-xs font-semibold opacity-40 dark:bg-neutral-900"
                >
                  ◀ Prev Chap
                </button>
              )}

              {nextChapterNum ? (
                <CustomLink
                  href={publicRoutes.chapterDetail.getDynamicPath(
                    comicSlug,
                    chapterSLugify(nextChapterNum)
                  )}
                  className="flex-1 rounded-lg bg-neutral-100 py-2 px-3 text-center text-xs font-semibold hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                >
                  Next Chap ▶
                </CustomLink>
              ) : (
                <button
                  disabled
                  className="flex-1 cursor-not-allowed rounded-lg bg-neutral-50 py-2 px-3 text-center text-xs font-semibold opacity-40 dark:bg-neutral-900"
                >
                  Next Chap ▶
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Dialog */}
      {showKeyboardHelp && (
        <div className="reader-shortcuts-panel mb-2 w-72 rounded-2xl border border-neutral-200 bg-white/95 p-5 text-neutral-800 shadow-2xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 dark:text-neutral-200">
          <div className="mb-3 flex items-center justify-between border-b pb-2 dark:border-neutral-800">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <FaKeyboard className="text-indigo-500" /> Keyboard Shortcuts
            </h4>
            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="text-xs font-bold text-neutral-400 hover:text-neutral-600"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-2 text-xs">
            <li className="flex justify-between">
              <span className="font-medium text-neutral-500">Manga mode:</span>
              <span>Left / Right Arrow</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium text-neutral-500">Auto-Scroll:</span>
              <span>Spacebar (Webtoon)</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium text-neutral-500">Settings Panel:</span>
              <span>S key</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium text-neutral-500">Reset View:</span>
              <span>R key</span>
            </li>
          </ul>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
          className="rounded-full border border-neutral-200 bg-white/90 p-3.5 text-neutral-700 shadow-xl backdrop-blur-sm transition duration-200 hover:scale-105 dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-300"
          title="Keyboard Shortcuts"
        >
          <FaKeyboard />
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-full bg-indigo-600 py-3 px-5 text-sm font-semibold text-white shadow-xl transition duration-200 hover:scale-105 hover:bg-indigo-700"
          title="Settings"
        >
          <FaCog className={isOpen ? 'animate-spin-slow' : ''} /> Controls
        </button>
      </div>
    </div>
  )
}
