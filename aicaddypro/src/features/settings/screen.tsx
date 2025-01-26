import * as React from 'react';
import { View, ScrollView, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSettings } from '../../../src/core/context/settings';
import { useClubSettings } from '../../../src/features/settings/context/clubs';
import { usePremium } from '../../../src/features/settings/context/premium';
import { Button } from '../../core/components/ui/button';
import { Card } from '../../core/components/ui/card';
import { ClubData } from '@/core/models/YardageModel';

export default function SettingsScreen() {
  const { settings, updateSettings, convertDistance } = useSettings();
  const { clubs, addClub, updateClub, removeClub } = useClubSettings();
  const { isPremium, setShowUpgradeModal } = usePremium();
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [newClub, setNewClub] = React.useState({ name: '', normalYardage: '', loft: '' });

  const handleSave = () => {
    const numericYardage = parseInt(newClub.normalYardage) || 0;
    const processedYardage = settings.distanceUnit === 'meters' ?
      convertDistance(numericYardage, 'yards') :
      numericYardage;

    const clubData = {
      name: newClub.name,
      normalYardage: processedYardage,
      loft: parseInt(newClub.loft) || 0
    };

    if (editingIndex !== null) {
      updateClub(editingIndex, clubData as unknown as ClubData);
    } else {
      addClub(clubData as unknown as ClubData);
    }
    
    setNewClub({ name: '', normalYardage: '', loft: '' });
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    const club = clubs[index];
    const displayYardage = settings.distanceUnit === 'meters' ?
      convertDistance(club.yardage, 'meters') :
      club.yardage;

    setNewClub({
      name: club.name,
      normalYardage: displayYardage.toString(),
      loft: club.loft.toString()
    });
    setEditingIndex(index);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Unit Preferences Card */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Unit Preferences</Text>
        
        {/* Distance Unit Selection */}
        <View style={styles.unitGroup}>
          <Text style={styles.unitLabel}>Distance Unit</Text>
          <View style={styles.unitButtons}>
            <Button
              title="Yards"
              variant={settings.distanceUnit === 'yards' ? 'primary' : 'secondary'}
              onPress={() => updateSettings({ distanceUnit: 'yards' })}
            />
            <Button
              title="Meters"
              variant={settings.distanceUnit === 'meters' ? 'primary' : 'secondary'}
              onPress={() => updateSettings({ distanceUnit: 'meters' })}
            />
          </View>
        </View>

        {/* Similar implementations for temperature and altitude units */}
      </Card>

      {/* Club Management Card */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Club Management</Text>
        
        <View style={styles.formGroup}>
          <TextInput
            placeholder="Club Name"
            value={newClub.name}
            onChangeText={text => setNewClub({...newClub, name: text})}
            style={styles.input}
          />
          <TextInput
            placeholder={`Normal Distance (${settings.distanceUnit})`}
            value={newClub.normalYardage}
            onChangeText={text => setNewClub({...newClub, normalYardage: text})}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Loft (degrees)"
            value={newClub.loft}
            onChangeText={text => setNewClub({...newClub, loft: text})}
            keyboardType="numeric"
            style={styles.input}
          />
          
          <Button
            title={editingIndex !== null ? "Update Club" : "Add Club"}
            onPress={handleSave}
          />
        </View>

        {clubs.map((club, index) => {
          const displayYardage = settings.distanceUnit === 'meters' ?
            convertDistance(club.yardage, 'meters') :
            club.yardage;

          return (
            <View key={index} style={styles.clubItem}>
              <View>
                <Text style={styles.clubName}>{club.name}</Text>
                <Text style={styles.clubDetails}>
                  {Math.round(displayYardage)} {settings.distanceUnit} • {club.loft}°
                </Text>
              </View>
              <View style={styles.clubActions}>
                <TouchableOpacity onPress={() => handleEdit(index)}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeClub(index)}>
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </Card>

      {!isPremium && (
        <Card style={styles.premiumCard}>
          <Text style={styles.premiumText}>Premium Features Locked</Text>
          <Button
            title="Upgrade Now"
            variant="premium"
            onPress={() => setShowUpgradeModal(true)}
          />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  formGroup: {
    gap: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  button: {
    marginTop: 8,
  },
  clubItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  clubName: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '500',
  },
  clubDetails: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  clubActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteText: {
    color: '#EF4444',
  },
});
