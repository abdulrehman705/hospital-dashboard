import { Header } from '@/components/layout/header'
import LogoutLogo from '@/assets/logout.svg'
import { useAuth } from '@/context/useAuth'
import { useRouter } from '@tanstack/react-router';

export const HeaderComponent = () => {
    const { signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut.mutateAsync()
            // Clear the access token and user from cookies
            document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
            // Redirect to the login page
            router.navigate({ to: '/sign-in' })
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <Header>
            <div className='ml-auto flex items-center space-x-4'>
                <button className="text-gray-600 transition-colors duration-200 hover:text-gray-900"
                    onClick={handleLogout}
                >
                    <img src={LogoutLogo} alt="Logout" className="h-6 px-6" />
                </button>
            </div>
        </Header>
    )
}