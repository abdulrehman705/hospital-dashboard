import Cookies from 'js-cookie'
import { Outlet, useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import { useEffect, useState } from 'react'
import AppLogo from '@/assets/logo.png'

interface Props {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: Props) {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      router.navigate({ to: '/sign-in' });
    } else {
      setLoading(false);
    }
  }, [router]);


  if (loading) {
    return (
      <div className='flex items-center flex-col justify-center h-screen w-screen'>
        <img src={AppLogo} alt='logo' className='w-10 h-10 mb-4' />
        <span className='text-lg font-semibold'>Loading...</span>
      </div>
    );
  }


  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'sm:transition-[width] sm:duration-200 sm:ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
          )}
        >
          {children ? children : <Outlet />}
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}
