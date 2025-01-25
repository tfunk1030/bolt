'use client'

import React from 'react'
import { View, Text, StyleSheet, Linking } from 'react-native'
import { usePremium } from '@/src/features/settings/context/premium'
import { Button } from './button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'

export function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal } = usePremium()

  if (!showUpgradeModal) return null

  const handleUpgrade = async () => {
    try {
      await Linking.openURL('https://example.com/upgrade')
    } catch (error) {
      console.error('Failed to open upgrade URL:', error)
    }
  }

  return (
    <Dialog 
      open={showUpgradeModal} 
      onOpenChange={setShowUpgradeModal}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Premium</DialogTitle>
        </DialogHeader>
        <View style={styles.container}>
          <Text style={styles.description}>
            Get access to advanced features and analytics with our premium plan.
          </Text>
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Premium Features:</Text>
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>• Advanced shot analysis</Text>
              <Text style={styles.featureItem}>• Club comparison tools</Text>
              <Text style={styles.featureItem}>• Detailed statistics</Text>
              <Text style={styles.featureItem}>• Custom club settings</Text>
              <Text style={styles.featureItem}>• Shot pattern visualization</Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Button 
                variant="outline" 
                onPress={() => setShowUpgradeModal(false)}
              >
                Maybe Later
              </Button>
            </View>
            <View style={styles.buttonWrapper}>
              <Button 
                variant="default"
                onPress={handleUpgrade}
              >
                Upgrade Now
              </Button>
            </View>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  description: {
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: 8,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  buttonWrapper: {
    flex: 0,
  },
})
