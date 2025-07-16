import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/utils/show-submitted-data'
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
import { supabase } from '@/api/api'
import { useState } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

const formSchema = z.object({
  name: z.string().min(1, 'Title is required.'),
  phone: z.string().min(1, 'Phone Number is required.'),
  email: z.string().min(1, 'Phone Number is required.').email('Email is Invalid'),
})
type TasksForm = z.infer<typeof formSchema>

export function TasksMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  const [message, setMessage] = useState('')

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
    // do something with the form data
    onOpenChange(false)
    form.reset()
    showSubmittedData(hospitalData)

    try {
      if (isUpdate) {
        const { data, error } = await supabase
          .from('hospitals')
          .update(hospitalData)
          .eq('id', currentRow?.id)
          .select()
        if (data) {
          console.log('Hospital added:', data);
        }

        if (error) {
          setMessage(`Error: ${error.message}`)
        } else {
          setMessage('Hospital added successfully!')
          form.reset()
        }
      } else {
        const { data, error } = await supabase
          .from('hospitals')
          .insert([hospitalData])
          .select()

        if (data) {
          console.log('Hospital added:', data);

        }

        if (error) {
          setMessage(`Error: ${error.message}`)
        } else {
          setMessage('Hospital added successfully!')
          form.reset()
        }
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`)
    }

  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
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
                  <FormLabel>Name</FormLabel>
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
                    <Input {...field} placeholder='Enter hospital phone number' />
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
                  <FormLabel>email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter hospital email' type='email' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button form='hospital-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
