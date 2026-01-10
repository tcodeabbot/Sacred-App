import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="intercept" />
      <Stack.Screen name="active-prayer" />
      <Stack.Screen name="prayer-complete" />
      <Stack.Screen name="upgrade" />
      <Stack.Screen name="prayer-schedule" />
      <Stack.Screen name="prayer-detail" />
      <Stack.Screen name="collection-detail" />
    </Stack>
  );
}
