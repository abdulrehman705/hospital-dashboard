
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs, TabsContent,
} from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { getHospitals, getDoctors, getDoctorSessions } from '@/supabase/api/api';
import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/header'

export default function Dashboard() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorSessions, setDoctorSessions] = useState<any[]>([]);

  useEffect(() => {
    getHospitals().then(setHospitals);
    getDoctors().then(setDoctors);
    getDoctorSessions().then(setDoctorSessions);
  }, []);

  // Calculate sessions per hospital for the last 7 days
  const overviewData = useMemo(() => {
    if (!doctorSessions.length || !hospitals.length) {
      // Fallback fake data for testing
      return [
        { name: 'General Center Hospital', total: Math.floor(Math.random() * 10) + 1 },
        { name: 'Hopewell Hospital', total: Math.floor(Math.random() * 10) + 1 },
        { name: 'Sunrise Medical Center', total: Math.floor(Math.random() * 10) + 1 },
        { name: 'Jinnah Hospital', total: Math.floor(Math.random() * 10) + 1 },
        { name: 'Victoria Hospital', total: Math.floor(Math.random() * 10) + 1 },
      ];
    }
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6); // include today

    // Filter sessions from the last 7 days
    const recentSessions = doctorSessions.filter((session: any) => {
      const createdAt = new Date(session.created_at);
      return createdAt >= sevenDaysAgo && createdAt <= now && session.hospital_id;
    });

    // Group by hospital_id and count
    const sessionCountByHospital: Record<string, number> = {};
    recentSessions.forEach((session: any) => {
      const hid = session.hospital_id;
      if (hid) {
        sessionCountByHospital[hid] = (sessionCountByHospital[hid] || 0) + 1;
      }
    });

    // Map hospital_id to hospital name
    const data = Object.entries(sessionCountByHospital).map(([hospitalId, total]) => {
      const hospital = hospitals.find((h: any) => String(h.id) === String(hospitalId));
      return {
        name: hospital ? hospital.name : `Hospital ${hospitalId}`,
        total,
      };
    });
    // If no sessions in last 7 days, show fake data for testing
    if (data.length === 0) {
      return [
        { name: 'General Center Hospital', total: Math.floor(Math.random() * 10) + 1 },
        { name: 'Hopewell Hospital', total: Math.floor(Math.random() * 10) + 1 },
        { name: 'Sunrise Medical Center', total: Math.floor(Math.random() * 10) + 1 },
        { name: 'Jinnah Hospital', total: Math.floor(Math.random() * 10) + 1 },
        { name: 'Victoria Hospital', total: Math.floor(Math.random() * 10) + 1 },
      ];
    }
    return data;
  }, [doctorSessions, hospitals]);

  console.log('overviewData', overviewData);

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header />
      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Hospitals
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{hospitals.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Doctors
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                    <circle cx='9' cy='7' r='4' />
                    <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{doctors.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Sessions</CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='text-muted-foreground h-4 w-4'
                  >
                    <rect width='20' height='14' x='2' y='5' rx='2' />
                    <path d='M2 10h20' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{doctorSessions.length}</div>
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Overview<span className='text-sm text-muted-foreground'> (Last 7 Days)</span></CardTitle>
                </CardHeader>
                <CardContent className='pl-2'>
                  <Overview data={overviewData} />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Visits</CardTitle>
                  <CardDescription>
                    You made 265 treatments this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}