import Container from '@/components/common/Container'
import CustomLink from '@/components/common/Link'
import { publicRoutes } from '@/lib/utils/getRoutes'
import { getCategories } from '@/services/categoryServices.js'
import { PageSEO } from 'components/SEO'
import { siteMetadata } from 'data/siteMetadata'
import kebabCase from 'lib/utils/kebabCase'
import { motion } from 'framer-motion'
import { HiTag } from 'react-icons/hi'

export async function getStaticProps() {
  const tags = await getCategories({ type: 'detail' })
  return { props: { tags } }
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
}

export default function Tags({ tags }) {
  return (
    <Container className="min-h-screen">
      <PageSEO
        title={`Tags - ${siteMetadata.author}`}
        description="Discover comics by categories and genres"
      />

      <div className="flex flex-col items-center justify-center pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
            Explore{' '}
            <span className="text-primary-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              Tags
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Dive into our diverse collection of stories. From pulse-pounding action to epic
            adventures, find the perfect genre for your next read.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-20 grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {tags.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">No tags found.</div>
          )}
          {tags.map((tag) => {
            return (
              <motion.div
                key={tag.id}
                variants={item}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CustomLink
                  href={publicRoutes.categories.getDynamicPath(kebabCase(tag.name))}
                  className="group relative block"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-dark-blue-darker/40 p-8 backdrop-blur-md transition-all duration-300 group-hover:border-primary-500/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500 transition-colors duration-300 group-hover:bg-primary-500 group-hover:text-white">
                          <HiTag className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white transition-colors group-hover:text-primary-400">
                            {tag.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex h-9 min-w-[36px] items-center justify-center rounded-full bg-white/5 px-3 text-sm font-bold text-gray-400 group-hover:bg-primary-500/20 group-hover:text-primary-400">
                        {tag.count}
                      </div>
                    </div>

                    {/* Decorative background glow */}
                    <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary-500/5 blur-3xl transition-all duration-300 group-hover:bg-primary-500/10" />
                  </div>
                </CustomLink>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </Container>
  )
}
