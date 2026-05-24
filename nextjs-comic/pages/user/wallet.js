import SettingLayoutWrapper from '@/components/common/SettingLayoutWrapper'
import { PageSEO } from '@/components/SEO'
import Spinner from '@/components/Skeleton/Spinner'
import { useAuthState } from '@/hooks/useAuthState'
import useFetch from '@/hooks/api/useFetch'
import { useAsyncFn } from '@/hooks/useAsync'
import useProductApi from '@/services/productServices'
import useStripeApi from '@/services/stripeService'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { FaCoins, FaCrown, FaCheckCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function UserWallet() {
  const { user, isUserFetched } = useAuthState()
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    if (query.get('success')) {
      setMessage({
        isSuccess: true,
        description:
          'Order placed successfully! It may take a few seconds to update your balance. Please refresh.',
      })
      toast.success('Order completed!')
    }
    if (query.get('canceled')) {
      setMessage({
        isSuccess: false,
        description: 'Payment was canceled.',
      })
      toast.error('Payment canceled.')
    }
  }, [])

  return (
    <>
      <PageSEO title="My Wallet & Subscriptions" />
      <SettingLayoutWrapper>
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Wallet & Membership
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your coins, subscriptions, and billing.
            </p>
          </div>

          {/* Success/Error Alerts */}
          {message && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                message.isSuccess
                  ? 'dark:bg-green-950/30 border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:text-green-300'
                  : 'dark:bg-red-950/30 border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:text-red-300'
              }`}
            >
              <FaCheckCircle className="mt-0.5 h-5 w-5" />
              <div>
                <h3 className="text-sm font-semibold">
                  {message.isSuccess ? 'Transaction Completed' : 'Transaction Canceled'}
                </h3>
                <p className="mt-1 text-xs opacity-90">{message.description}</p>
              </div>
            </div>
          )}

          {/* User Profile Card with Coins and XP */}
          {user && (
            <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white shadow-xl md:flex-row md:items-center md:p-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white/40">
                    <img
                      src={
                        user.avatar ||
                        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                      }
                      alt="user avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{user.username}</h2>
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white">
                      LV.{user.level || 1} Reader
                    </span>
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-indigo-100">
                    <span>Level Progress</span>
                    <span>
                      {user.xp || 0} / {(user.level || 1) * 100} XP
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          ((user.xp || 0) / ((user.level || 1) * 100)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Wallet Info Column */}
              <div className="flex w-full flex-row justify-between gap-6 border-t border-white/20 pt-4 md:w-auto md:flex-col md:gap-3 md:border-t-0 md:pt-0">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-indigo-100">
                    Coins Balance
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <FaCoins className="h-6 w-6 text-yellow-300" />
                    <span className="text-2xl font-black">{user.coins || 0}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-indigo-100">
                    VIP Membership
                  </span>
                  {user.is_vip ? (
                    <div className="mt-1 flex items-center gap-1.5 text-yellow-300">
                      <FaCrown className="h-5 w-5" />
                      <span className="text-sm font-extrabold uppercase tracking-wide">
                        Active VIP
                      </span>
                    </div>
                  ) : (
                    <span className="mt-1 block text-sm font-semibold opacity-70">
                      None (Free Tier)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shop Sections */}
          <ShopInterface />
        </div>
      </SettingLayoutWrapper>
    </>
  )
}

function ShopInterface() {
  const { getCoinsUrl } = useProductApi()
  const { data: coinPackages, isLoading: loadingCoins } = useFetch({ url: getCoinsUrl.url })
  const { data: vipPackages, isLoading: loadingVip } = useFetch({
    url: `${getCoinsUrl.url}?category=vip`,
  })

  const [selectedProductId, setSelectedProductId] = useState(null)
  const { createStripePayment } = useStripeApi()
  const createPaymentFn = useAsyncFn(createStripePayment)

  const handlePurchase = (productId) => {
    setSelectedProductId(productId)
    createPaymentFn
      .execute({ coin: productId })
      .then((res) => {
        if (res?.redirect_to) {
          Router.push(res.redirect_to)
        }
      })
      .catch((err) => {
        toast.error('Payment checkout initiation failed.')
        console.error(err)
      })
  }

  return (
    <div className="space-y-10">
      {/* VIP Subscriptions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FaCrown className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            VIP Subscription Plans
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Unlock all chapters across the site with premium monthly membership.
        </p>

        {loadingVip ? (
          <div className="py-8 text-center text-sm opacity-60">Loading subscription plans...</div>
        ) : vipPackages && vipPackages.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {vipPackages.map((pack) => (
              <div
                key={pack.id}
                className="group flex h-48 flex-col justify-between rounded-2xl border border-2 border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-transparent p-6 transition hover:shadow-lg"
              >
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-extrabold text-gray-900 dark:text-gray-100">
                    {pack.name}{' '}
                    <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-yellow-600 dark:text-yellow-400">
                      Best Value
                    </span>
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Unlimited access to all comics, chapters, and exclusive VIP badges.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
                    ${pack.price} <span className="text-xs font-semibold text-gray-500">/ mo</span>
                  </span>
                  <button
                    onClick={() => handlePurchase(pack.id)}
                    disabled={createPaymentFn.loading}
                    className="text-gray-950 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-bold shadow-lg shadow-yellow-500/20 transition hover:bg-yellow-600 disabled:opacity-40"
                  >
                    {createPaymentFn.loading && selectedProductId === pack.id
                      ? 'Loading...'
                      : 'Subscribe'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed py-6 text-center text-sm opacity-40">
            No VIP subscriptions active currently.
          </div>
        )}
      </section>

      {/* Coin Packages */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FaCoins className="h-5 w-5 text-indigo-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Coin Packages</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Unlock chapters instantly with coins. Non-recurring, top up anytime.
        </p>

        {loadingCoins ? (
          <div className="py-8 text-center text-sm opacity-60">Loading coin packages...</div>
        ) : coinPackages && coinPackages.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {coinPackages.map((coin) => (
              <div
                key={coin.id}
                className="flex h-48 flex-col items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 text-center transition hover:shadow-md dark:border-gray-800 dark:bg-neutral-900"
              >
                <div className="flex flex-col items-center gap-2">
                  <FaCoins className="h-10 w-10 text-yellow-400" />
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                    {coin.name}
                  </h3>
                </div>
                <div className="w-full space-y-3">
                  <div className="text-lg font-black text-gray-900 dark:text-gray-100">
                    ${coin.price}
                  </div>
                  <button
                    onClick={() => handlePurchase(coin.id)}
                    disabled={createPaymentFn.loading}
                    className="w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-40"
                  >
                    {createPaymentFn.loading && selectedProductId === coin.id
                      ? 'Loading...'
                      : 'Buy Coins'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed py-6 text-center text-sm opacity-40">
            No coin packages found.
          </div>
        )}
      </section>
    </div>
  )
}
