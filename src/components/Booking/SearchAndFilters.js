import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';

const SearchAndFilters = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  totalBookings,
}) => {
  const statusOptions = [
    { key: 'all', label: 'All', count: totalBookings },
    { key: 'assigned', label: 'Assigned', color: '#f39c12' },
    { key: 'confirmed', label: 'Confirmed', color: '#2ecc71' },
    { key: 'in_progress', label: 'Active Work', color: '#9b59b6' },
    { key: 'completed', label: 'Completed', color: '#27ae60' },
    { key: 'cancelled', label: 'Cancelled', color: '#e74c3c' },
    { key: 'overdue', label: 'Overdue', color: '#c0392b' }
  ];

  const renderStatusFilter = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedStatus === item.key && styles.filterButtonActive
      ]}
      onPress={() => onStatusChange(item.key)}
    >
      <Text
        style={[
          styles.filterText,
          selectedStatus === item.key && styles.filterTextActive
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookings..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={statusOptions}
        renderItem={renderStatusFilter}
        keyExtractor={item => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    fontSize: 18,
    color: '#666',
    padding: 5,
  },
  filtersContainer: {
    paddingVertical: 5,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#ffffff',
  },
});

export default SearchAndFilters;