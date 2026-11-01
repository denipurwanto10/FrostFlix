import {
  QueryClientProvider,
  QueryErrorResetBoundary,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from 'react-router-dom'

import AppShell from '@/components/layout/app-shell'
import { queryClient } from '@/lib/query-client'

/** Layout route: renders every page inside the persistent app shell. */
function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
      <ScrollRestoration />
    </AppShell>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <ShellLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import('@/pages/home-page')
          return { Component: HomePage }
        },
      },
      {
        path: 'explore',
        lazy: async () => {
          const { ExplorePage } = await import('@/pages/explore-page')
          return { Component: ExplorePage }
        },
      },
      {
        path: 'search',
        lazy: async () => {
          const { SearchPage } = await import('@/pages/search-page')
          return { Component: SearchPage }
        },
      },
      {
        path: 'watchlist',
        lazy: async () => {
          const { WatchlistPage } = await import('@/pages/watchlist-page')
          return { Component: WatchlistPage }
        },
      },
      {
        path: 'preferences',
        lazy: async () => {
          const { PreferencesPage } = await import('@/pages/preferences-page')
          return { Component: PreferencesPage }
        },
      },
      {
        path: 'movie/:slug',
        lazy: async () => {
          const { MovieDetailsPage } = await import('@/pages/movie-details-page')
          return { Component: MovieDetailsPage }
        },
      },
      {
        path: '*',
        lazy: async () => {
          const { NotFoundPage } = await import('@/pages/not-found-page')
          return { Component: NotFoundPage }
        },
      },
    ],
  },
])

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryErrorResetBoundary>
    </QueryClientProvider>
  )
}
