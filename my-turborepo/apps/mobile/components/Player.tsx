import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { usePlayerStore } from '../store/player';

export function Player() {
  const { currentTrack, isPlaying, pause, resume } = usePlayerStore();
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    async function loadAndPlay() {
      if (!currentTrack) return;

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentTrack.audioUrl },
        { shouldPlay: true },
      );
      soundRef.current = sound;
    }

    loadAndPlay();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [currentTrack]);

  useEffect(() => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.playAsync();
    } else {
      soundRef.current.pauseAsync();
    }
  }, [isPlaying]);

  if (!currentTrack) return null;

  return (
    <View style={styles.bar}>
      <Text style={styles.title} numberOfLines={1}>
        {currentTrack.title}
      </Text>
      <Pressable onPress={isPlaying ? pause : resume}>
        <Text style={styles.icon}>{isPlaying ? '⏸' : '▶'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 15, flex: 1, marginRight: 12 },
  icon: { color: '#fff', fontSize: 20 },
});
