import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/auth';

export default function ProfileScreen() {
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 16 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  button: {
    backgroundColor: '#d00',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
