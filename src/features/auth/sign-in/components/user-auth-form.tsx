import { HTMLAttributes, useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
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
import { PasswordInput } from '@/components/password-input'
import { useAuth } from '@/context/useAuth'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const router = useRouter()

  const { login, session, getTokenExpiry } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })


  useEffect(() => {
    if (session?.user) {
      router.navigate({ to: '/' });
    }
  }, [session, router]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setError("");
    setIsLoading(true);

    try {
      const response = await login.mutateAsync(data);

      if (response.user) {
        if (response.session) {
          const expiry = getTokenExpiry(response.session.access_token);
          const expiresAttr = expiry ? `; expires=${expiry.toUTCString()}` : '';
          document.cookie = `access_token=${response.session.access_token}; path=/; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}${expiresAttr}`;
          if (expiry) {
            // eslint-disable-next-line no-console
            console.log('Access token expires at:', expiry.toISOString());
          }
        }
        router.navigate({ to: "/" });
      } else {
        setError("Invalid response from server");
      }
    } catch (err: any) {
      console.log("Login error:", err.detail);

      setError(err.detail || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  }

  // {
  //   setError("");
  //   setIsLoading(true);

  //   try {
  //     const response = await login(data.email, data.password);

  //     if (response.session) {
  //       console.log("Login successful:", response.session.access_token);
  //       Cookies.set('access_token', response.session.access_token, {
  //         expires: 7, // Set cookie to expire in 7 days
  //         secure: true, // Use secure flag if your site is served over HTTPS
  //         sameSite: 'Strict', // Prevent CSRF attacks
  //       });
  //       router.navigate({ to: "/" });
  //     } else {
  //       setError("Invalid response from server");
  //     }
  //   } catch (err: any) {
  //     console.log("Login error:", err.detail);
  //     setError(err.detail || "Failed to login");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        {error && (
          <div className='text-red-500 text-sm px-2'>
            {error}
          </div>
        )}
        <Button className='mt-2' disabled={isLoading}>
          Login
        </Button>
      </form>
    </Form>
  )
}
