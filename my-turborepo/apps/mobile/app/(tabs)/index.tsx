import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api, type Track } from '../../lib/api';
import { useAuthStore } from '../../store/auth';
import { usePlayerStore } from '../../store/player';
import { Player } from '../../components/Player';

export default function TracksScreen() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const play = usePlayerStore((s) => s.play);
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  useEffect(() => {
    api.tracks
      .findAll(token ?? undefined)
      .then(setTracks)
      .catch(() => setTracks([]))
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handlePlay(track: Track) {
    if (!token) {
      Alert.alert('Sign in required', 'Please log in to listen to tracks.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log in', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    await play(track, token);
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tracks</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.empty}>No tracks yet.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => handlePlay(item)}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.duration}>
                {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, '0')}
              </Text>
            </View>
            <Text style={styles.playIcon}>
              {currentTrack?.id === item.id ? '▶' : '▷'}
            </Text>
          </Pressable>
        )}
      />
      <Player />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 16, fontWeight: '500' },
  duration: { fontSize: 13, color: '#888', marginTop: 2 },
  playIcon: { fontSize: 18 },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
});