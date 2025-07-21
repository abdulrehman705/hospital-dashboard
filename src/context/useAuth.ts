import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase/client'
import { useDispatch } from 'react-redux'
import { setUser, logout } from './authSlice'
import { Provider } from '@supabase/supabase-js'

interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

interface SignUpCredentials {
  email: string
  password: string
  name: string
}

export function useAuth() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  // Decode a JWT and return its expiration date (if any)
  const getTokenExpiry = (token: string): Date | null => {
    try {
      // JWT format: header.payload.signature -> we only need the payload
      const base64Url = token.split('.')[1]
      if (!base64Url) return null
      const jsonPayload = atob(base64Url.replace(/-/g, '+').replace(/_/g, '/'))
      const { exp } = JSON.parse(jsonPayload)
      if (!exp) return null
      // exp is in seconds since epoch
      return new Date(exp * 1000)
    } catch {
      return null
    }
  }

  // Helper to ensure our custom access_token cookie is present
  const setAccessTokenCookie = (token?: string) => {
    // If we do not have a token, explicitly remove the cookie
    if (!token) {
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      return
    }

    const expiryDate = getTokenExpiry(token)
    const expiresAttr = expiryDate ? `; expires=${expiryDate.toUTCString()}` : ''

    // Always (re)write the cookie so that its expiration stays in sync with the JWT
    document.cookie = `access_token=${token}; path=/; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}${expiresAttr}`

    if (expiryDate) {
      // Log the token expiry for debugging purposes (remove in production if undesired)
      // eslint-disable-next-line no-console
      console.log('Access token expires at:', expiryDate.toISOString())
    }
  }

  // Get current session
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      if (session?.access_token) {
        setAccessTokenCookie(session.access_token)
      } else {
        // Session missing or expired – remove any stale cookie
        setAccessTokenCookie(undefined)
      }
      dispatch(setUser(session?.user ?? null))
      return session
    },
  })

  // Login mutation
  const login = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      dispatch(setUser(data.user))
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })

  // update user metadata mutation
  const updateUserMetadata = useMutation({
    mutationFn: async (metadata: { full_name?: string, preferred_auth?: string }) => {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      })
      if (error) throw error
      if (data.user) {
        dispatch(setUser(data.user))
        queryClient.invalidateQueries({ queryKey: ['session'] })
      }
      return data
    },
    onSuccess: (data) => {
      if (data.user) {
        dispatch(setUser(data.user))
        queryClient.invalidateQueries({ queryKey: ['session'] })
      }
    },
  })

  // Sign up mutation
  const signUp = useMutation({
    mutationFn: async ({ email, password, name }: SignUpCredentials) => {
      // Proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            preferred_auth: 'otp'
          },
          // Disable automatic email verification
          emailRedirectTo: undefined,
        },
      })

      if (error) {
        // If the error contains "already registered", make sure we throw a clear error
        if (error.message.includes('already registered') ||
          error.message.includes('already taken') ||
          error.message.includes('already in use')) {
          throw new Error('User already registered')
        }
        throw error
      }

      // Check if the response indicates user already exists
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error('User already registered')
      }

      return data
    },
  })

  // Sign out mutation
  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      setAccessTokenCookie(undefined)
      dispatch(logout())
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })

  // Request password reset mutation
  const requestPasswordReset = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined
      })
      if (error) throw error
    },
  })

  // Update User Password
  const updatePassword = useMutation({
    mutationFn: async (new_password: string) => {
      const { error } = await supabase.auth.updateUser({ password: new_password })
      if (error) throw error
    },
  })

  // Check email confirmation status
  const checkEmailConfirmation = useQuery({
    queryKey: ['email-confirmation'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    },
  })

  // Resend verification email
  const resendVerificationEmail = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: undefined // Disable email redirect to force OTP
        }
      })
      if (error) {
        throw error
      }
    },
  })

  // Social OAuth sign-in mutation (no dedicated callback route)
  const signInWithOAuth = useMutation({
    mutationFn: async (provider: Provider) => {
      const { origin } = window.location
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/`,
        },
      })
      if (error) {
        throw error
      }
      return data
    },
  })

  // Verify OTP code for signup
  const verifyOTP = useMutation({
    mutationFn: async ({ email, otp }: { email: string, otp: string }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      })
      if (error) {
        throw error
      }
      return data
    },
    onSuccess: (data) => {
      if (data.user) {
        dispatch(setUser(data.user))
        queryClient.invalidateQueries({ queryKey: ['session'] })
      }
    }
  })

  // Verify OTP code for recovery/password reset
  const verifyResetOTP = useMutation({
    mutationFn: async ({ email, otp }: { email: string, otp: string }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery'
      })
      if (error) {
        throw error
      }
      return data
    },
    onSuccess: (data) => {
      if (data.user) {
        dispatch(setUser(data.user))
        queryClient.invalidateQueries({ queryKey: ['session'] })
      }
    }
  })

  return {
    session,
    isLoading,
    login,
    signUp,
    signOut,
    requestPasswordReset,
    checkEmailConfirmation,
    resendVerificationEmail,
    updatePassword,
    signInWithOAuth,
    verifyOTP,
    verifyResetOTP,
    updateUserMetadata,
    getTokenExpiry,
  }
} 