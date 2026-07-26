import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { usePlayerStore } from '../store/player';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function Player() {
  const { currentTrack, isPlaying, isLoading, error, isExpanded, pause, resume, expand, collapse } =
    usePlayerStore();
  const player = useAudioPlayer(currentTrack ? { uri: currentTrack.audioUrl } : null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (!currentTrack) return;
    player.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  useEffect(() => {
    if (!player) return;
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying, player]);

  if (!currentTrack && !error && !isLoading) return null;

  const position = status?.currentTime ?? 0;
  const duration = status?.duration ?? 0;
  const progressPct = duration > 0 ? (position / duration) * 100 : 0;

  function handleSeek(value: number) {
    player.seekTo(value);
  }

  return (
    <>
      {!isExpanded && (
        <Pressable onPress={() => currentTrack && expand()} style={styles.bar}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <View style={styles.barContent}>
            {error ? (
              <Text style={styles.error} numberOfLines={2}>
                {error}
              </Text>
            ) : isLoading ? (
              <>
                <Text style={styles.title}>Loading...</Text>
                <ActivityIndicator color="#fff" />
              </>
            ) : (
              <>
                <View style={styles.miniCover} />
                <Text style={styles.title} numberOfLines={1}>
                  {currentTrack?.title}
                </Text>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    isPlaying ? pause() : resume();
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.icon}>{isPlaying ? '⏸' : '▶'}</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      )}

      <Modal visible={isExpanded} animationType="slide" onRequestClose={collapse}>
        {currentTrack && (
          <View style={styles.fullScreen}>
            <Pressable onPress={collapse} style={styles.collapseButton}>
              <Text style={styles.collapseText}>⌄ Minimize</Text>
            </Pressable>

            <View style={styles.fullContent}>
              <View style={styles.fullCover} />
              <Text style={styles.fullTitle}>{currentTrack.title}</Text>

              <View style={styles.sliderContainer}>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={duration || 0}
                  value={position}
                  minimumTrackTintColor="#facc15"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#facc15"
                  onSlidingComplete={handleSeek}
                />
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>{formatTime(position)}</Text>
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
              </View>

              <Pressable onPress={() => (isPlaying ? pause() : resume())} style={styles.playButton}>
                <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e3a8a',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    height: 3,
    backgroundColor: '#facc15',
  },
  barContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  miniCover: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  title: { color: '#fff', fontSize: 14, flex: 1, fontWeight: '500' },
  error: { color: '#fca5a5', fontSize: 13, flex: 1 },
  icon: { color: '#fff', fontSize: 20 },
  fullScreen: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    padding: 24,
  },
  collapseButton: { alignSelf: 'flex-start', paddingVertical: 8 },
  collapseText: { color: '#fff', fontSize: 14 },
  fullContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullCover: {
    width: 240,
    height: 240,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
  },
  fullTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 32, textAlign: 'center' },
  sliderContainer: { width: '100%', marginTop: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  timeText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  playButton: {
    marginTop: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#facc15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#171717', fontSize: 24 },
});