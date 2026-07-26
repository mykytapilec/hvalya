import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, type Release } from '../../lib/api';
import { useAuthStore } from '../../store/auth';
import { usePlayerStore } from '../../store/player';

export default function ReleaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const play = usePlayerStore((s) => s.play);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const [release, setRelease] = useState<Release | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.releases
      .findById(id)
      .then(setRelease)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handlePlay(track: { id: string; title: string; artistId: string }) {
    if (!token) {
      Alert.alert('Sign in required', 'Please log in to listen to tracks.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log in', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    await play({ ...track, coverUrl: release?.coverUrl }, token);
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !release) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || 'Release not found'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {release.coverUrl ? (
          <Image source={{ uri: release.coverUrl }} style={styles.cover} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverEmoji}>🎵</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{release.title}</Text>
          <Text style={styles.meta}>
            {release.type}
            {release.genre ? ` · ${release.genre}` : ''} ·{' '}
            {new Date(release.releasedAt).toLocaleDateString()}
          </Text>
          <Text style={styles.meta}>
            {release.tracks.length} track{release.tracks.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <FlatList
        data={release.tracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <Pressable style={styles.row} onPress={() => handlePlay(item)}>
            <Text style={styles.index}>{index + 1}</Text>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>{item.title}</Text>
              <Text style={styles.duration}>
                {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
                {item.genres.length > 0 ? ` · ${item.genres.join(', ')}` : ''}
              </Text>
            </View>
            <Text style={styles.playIcon}>
              {currentTrack?.id === item.id ? '▶' : '▷'}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  cover: { width: 100, height: 100, borderRadius: 8 },
  coverPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverEmoji: { fontSize: 36 },
  headerInfo: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  meta: { fontSize: 13, color: '#888', marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  index: { width: 24, textAlign: 'right', color: '#888', fontSize: 13 },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 16, fontWeight: '500' },
  duration: { fontSize: 13, color: '#888', marginTop: 2 },
  playIcon: { fontSize: 18 },
  error: { color: '#ef4444', fontSize: 16 },
});