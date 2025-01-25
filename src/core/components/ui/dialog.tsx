import React from 'react'
import { Modal, Pressable, View, GestureResponderEvent, Text, StyleSheet } from 'react-native'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable 
        style={styles.overlay}
        onPress={() => onOpenChange(false)}
      >
        <View 
          style={styles.content}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e: GestureResponderEvent) => e.stopPropagation()}
        >
          {children}
        </View>
      </Pressable>
    </Modal>
  )
}

export function DialogContent({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.dialogContent}>
      {children}
    </View>
  )
}

export function DialogHeader({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      {children}
    </View>
  )
}

export function DialogTitle({ children }: { children?: React.ReactNode }) {
  return (
    <Text style={styles.title}>
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  dialogContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
})
