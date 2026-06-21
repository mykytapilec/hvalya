import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/auth';

export default function RootLayout() {
  const init = useAuthStore((s) => s.init);
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login/index" />
      <Stack.Screen name="(auth)/register/index" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
