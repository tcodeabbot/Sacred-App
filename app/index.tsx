import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

export default function Index() {
  const isOnboarded = useAppStore((state) => state.isOnboarded);
  
  if (isOnboarded) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/(onboarding)" />;
}
