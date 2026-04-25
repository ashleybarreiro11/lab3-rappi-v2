import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ypoqfrqncnqqltewmksx.supabase.co";
const SUPABASE_KEY = "sb_publishable_22QDOnWX8cgz_umUR7Uitw_1Pc9U7dx";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
