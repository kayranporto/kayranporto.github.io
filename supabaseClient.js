import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ecospuzxlrlyeutuozwl.supabase.co'
const supabaseKey = 'sb_publishable_jexg40NsgTFQa95KScIESg_InrA44mF'

export const supabase = createClient(supabaseUrl, supabaseKey)