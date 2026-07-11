import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { api, type Artist } from '../../lib/api';
import { useAuthStore } from '../../store/auth';

export default function ProfileScreen() {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const [artist, setArtist] = useState<Artist | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    api.artists
      .findMe(token)
      .then((a) => {
        setArtist(a);
        setName(a.name);
        setBio(a.bio ?? '');
        setSocialLinks(a.socialLinks ?? '');
      })
      .catch(() => {
        // Not an artist — profile form stays hidden
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handleSave() {
    if (!token || !artist) return;
    setError('');
    setSuccess(false);
    setIsSaving(true);
    try {
      const updated = await api.artists.update(token, artist.id, { name, bio, socialLinks });
      setArtist(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Profile</Text>

      {artist && (
        <>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your artist name"
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell listeners about yourself"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Social Links</Text>
          <TextInput
            style={styles.input}
            value={socialLinks}
            onChangeText={setSocialLinks}
            placeholder="https://..."
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>Saved!</Text> : null}

          <Pressable
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.buttonText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </>
      )}

      <Pressable style={[styles.button, styles.buttonDanger]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 13, color: '#888', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  error: { color: '#d00', marginTop: 8, fontSize: 14 },
  success: { color: '#16a34a', marginTop: 8, fontSize: 14 },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonPrimary: { backgroundColor: '#1e40af' },
  buttonDanger: { backgroundColor: '#d00' },
  buttonText: { color: '#fff', fontWeight: '600' },
});