import {
    createClient,
} from "@supabase/supabase-js";

const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL;

const supabasePublishableKey =
    import.meta.env
        .VITE_SUPABASE_PUBLISHABLE_KEY;

export function createStorageClient(token) {
    return createClient(
        supabaseUrl,
        supabasePublishableKey,
        {
            global: {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            },
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
            },
        }
    );
}
