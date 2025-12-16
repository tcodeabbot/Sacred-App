import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.error('❌ Supabase credentials not configured!');
  console.error('📝 Please follow these steps:');
  console.error('   1. Create a .env file in the root directory');
  console.error('   2. Add your Supabase URL and anon key:');
  console.error('      EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('      EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.error('   3. Restart the development server');
  console.error('');
  console.error('📖 See SUPABASE_SETUP.md for detailed instructions');

  throw new Error(
    'Missing Supabase credentials. Please create a .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY. See SUPABASE_SETUP.md for setup instructions.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
