# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the Sacred app.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: Sacred App
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient to start
5. Click "Create new project"
6. Wait for the project to be provisioned (1-2 minutes)

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. You'll need two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

## 3. Configure Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials to `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # Keep your existing Google credentials
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
   ```

## 4. Enable Authentication Providers in Supabase

### Email Authentication (Already Enabled by Default)

1. Go to **Authentication** > **Providers**
2. Email provider should be enabled by default
3. Configure email settings if needed:
   - **Confirm email**: Toggle on/off based on your preference
   - **Enable sign ups**: Keep enabled

### Google OAuth Setup

1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Find **Google** in the list and click **Enable**
3. You'll need to provide:
   - **Client ID (for OAuth)**: Get this from [Google Cloud Console](https://console.cloud.google.com)
   - **Client Secret (for OAuth)**: Get this from Google Cloud Console

#### Getting Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable **Google+ API**:
   - Go to **APIs & Services** > **Library**
   - Search for "Google+ API"
   - Click **Enable**
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
   - Click **Create**
   - Copy the **Client ID** and **Client Secret**
5. Also create OAuth client IDs for:
   - **iOS** application type (for iOS app)
   - **Android** application type (for Android app)
6. Copy the iOS Client ID to your `.env` file

### Apple Sign-In Setup (iOS Only)

1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Find **Apple** in the list and click **Enable**
3. You'll need:
   - **Services ID**: Get from Apple Developer Console
   - **Team ID**: Your Apple Developer Team ID
   - **Key ID**: From Apple Developer Console
   - **Private Key**: Download from Apple Developer Console

#### Getting Apple Sign-In Credentials:

1. Go to [Apple Developer Console](https://developer.apple.com/account)
2. Create an **App ID**:
   - Go to **Certificates, Identifiers & Profiles**
   - Click **Identifiers** > **+** button
   - Select **App IDs** and click **Continue**
   - Fill in the description and Bundle ID (must match `com.eidos.sacred-mobile-app`)
   - Enable **Sign In with Apple** capability
   - Click **Continue** and **Register**
3. Create a **Services ID**:
   - Go to **Identifiers** > **+** button
   - Select **Services IDs** and click **Continue**
   - Fill in description and identifier (e.g., `com.eidos.sacred-mobile-app.web`)
   - Enable **Sign In with Apple**
   - Click **Configure**
   - Add your Supabase callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Click **Save** and **Continue** and **Register**
4. Create a **Key**:
   - Go to **Keys** > **+** button
   - Enter a key name and enable **Sign In with Apple**
   - Click **Configure** and select your App ID
   - Click **Save** and **Continue** and **Register**
   - Download the `.p8` key file (you can only do this once!)
   - Note the **Key ID**
5. Get your **Team ID**:
   - Found in the top-right corner of the Apple Developer Console

## 5. Configure Database Schema (Optional but Recommended)

Create a user profile table to store additional user data:

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Create policy to allow users to read their own profile
create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Create policy to allow users to update their own profile
create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user creation
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 6. Install Dependencies and Run the App

```bash
# Install dependencies (already done)
npm install

# Clear cache and start the development server
npx expo start -c
```

## 7. Testing Authentication

### Test Email Sign-Up

1. Open the app
2. Tap "Sign Up"
3. Enter email and password
4. Tap "Sign Up" button
5. Check your email for verification (if email confirmation is enabled)
6. You should be logged in

### Test Email Sign-In

1. Tap "Sign In"
2. Enter your registered email and password
3. Tap "Sign In" button
4. You should be logged in and redirected to the home screen

### Test Google Sign-In

1. Tap "Continue with Google"
2. Select your Google account
3. Grant permissions
4. You should be logged in and redirected to the home screen

### Test Apple Sign-In (iOS only)

1. Tap "Continue with Apple"
2. Use Face ID/Touch ID or enter Apple ID password
3. Choose to share or hide your email
4. You should be logged in and redirected to the home screen

### Test Sign Out

1. Go to Settings tab
2. Tap "Sign Out"
3. Confirm sign out
4. You should be redirected to the onboarding screen

## 8. Verify in Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **Authentication** > **Users**
3. You should see all your test users listed
4. Click on a user to see their details and authentication method

## 9. Common Issues and Solutions

### Issue: "Missing Supabase environment variables"

**Solution**: Make sure you've created a `.env` file and added your Supabase credentials.

### Issue: Google Sign-In fails with "No ID token received"

**Solution**:
1. Verify your Google Web Client ID is correct in `.env`
2. Make sure you've enabled Google OAuth in Supabase Dashboard
3. Check that your OAuth redirect URI in Google Cloud Console matches your Supabase callback URL

### Issue: Apple Sign-In not available

**Solution**:
1. Apple Sign-In only works on iOS devices, not simulators (though some simulators support it)
2. Make sure you've configured Apple Sign-In in Supabase Dashboard
3. Verify your app's Bundle ID matches the one in Apple Developer Console

### Issue: "Email not confirmed" error

**Solution**:
1. Check your email for the confirmation link
2. Or disable email confirmation in Supabase Dashboard: **Authentication** > **Providers** > **Email** > **Confirm email** toggle off

### Issue: Network errors or "Failed to fetch"

**Solution**:
1. Verify your Supabase URL is correct
2. Check your internet connection
3. Make sure your Supabase project is active (not paused)

## 10. Next Steps

Now that authentication is set up, you can:

1. **Add user profiles**: Store additional user data in the `profiles` table
2. **Enable database**: Set up Supabase for storing prayer sessions, streaks, and reflections
3. **Add storage**: Use Supabase Storage for user-uploaded content
4. **Add real-time features**: Use Supabase Realtime for live updates

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guides](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Apple Sign-In Setup](https://supabase.com/docs/guides/auth/social-login/auth-apple)
