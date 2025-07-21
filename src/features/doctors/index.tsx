import { Main } from '@/components/layout/main'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { HeaderComponent } from '@/components/header';
import { useState, useEffect } from 'react'
import { getDoctors } from '@/supabase/api/api'

export default function Doctors() {
  const [doctorData, setDoctorData] = useState<any[]>([]);

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctorData(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <UsersProvider>
      <HeaderComponent />

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
          <UsersTable data={doctorData} columns={columns} />
        </div>
      </Main>

      <UsersDialogs onSuccess={fetchDoctors} />
    </UsersProvider>
  )
}
