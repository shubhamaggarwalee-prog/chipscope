import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="device/[id]" options={{ title: 'Teardown' }} />
      <Stack.Screen name="chip/[id]" options={{ title: 'Chip' }} />
    </Stack>
  );
}
