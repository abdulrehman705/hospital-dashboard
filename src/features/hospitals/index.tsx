import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import TasksProvider from './context/tasks-context'
import { hospitals } from './data/hospitals'
import LogoutLogo from '@/assets/logout.svg'

export default function Hospitals() {
  return (
    <TasksProvider>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <button
            className="text-gray-600 transition-colors duration-200 hover:text-gray-900"
          >
            <img src={LogoutLogo} alt="Logout" className="h-6 px-6" />
          </button>

        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Hospitals</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of Hospitals!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable data={hospitals} columns={columns} />
        </div>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
