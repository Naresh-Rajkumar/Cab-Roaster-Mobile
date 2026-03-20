/**
 * Select Pickup Screen — screen 18/21
 * Employee selects a new pickup location for their scheduled trip.
 * Shows a search bar + suggested pickup points list.
 * When a location is chosen, "Send Request" button appears at bottom.
 * "Send Request" navigates to LocationChangeSuccessScreen (19/21).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { SCREENS } from '../../constants';

const PICKUP_LOCATIONS = [
  { id: 'p1', name: 'Karapakkam Bus Stop', address: 'Old Mahabalipuram Road, Karapakkam', type: 'bus_stop' },
  { id: 'p2', name: 'Sholinganallur Bus Stop', address: 'OMR, Sholinganallur', type: 'bus_stop' },
  { id: 'p3', name: 'Perungudi Bus Stop', address: 'Rajiv Gandhi Salai, Perungudi', type: 'bus_stop' },
  { id: 'p4', name: 'Thoraipakkam Bus Stop', address: 'OMR, Thoraipakkam', type: 'bus_stop' },
  { id: 'p5', name: 'Madipakkam Bus Stop', address: 'Madipakkam Main Road', type: 'bus_stop' },
  { id: 'p6', name: 'BSR Mall', address: 'Perungudi, Chennai', type: 'landmark' },
  { id: 'p7', name: 'Aavin Bus Stop', address: 'Sholinganallur', type: 'bus_stop' },
  { id: 'p8', name: 'Tidel Park', address: 'Rajiv Gandhi Salai, Taramani', type: 'landmark' },
];

const ICON_MAP = {
  bus_stop: 'bus-outline',
  landmark: 'location-outline',
  current: 'locate',
};

const LocationItem = ({ item, colors, selected, onSelect }) => {
  const isSelected = selected?.id === item.id;
  return (
    <TouchableOpacity
      style={[
        styles.locationItem,
        {
          borderBottomColor: colors.borderLight,
          backgroundColor: isSelected ? colors.primaryContainer : 'transparent',
        },
      ]}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.locationIcon,
          { backgroundColor: isSelected ? colors.primary : colors.primaryContainer },
        ]}
      >
        <Ionicons
          name={ICON_MAP[item.type] ?? 'location-outline'}
          size={18}
          color={isSelected ? '#fff' : colors.primary}
        />
      </View>
      <View style={styles.locationText}>
        <Text style={[styles.locationName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.locationAddress, { color: colors.textSecondary }]}>{item.address}</Text>
      </View>
      {isSelected ? (
        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
      ) : (
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
};

const SelectPickupScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // When used as a sub-step from RequestCab flows (callback mode)
  const onSelect = route?.params?.onSelect;
  const trip = route?.params?.trip;
  // If mode = 'change_location', show Send Request footer
  const isChangeLocationMode = route?.params?.mode === 'change_location' || !!trip;

  const filtered = query.trim()
    ? PICKUP_LOCATIONS.filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.address.toLowerCase().includes(query.toLowerCase())
      )
    : PICKUP_LOCATIONS;

  const handleSelect = (location) => {
    if (onSelect) {
      onSelect(location);
      navigation.goBack();
      return;
    }
    setSelectedLocation(location);
  };

  const handleCurrentLocation = () => {
    const loc = { id: 'current', name: 'Current Location', address: 'GPS', type: 'current' };
    if (onSelect) {
      onSelect(loc);
      navigation.goBack();
      return;
    }
    setSelectedLocation(loc);
  };

  const handleSendRequest = () => {
    navigation.navigate(SCREENS.LOCATION_CHANGE, {
      trip,
      newLocation: selectedLocation,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Select Pickup</Text>
          {isChangeLocationMode && trip && (
            <Text style={[styles.headerSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {trip.title} · {trip.date}
            </Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search pickup location..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          autoFocus={!isChangeLocationMode}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected location preview */}
      {selectedLocation && (
        <View style={[styles.selectedBanner, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
          <Text style={[styles.selectedBannerText, { color: colors.primary }]} numberOfLines={1}>
            Selected: {selectedLocation.name}
          </Text>
        </View>
      )}

      {/* Current location option */}
      <TouchableOpacity
        style={[styles.currentLocationRow, { borderBottomColor: colors.borderLight }]}
        onPress={handleCurrentLocation}
        activeOpacity={0.7}
      >
        <View style={[styles.locationIcon, { backgroundColor: '#e8f6ed' }]}>
          <Ionicons name="locate" size={18} color="#16a34a" />
        </View>
        <Text style={[styles.currentLocationText, { color: '#16a34a' }]}>Use Current Location</Text>
      </TouchableOpacity>

      {/* Suggested label */}
      <Text style={[styles.suggestedLabel, { color: colors.textTertiary }]}>SUGGESTED PICKUP POINTS</Text>

      {/* Results */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LocationItem
            item={item}
            colors={colors}
            selected={selectedLocation}
            onSelect={handleSelect}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isChangeLocationMode ? 120 : 20 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No locations found</Text>
          </View>
        }
      />

      {/* Send Request footer — appears after a location is selected */}
      {isChangeLocationMode && selectedLocation && (
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
          <View style={styles.footerInfo}>
            <Ionicons name="location" size={14} color={colors.primary} />
            <Text style={[styles.footerLocationText, { color: colors.text }]} numberOfLines={1}>
              {selectedLocation.name}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.sendRequestBtn, { backgroundColor: colors.primary }]}
            onPress={handleSendRequest}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-forward" size={18} color="#fff" />
            <Text style={styles.sendRequestBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 1 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },

  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  selectedBannerText: { flex: 1, fontSize: 13, fontWeight: '600' },

  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  currentLocationText: { fontSize: 15, fontWeight: '600' },

  suggestedLabel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },

  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  locationIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  locationText: { flex: 1 },
  locationName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  locationAddress: { fontSize: 12 },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLocationText: { flex: 1, fontSize: 13, fontWeight: '500' },
  sendRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 8,
  },
  sendRequestBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default SelectPickupScreen;
