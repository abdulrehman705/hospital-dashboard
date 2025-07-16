interface ConfigType {
    supabase: {
        supabaseUrl: string;
        supabaseAnonKey: string;
    };
}

export const Config: ConfigType = {
    supabase: {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
        supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
};