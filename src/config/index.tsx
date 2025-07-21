interface ConfigType {
    backend: {
        url: string;
    }
    supabase: {
        supabaseUrl: string;
        supabaseAnonKey: string;
    };
}

export const Config: ConfigType = {
    backend: {
        url: import.meta.env.VITE_API_BASE_URL || '',
    },
    supabase: {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
        supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
};