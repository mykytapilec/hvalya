import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { api, type Artist, type Subscription } from '../../lib/api';
import { useAuthStore } from '../../store/auth';
import { decodeToken } from '../../lib/jwt';

export default function ProfileScreen() {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  const [artist, setArtist] = useState<Artist | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [isLoadingArtist, setIsLoadingArtist] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    const decoded = decodeToken(token);
    if (decoded) {
      setEmail(decoded.email);
      setRole(decoded.role);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsLoadingSubscription(false);
      return;
    }
    api.subscriptions
      .getMine(token)
      .then(setSubscription)
      .catch(() => setSubscription(null))
      .finally(() => setIsLoadingSubscription(false));
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsLoadingArtist(false);
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
        // Not an artist — form stays hidden
      })
      .finally(() => setIsLoadingArtist(false));
  }, [token]);

  async function handleSaveArtist() {
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

  const trialDaysLeft = subscription?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : null;

  if (isLoadingSubscription || isLoadingArtist) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.email}>{email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{role}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Subscription</Text>
      {subscription ? (
        <Pressable
          style={styles.card}
          onPress={() => router.push('/(tabs)/subscription')}
        >
          <View style={styles.subscriptionRow}>
            <View>
              <Text style={styles.tier}>{subscription.tier}</Text>
              <Text style={styles.status}>{subscription.status}</Text>
              {subscription.tier === 'FREE' && trialDaysLeft !== null && (
                <Text style={[styles.trial, trialDaysLeft <= 3 && styles.trialWarning]}>
                  {trialDaysLeft > 0
                    ? `Trial: ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left`
                    : 'Trial expired'}
                </Text>
              )}
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </Pressable>
      ) : (
        <Text style={styles.empty}>No subscription found.</Text>
      )}

      {artist && (
        <>
          <Text style={styles.sectionTitle}>Artist Details</Text>
          <View style={styles.card}>
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
              onPress={handleSaveArtist}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          </View>
        </>
      )}

      {!artist && role === 'LISTENER' && (
        <>
          <Text style={styles.sectionTitle}>Become an Artist</Text>
          <View style={styles.card}>
            <Text style={styles.hint}>
              Want to upload your own music? Apply to become an artist from the Hvalya website.
            </Text>
          </View>
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
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#888', marginTop: 24, marginBottom: 8 },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
  },
  email: { fontSize: 16, fontWeight: '600' },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef2ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '600', color: '#1e40af' },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tier: { fontSize: 18, fontWeight: '700' },
  status: { fontSize: 13, color: '#888', marginTop: 2 },
  trial: { fontSize: 13, color: '#888', marginTop: 4 },
  trialWarning: { color: '#d97706', fontWeight: '600' },
  chevron: { fontSize: 22, color: '#ccc' },
  empty: { color: '#888', fontSize: 14 },
  hint: { fontSize: 14, color: '#666', lineHeight: 20 },
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
  buttonDanger: { backgroundColor: '#d00', marginTop: 32 },
  buttonText: { color: '#fff', fontWeight: '600' },
});