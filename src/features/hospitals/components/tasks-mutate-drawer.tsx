import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Task } from '../data/schema'
import { useState } from 'react'
import { addHospital, updateHospital } from '@/supabase/api/api'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(1, 'Hospital Name is required.'),
  phone: z.string().min(1, 'Phone Number is required.').nullable(),
  email: z.string().min(1, 'Email is required.').email('Email is Invalid').nullable(),
})
export type TasksForm = z.infer<typeof formSchema>

export function TasksMutateDrawer({ open, onOpenChange, currentRow, onSuccess }: Props) {
  const isUpdate = !!currentRow
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  console.log("message", message);

  const form = useForm<TasksForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      name: '',
      phone: '',
      email: '',
    },
  })

  const onSubmit = async (hospitalData: TasksForm) => {
    setIsSubmitting(true)
    setMessage('')

    try {
      if (isUpdate && currentRow?.id) {
        const updatedHospital = await updateHospital({
          id: currentRow.id,
          ...hospitalData
        })
        console.log('Hospital updated:', updatedHospital)
        setMessage('Hospital updated successfully!')
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const newHospital = await addHospital(hospitalData)
        console.log('Hospital added:', newHospital)
        setMessage('Hospital added successfully!')
        if (onSuccess) {
          onSuccess();
        }
      }

      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
        setMessage('')
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'Update' : 'Add'} Hospital</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the hospital data by providing necessary info.'
              : 'Add a new Hospital by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>

        {message && (
          <div className={`px-4 py-2 rounded ${message.includes('Error') || message.includes('failed')
            ? 'bg-red-100 text-red-700 border border-red-200'
            : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
            {message}
          </div>
        )}

        <Form {...form}>
          <form
            id='hospital-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 px-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Hospital Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter hospital Name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Enter hospital phone number'
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Enter hospital email'
                      type='email'
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={isSubmitting}>Close</Button>
          </SheetClose>
          <Button form='hospital-form' type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}