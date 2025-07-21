import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { departments } from '../data/data'
import { Doctor } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { hospitals } from '@/features/hospitals/data/hospitals'

export const columns: ColumnDef<Doctor>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      ),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'sur_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sur Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-26'>{row.getValue('sur_name') ?? '-'}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-6 md:table-cell'
      ),
    },
    enableHiding: false,
  },
  {
    id: 'full_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Full Name' />
    ),
    cell: ({ row }) => {
      const { first_name, last_name } = row.original
      const full_name = `${first_name} ${last_name}`
      return <LongText className='max-w-36'>{full_name ?? '-'}</LongText>
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('email') ?? '-'}</div>
    ),
  },
  {
    accessorKey: 'phone_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone Number' />
    ),
    cell: ({ row }) => <div>{row.getValue('phone_number') ?? '-'}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'registration_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Registration Number' />
    ),
    cell: ({ row }) => <div>{row.getValue('registration_number') ?? '-'}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'department',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Department' />
    ),
    cell: ({ row }) => {
      const { department } = row.original
      const userType = departments.find(({ value }) => value === department)

      if (!userType) {
        return null
      }

      return (
        <div className='flex items-center gap-x-2'>
          <span className='text-sm capitalize'>{userType.label ?? '-'}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'hospital_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hospital' />
    ),
    cell: ({ row }) => {
      const { hospital_id } = row.original
      const userType = hospitals.find(({ id }) => id === hospital_id)

      console.log("userType", userType);

      if (!userType) {
        return null
      }

      return (
        <div className='flex items-center gap-x-2'>
          <span className='text-sm capitalize'>{userType.name ?? '-'}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
