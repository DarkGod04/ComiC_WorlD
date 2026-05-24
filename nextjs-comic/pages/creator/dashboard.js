import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import SettingLayoutWrapper from '@/components/common/SettingLayoutWrapper'
import { PageSEO } from '@/components/SEO'
import { useAuthState } from '@/hooks/useAuthState'
import useAxios from '@/hooks/auth/useAxios'
import { FaBook, FaEye, FaDollarSign, FaBookmark, FaChartLine } from 'react-icons/fa'

// Dynamically import Recharts to avoid Next.js SSR document-not-defined errors
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), {
  ssr: false,
})
const AreaChart = dynamic(() => import('recharts').then((m) => m.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then((m) => m.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), { ssr: false })
const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false })

export default function CreatorDashboard() {
  const { user } = useAuthState()
  const { makeAuthRequest } = useAxios()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      makeAuthRequest('creator/analytics/')
        .then((data) => {
          setStats(data)
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [user])

  if (!user) {
    return (
      <SettingLayoutWrapper>
        <div className="space-y-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please sign in to access the Creator Hub Dashboard.
          </p>
        </div>
      </SettingLayoutWrapper>
    )
  }

  return (
    <>
      <PageSEO title="Creator Analytics Dashboard" />
      <SettingLayoutWrapper>
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                <FaChartLine className="text-indigo-600" /> Creator Hub Analytics
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Real-time performance metrics and insights for your comics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-green-600 dark:text-green-400">
                Live Analytics
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm opacity-60">Loading metrics data...</div>
          ) : stats ? (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                  title="My Comics"
                  value={stats.total_comics}
                  Icon={FaBook}
                  color="text-blue-500 bg-blue-500/10"
                />
                <StatCard
                  title="Total Views"
                  value={stats.total_views}
                  Icon={FaEye}
                  color="text-indigo-500 bg-indigo-500/10"
                />
                <StatCard
                  title="Total Earnings"
                  value={`$${stats.total_earnings}`}
                  Icon={FaDollarSign}
                  color="text-emerald-500 bg-emerald-500/10"
                />
                <StatCard
                  title="Total Bookmarks"
                  value={stats.total_bookmarks}
                  Icon={FaBookmark}
                  color="text-yellow-500 bg-yellow-500/10"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Views Area Chart */}
                <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-900">
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                    Views Traffic (Weekly)
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.trends}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-gray-100 dark:stroke-neutral-800"
                        />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="#4f46e5"
                          fillOpacity={1}
                          fill="url(#colorViews)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Earnings Bar Chart */}
                <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-900">
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                    Earnings Performance (Weekly)
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.trends}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-gray-100 dark:stroke-neutral-800"
                        />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Published Comics Table/Grid */}
              <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-900">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                  My Series Performance
                </h3>
                {stats.comics && stats.comics.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-neutral-800">
                          <th className="pb-3">Series Title</th>
                          <th className="pb-3">Views</th>
                          <th className="pb-3">Total Earnings</th>
                          <th className="pb-3">Subscribers</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700 dark:divide-neutral-800 dark:text-gray-200">
                        {stats.comics.map((comic) => (
                          <tr
                            key={comic.id}
                            className="transition hover:bg-gray-50/50 dark:hover:bg-neutral-800/20"
                          >
                            <td className="py-3 font-semibold text-indigo-600 dark:text-indigo-400">
                              {comic.title}
                            </td>
                            <td className="py-3">{comic.views}</td>
                            <td className="py-3 font-bold">${comic.earnings}</td>
                            <td className="py-3">{comic.bookmarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm opacity-40">
                    You have not published any series yet.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-sm opacity-60">
              Unable to retrieve creator analytics.
            </div>
          )}
        </div>
      </SettingLayoutWrapper>
    </>
  )
}

function StatCard({ title, value, Icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-neutral-900">
      <div className="space-y-1">
        <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </span>
        <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{value}</span>
      </div>
      <div className={`rounded-xl p-4 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  )
}
