
import { Config } from '@/config'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(Config.supabase.supabaseUrl, Config.supabase.supabaseAnonKey) 