import * as React from 'react';
import { View, Text, StyleSheet, Linking, Modal } from 'react-native';
import { usePremium } from '@/features/settings/context/premium';
import { Button } from './button';

export function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal } = usePremium();

  const handleUpgrade = async () => {
    try {
      await Linking.openURL('https://example.com/upgrade');
    } catch (error) {
      console.error('Failed to open upgrade URL:', error);
    }
  };

  return (
    <Modal
      visible={showUpgradeModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowUpgradeModal(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.description}>
            Get access to advanced features and analytics with our premium plan.
          </Text>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Premium Features:</Text>
            <Text style={styles.feature}>• Advanced shot analysis</Text>
            <Text style={styles.feature}>• Club comparison tools</Text>
            <Text style={styles.feature}>• Detailed statistics</Text>
            <Text style={styles.feature}>• Custom club settings</Text>
            <Text style={styles.feature}>• Shot pattern visualization</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              variant="outline"
              onPress={() => setShowUpgradeModal(false)}
            >
              Maybe Later
            </Button>
            <Button
              variant="default"
              onPress={handleUpgrade}
            >
              Upgrade Now
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#111827',
  },
  feature: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    flex: 1,
  },
});
