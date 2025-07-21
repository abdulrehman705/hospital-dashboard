import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
// import { ProfileDropdown } from '@/components/profile-dropdown'
// import { Search } from '@/components/search'
// import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { doctorListSchema } from './data/schema'
import { doctors } from './data/users'
import LogoutLogo from '@/assets/logout.svg'
import { useAuth } from '@/context/AuthContext'

export default function Doctors() {
  // Parse user list
  const doctorList = doctorListSchema.parse(doctors)
  const { logout } = useAuth();

  return (
    <UsersProvider>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <button
            onClick={logout}
            className="text-gray-600 transition-colors duration-200 hover:text-gray-900"
          >
            <img src={LogoutLogo} alt="Logout" className="h-6 px-6" />
          </button>

        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Doctors List</h2>
            <p className='text-muted-foreground'>
              Manage Doctors and their departments here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable data={doctorList} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
