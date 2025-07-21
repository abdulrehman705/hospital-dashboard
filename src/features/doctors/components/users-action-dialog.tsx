'use client'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Doctor } from '../data/schema'
import { departments } from '../data/data'
import { addDoctor, updateDoctor, getHospitals } from '@/supabase/api/api'
import { useState, useEffect } from 'react'

const formSchema = z
  .object({
    first_name: z.string().min(1, { message: 'First Name is required.' }),
    last_name: z.string().min(1, { message: 'Last Name is required.' }),
    sur_name: z.string().min(1, { message: 'Sur Name is required.' }),
    phone_number: z.string().min(1, { message: 'Phone number is required.' }).optional().nullable(),
    email: z
      .string()
      .min(1, { message: 'Email is required.' })
      .email({ message: 'Email is invalid.' }),
    department: z.string().min(1, { message: 'Department is required.' }).optional().nullable(),
    hospital_id: z.string().min(1, { message: 'Hospital is required.' }).optional().nullable(),
    registration_number: z.string().min(1, { message: 'Registration number is required.' }).optional().nullable(),
    isEdit: z.boolean(),
  })
  .superRefine(({ isEdit, hospital_id }, ctx) => {
    if (!isEdit || (isEdit && hospital_id !== '')) {
      if (hospital_id === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Hospital is required.',
          path: ['hospital_id'],
        })
      }
    }
  })
type UserForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: Doctor
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange, onSuccess }: Props) {
  const isEdit = !!currentRow;
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hospitals, setHospitals] = useState<{ id: string | number, name: string }[]>([]);

  useEffect(() => {
    if (open) {
      getHospitals().then((data) => {
        if (Array.isArray(data)) {
          setHospitals(data.map(h => ({ id: h.id, name: h.name })));
        }
      });
    }
  }, [open]);

  console.log("message", message);

  // Map currentRow to form fields, ensuring no undefined/null for required fields
  const getDefaultValues = () => {
    if (isEdit && currentRow) {
      return {
        first_name: currentRow.first_name || '',
        last_name: currentRow.last_name || '',
        sur_name: currentRow.sur_name || '',
        email: currentRow.email || '',
        phone_number: currentRow.phone_number ?? '',
        department: currentRow.department ?? '',
        hospital_id: currentRow.hospital_id ?? '',
        registration_number: currentRow.registration_number ?? '',
        isEdit,
      };
    } else {
      return {
        first_name: '',
        last_name: '',
        sur_name: '',
        email: '',
        phone_number: '',
        department: '',
        hospital_id: '',
        registration_number: '',
        isEdit,
      };
    }
  };

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  const onSubmit = async (values: UserForm) => {
    setIsSubmitting(true);
    setMessage('');
    try {
      if (isEdit && currentRow?.id) {
        // Map form values to API payload (convert id to number if needed)
        const updatedDoctor = await updateDoctor({
          id: typeof currentRow.id === 'string' ? parseInt(currentRow.id, 10) : currentRow.id,
          first_name: values.first_name,
          last_name: values.last_name,
          sur_name: values.sur_name,
          email: values.email,
          phone_number: values.phone_number || '',
          department: values.department || '',
          hospital_id: values.hospital_id ? Number(values.hospital_id) : 1,
          registration_number: values.registration_number || '',
        });
        if (onSuccess) {
          onSuccess();
        }
        console.log('Doctor updated:', updatedDoctor);
        setMessage('Doctor updated successfully!');
      } else {
        // Map form values to API payload
        const newDoctor = await addDoctor({
          first_name: values.first_name,
          last_name: values.last_name,
          sur_name: values.sur_name,
          email: values.email,
          phone_number: values.phone_number || '',
          department: values.department || '',
          hospital_id: values.hospital_id ? Number(values.hospital_id) : 1,
          registration_number: values.registration_number || '',
        });
        console.log('Doctor added:', newDoctor);
        setMessage('Doctor added successfully!');
        if (onSuccess) {
          onSuccess();
        }
      }
      form.reset(getDefaultValues());
      onOpenChange(false);
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the Doctor here. ' : 'Create new Doctor here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='doctor-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='sur_name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Sur Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='DR.'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='first_name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='last_name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone_number'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='+123456789'
                        className='col-span-4'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='registration_number'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Registration Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='123456789'
                        className='col-span-4'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='department'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Department
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value ?? ''}
                      onValueChange={field.onChange}
                      placeholder='Select a department'
                      className='col-span-4 w-full'
                      items={departments.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='hospital_id'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Hospital
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value ?? ''}
                      onValueChange={field.onChange}
                      placeholder='Select a hospital'
                      className='col-span-4 w-full'
                      items={hospitals.map(({ name, id }) => ({
                        label: name,
                        value: id.toString(),
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='doctor-form' disabled={isSubmitting}  >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
