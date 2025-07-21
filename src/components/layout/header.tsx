import React from 'react'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'
import Cookies from 'js-cookie'
import { useRouter } from '@tanstack/react-router'
import LogoutLogo from '@/assets/logout.svg'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Header = ({
  className,
  fixed,
  children,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)
  const router = useRouter();

  // LogoutButton implementation
  const handleLogout = () => {
    // Remove all cookies
    Object.keys(Cookies.get()).forEach(function (cookieName) {
      Cookies.remove(cookieName);
    });
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    router.navigate({ to: '/sign-in' });
  };

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'bg-background flex h-16 items-center gap-3 p-4 sm:gap-4',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
        offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
        className
      )}
      {...props}
    >
      <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
      {children}
      <div className='ml-auto'>
        <div className='ml-auto flex items-center space-x-4'>
          <button className="text-gray-600 transition-colors duration-200 hover:text-gray-900"
            onClick={handleLogout}
          >
            <img src={LogoutLogo} alt="Logout" className="h-6 px-6" />
          </button>
        </div>
      </div>
    </header>
  )
}

Header.displayName = 'Header'
