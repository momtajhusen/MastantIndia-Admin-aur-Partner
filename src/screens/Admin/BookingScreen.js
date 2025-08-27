// BookingScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from "@react-navigation/native";
import CustomeHeader from '../../components/header';


const TABS = ['Upcoming', 'Active', 'Completed', 'Cancelled'];

const BOOKINGS = [
  { id: '1023', user: 'User', provider: 'Provider', time: '11:30 AM', status: 'IN PROGRESS' },
  { id: '1024', user: 'User', provider: 'Provider', time: '11:30 AM', status: 'IN PROGRESS' },
  { id: '1025', user: 'User', provider: 'Provider', time: '11:30 AM', status: 'IN PROGRESS' },
];

const BookingScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Active');

  const renderBooking = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={()=>navigation.navigate('BookingDetails')}>
      {/* Left Circle Avatar */}
      <View style={styles.avatar} />

      {/* Booking Info */}
      <View style={{ flex: 1 }}>
        <Text style={styles.bookingTitle}>Booking #{item.id}</Text>
        <Text style={styles.subText}>
          {item.user} • {item.provider} • {item.time}
        </Text>
      </View>

      {/* Status */}
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <CustomeHeader title="Booking" />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'Active' ? (
          <FlatList
            data={BOOKINGS}
            keyExtractor={item => item.id}
            renderItem={renderBooking}
            contentContainerStyle={{ padding: 16 }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} bookings</Text>
          </View>
        )}
      </View>

      {/* Footer Buttons only for Active */}
      {activeTab === 'Active' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.outlineButton}>
            <Text style={styles.buttonText}>Reassign</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
  },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: 15, color: '#333' },
  activeTabText: { fontWeight: 'bold' },
  underline: {
    height: 2,
    backgroundColor: '#000',
    marginTop: 2,
    width: '100%',
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbb',
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 12,
  },
  bookingTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  subText: { fontSize: 14, color: 'gray' },

  statusBadge: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: '600' },

  // Footer Buttons
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 60,
  },
  buttonText: { fontSize: 15, fontWeight: 'bold' },

  // Empty tab
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { fontSize: 15, color: 'gray' },
});
