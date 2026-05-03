import { Dialog, Transition } from '@headlessui/react'
import useHistories from 'hooks/useHistories'
import { Fragment, useState } from 'react'
import { FaChevronLeft } from 'react-icons/fa'
// import { FaChevronLeft } from 'react-icons/fa'

import { motion } from 'framer-motion'

const MenuItem = ({ onItemClick, onCloseBtnClick, icon, title, comp }) => {
  const Item = comp
  if (comp) return <Item onCloseBtnClick={onCloseBtnClick} />
  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: "0px 0px 10px rgba(6,182,212,0.3)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onItemClick}
      aria-label={title}
      className="group flex w-full items-center rounded-xl p-4 text-sm text-gray-300 bg-white/5 border border-white/10 transition-all hover:bg-primary-500/20 hover:border-primary-500/50 hover:text-white"
    >
      <span className="text-gray-400 group-hover:text-primary-400 transition-colors">{icon}</span>
      <span className="w-full text-center font-semibold tracking-wide">{title}</span>
    </motion.button>
  )
}

function Menu({ title, items, onChange, to }) {
  let [isOpen, setIsOpen] = useState(false)

  const [lastMenuItem, handleMenuItemClick, backToRoot, histories, setHistories, back] =
    useHistories({
      items: items,
      onChange: onChange,
    })

  const shouldShowHeader = histories?.length > 1

  function handleCloseModal() {
    setIsOpen(false)
    backToRoot()
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <button 
        type="button" 
        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer" 
        onClick={openModal}
      >
        {title}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog open={isOpen} as="div" className="relative z-50" onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="z-100 fixed inset-0 overflow-y-auto">
            <div className="z-100 relative flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-dark-blue-darker/80 backdrop-blur-2xl border border-white/10 p-6 text-left align-middle shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all">
                  <Dialog.Title
                    as="div"
                    className="mx-auto mb-6 pb-2 text-center text-lg font-medium leading-6 text-white"
                  >
                    {shouldShowHeader && (
                      <button
                        type="button"
                        className="absolute left-6 mt-2 cursor-pointer text-gray-400 hover:text-white transition-colors"
                        onClick={back}
                        aria-label="back"
                      >
                        <FaChevronLeft size={15} />
                      </button>
                    )}
                    <h3 className="mx-auto w-fit text-2xl font-bold tracking-tight drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                      {lastMenuItem?.title}
                    </h3>
                    <button
                      type="button"
                      className="absolute right-6 top-5 mt-[0.45rem] cursor-pointer text-gray-400 hover:text-white transition-colors"
                      onClick={handleCloseModal}
                      aria-label="Close"
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
                    </button>
                  </Dialog.Title>
                  <div className="mt-2 space-y-3">
                    {lastMenuItem?.data.map((item, index) => (
                      <MenuItem
                        onItemClick={() => handleMenuItemClick(item)}
                        key={item.title || index}
                        icon={item.icon}
                        title={item.title}
                        comp={item.comp}
                        onCloseBtnClick={handleCloseModal}
                      ></MenuItem>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default Menu
