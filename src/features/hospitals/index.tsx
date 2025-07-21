'use client'
import { Main } from '@/components/layout/main'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import TasksProvider from './context/tasks-context'
import { getHospitals } from '@/supabase/api/api'
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header'


export default function Hospitals() {
  const [hospitalsData, setHospitalsData] = useState<any[]>([]);

  const fetchHospitals = async () => {
    try {
      const data = await getHospitals();
      console.log("Fetched hospitals:", data);
      setHospitalsData(data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  return (
    <TasksProvider>
      <Header />

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
          <DataTable data={hospitalsData} columns={columns} />
        </div>
      </Main>
      <TasksDialogs onSuccess={fetchHospitals} />
    </TasksProvider>
  )
}
