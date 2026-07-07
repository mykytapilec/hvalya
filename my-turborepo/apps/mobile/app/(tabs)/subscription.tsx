import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { api, type Subscription } from '../../lib/api';
import { useAuthStore } from '../../store/auth';

export default function SubscriptionScreen() {
  const token = useAuthStore((s) => s.token);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.subscriptions
      .getMine(token)
      .then(setSubscription)
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handleUpgrade() {
    if (!token || !subscription) return;
    setIsUpgrading(true);
    try {
      const nextTier = subscription.tier === 'FREE' ? 'STANDARD' : 'FREE';
      const updated = await api.subscriptions.upgrade(token, nextTier);
      setSubscription(updated);
    } finally {
      setIsUpgrading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const trialDaysLeft = subscription?.trialEndsAt
    ? Math.max(0, Math.ceil(
        (new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Subscription</Text>

      {subscription ? (
        <View style={styles.card}>
          <Text style={styles.tier}>{subscription.tier}</Text>
          <Text style={styles.status}>{subscription.status}</Text>

          {subscription.tier === 'FREE' && trialDaysLeft !== null && (
            <Text style={[styles.trial, trialDaysLeft <= 3 && styles.trialWarning]}>
              {trialDaysLeft > 0
                ? `Trial: ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left`
                : 'Trial expired'}
            </Text>
          )}

          <Pressable style={styles.button} onPress={handleUpgrade} disabled={isUpgrading}>
            <Text style={styles.buttonText}>
              {isUpgrading
                ? 'Updating...'
                : subscription.tier === 'FREE'
                  ? 'Upgrade to Standard'
                  : 'Downgrade to Free'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.empty}>No subscription found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 20 },
  tier: { fontSize: 22, fontWeight: '700' },
  status: { fontSize: 14, color: '#888', marginTop: 4 },
  trial: { fontSize: 14, color: '#888', marginTop: 4, marginBottom: 16 },
  trialWarning: { color: '#d97706', fontWeight: '600' },
  button: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
});