# Sacred - Prayer App

Transform distraction into devotion. Sacred intercepts your phone distractions and invites you to pray.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo Go app on your phone (for testing)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npx expo start
```

### Running the App

After starting the dev server:

- **iOS Simulator (Mac)**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal  
- **Physical Device**: Scan QR code with Expo Go app

## 📱 Features

- **Onboarding Flow**: Welcome, value proposition, app selection, frequency settings
- **Home Dashboard**: Today's prayer count, streak, quick actions, prayer log
- **Prayer Intercept**: Beautiful full-screen takeover with breathing animations
- **Active Prayer**: Timer, rotating scriptures, progress tracking
- **Prayer Complete**: Celebration with stats
- **Journey/Stats**: Weekly chart, streak, total time with God
- **Settings**: Customize apps, duration, goals
- **Premium Upgrade**: Subscription flow

## 🎨 Design

- **Theme**: Dark mode with Hallow-inspired aesthetics
- **Colors**: True black background (#0d0d0d), teal/purple/amber gradients
- **Typography**: Bold headlines, clean sans-serif
- **Animations**: Smooth transitions using React Native Reanimated

## 📁 Project Structure

```
sacred-app/
├── app/                    # Expo Router screens
│   ├── (onboarding)/       # Onboarding flow
│   ├── (tabs)/             # Main tab navigation
│   ├── (modals)/           # Modal screens
│   ├── _layout.tsx         # Root layout
│   └── index.tsx           # Entry point
├── components/
│   └── ui/                 # Reusable UI components
├── constants/
│   ├── colors.ts           # Color palette
│   └── prayers.ts          # Prayer/scripture data
├── store/
│   └── useAppStore.ts      # Zustand state management
├── types/
│   └── index.ts            # TypeScript types
└── assets/                 # Images, icons
```

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Router**: Expo Router (file-based routing)
- **State**: Zustand
- **Animations**: React Native Reanimated
- **Gradients**: Expo Linear Gradient
- **Language**: TypeScript

## 🔧 Development Commands

```bash
# Start dev server
npx expo start

# Clear cache and start
npx expo start -c

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android

# Install a package
npx expo install [package-name]

# Check for issues
npx expo-doctor
```

## 📦 Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure builds
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## 🎯 Demo Flow

1. Launch app → Onboarding
2. Complete onboarding → Home screen
3. Tap "Pray Now" → Prayer intercept
4. Tap "Begin Prayer" → Active prayer with timer
5. Wait 30 seconds → Tap "Amen"
6. Prayer complete → Return home
7. Check Journey tab for stats
8. Settings → "Reset for Demo" to restart

## 📝 Notes

- The actual app blocking functionality requires native Screen Time APIs (not included in this demo)
- Prayer data and stats are stored in memory (add AsyncStorage for persistence)
- Subscription flow is UI-only (integrate RevenueCat for production)

## 🙏 Credits

Inspired by Hallow, the Catholic prayer app.

---

Built with ❤️ and faith.
# Sacred-App
