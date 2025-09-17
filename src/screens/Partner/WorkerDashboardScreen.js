// ===================================
// Enhanced Worker Dashboard with API Integration & Navigation - Black & White Theme
// ===================================

import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator 
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import CustomeHeader from "../../components/header";
import { getWorkerDashboard, updateWorkerAvailability } from "../../../services/workerDashboard";
import { useAlert, ALERT_TYPES } from '../../components/AlertProvider';

const screenWidth = Dimensions.get("window").width;

const WorkerDashboardScreen = ({ navigation }) => {
  const { showAlert } = useAlert();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await getWorkerDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Dashboard API Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

const handleAvailabilityToggle = async () => {
  try {
    const newAvailability = !dashboardData.worker_info.is_available;

    // ✅ Confirmation custom alert se
    showAlert({
      type: ALERT_TYPES.CONFIRM,
      title: 'Update Availability',
      message: `Are you sure you want to set your status to ${newAvailability ? 'Available' : 'Offline'}?`,
      dismissible: false,
      actions: [
        {
          text: 'Cancel',
          style: 'default',
        },
        {
          text: 'Confirm',
          style: 'primary',
          onPress: async () => {
            try {
              await updateWorkerAvailability(newAvailability);

              setDashboardData(prev => ({
                ...prev,
                worker_info: {
                  ...prev.worker_info,
                  is_available: newAvailability,
                },
              }));

              // ✅ Success alert
              showAlert({
                type: ALERT_TYPES.SUCCESS,
                title: 'Status Updated',
                message: `Your status is now ${newAvailability ? 'Available' : 'Offline'}.`,
                duration: 3000,
              });
            } catch (error) {
              // ❌ Error alert
              showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Update Failed',
                message: error.response?.data?.message || 'Failed to update availability',
              });
            }
          },
        },
      ],
    });
  } catch (error) {
    // ❌ Error alert
    showAlert({
      type: ALERT_TYPES.ERROR,
      title: 'Unexpected Error',
      message: 'Something went wrong',
    });
  }
};

  // Navigation handlers
  const handleViewAllBookings = (tabName = 'pending') => {
    navigation.navigate('Bookings', { 
      screen: 'BookingsTab', 
      params: { activeTab: tabName } 
    });
  };

  const handleViewBookingDetails = (bookingId) => {
    navigation.navigate('BookingDetails', { bookingId });
  };

  const handleViewNextBooking = () => {
    if (dashboardData?.next_booking) {
      navigation.navigate('BookingDetails', { 
        bookingId: dashboardData.next_booking.id,
        bookingData: dashboardData.next_booking 
      });
    }
  };

  const handleViewTraining = () => {
    navigation.navigate('Training');
  };

  const handleViewWallet = () => {
    navigation.navigate('Wallet');
  };

  const handleViewProfile = () => {
    navigation.navigate('Profile');
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'bookings':
        handleViewAllBookings('pending');
        break;
      case 'qr_code':
        if (dashboardData?.next_booking) {
          navigation.navigate('QRCode', { 
            bookingId: dashboardData.next_booking.id,
            bookingDetails: dashboardData.next_booking 
          });
        } else {
          Alert.alert('No Active Booking', 'You need an active booking to generate QR code.');
        }
        break;
      case 'training':
        handleViewTraining();
        break;
      case 'wallet':
        handleViewWallet();
        break;
      case 'profile':
        handleViewProfile();
        break;
      case 'work_session':
        const activeBooking = dashboardData?.stats?.active_bookings > 0;
        if (activeBooking) {
          navigation.navigate('WorkSession', { 
            bookingId: dashboardData?.next_booking?.id || 1 
          });
        } else {
          Alert.alert('No Active Work', 'You need an active booking to start work session.');
        }
        break;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomeHeader title="Worker Dashboard" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomeHeader title="Worker Dashboard" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#000000" />
          <Text style={styles.errorText}>Failed to load dashboard</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { worker_info, stats, earnings, performance, charts, recent_activity, next_booking, quick_actions } = dashboardData;

  // Prepare chart data
  const earningsChartData = {
    labels: charts?.monthly_earnings?.map(item => item.month) || [],
    datasets: [{
      data: charts?.monthly_earnings?.length > 0 
        ? charts.monthly_earnings.map(item => Math.max(item.earnings, 0.1))
        : [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      strokeWidth: 2,
    }]
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#000000"
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomeHeader title="Worker Dashboard" />
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Worker Info Card with Navigation */}
        <TouchableOpacity style={styles.workerInfoCard} onPress={handleViewProfile}>
          <View style={styles.workerInfoRow}>
            <View style={styles.workerInfoLeft}>
              <Text style={styles.workerName}>Hello, {worker_info?.name}!</Text>
              {/* <View style={styles.profileCompletionContainer}>
                <Text style={styles.profileCompletionText}>
                  Profile {worker_info?.profile_completion || 0}% Complete
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#000000" />
              </View> */}
            </View>
            <TouchableOpacity 
              style={[styles.statusBadge, { 
                backgroundColor: worker_info?.is_available ? '#000000' : '#666666' 
              }]}
              onPress={handleAvailabilityToggle}
            >
              <Text style={styles.statusText}>
                {worker_info?.is_available ? 'Available' : 'Offline'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Training Progress with Navigation */}
          {/* <TouchableOpacity style={styles.progressContainer} onPress={handleViewTraining}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Training Progress</Text>
              <View style={styles.progressRight}>
                <Text style={styles.progressText}>{worker_info?.training_progress || 0}%</Text>
                <Ionicons name="chevron-forward" size={16} color="#666666" />
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${worker_info?.training_progress || 0}%` 
              }]} />
            </View>
            <Text style={styles.trainingStatus}>
              Status: {worker_info?.training_status === 'completed' ? 'Completed' : 'In Progress'}
            </Text>
          </TouchableOpacity> */}
        </TouchableOpacity>

        {/* Stats Cards with Navigation */}
        <View style={styles.statsWrapper}>
          <TouchableOpacity style={styles.card} onPress={() => handleViewAllBookings('all')}>
            <Ionicons name="briefcase-outline" size={24} color="#000000" />
            <Text style={styles.cardTitle}>Total Jobs</Text>
            <Text style={styles.cardValue}>{stats?.total_bookings || 0}</Text>
            <Text style={styles.cardSubtext}>All time</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card} onPress={() => handleViewAllBookings('pending')}>
            <Ionicons name="time-outline" size={24} color="#666666" />
            <Text style={styles.cardTitle}>Pending</Text>
            <Text style={styles.cardValue}>{stats?.pending_bookings || 0}</Text>
            <Text style={styles.cardSubtext}>Awaiting response</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card} onPress={() => handleViewAllBookings('active')}>
            <Ionicons name="play-circle-outline" size={24} color="#333333" />
            <Text style={styles.cardTitle}>Active</Text>
            <Text style={styles.cardValue}>{stats?.active_bookings || 0}</Text>
            <Text style={styles.cardSubtext}>In progress</Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Cards with Navigation */}
        <View style={styles.statsWrapper}>
          <TouchableOpacity style={styles.card} onPress={handleViewWallet}>
            <Ionicons name="wallet-outline" size={24} color="#000000" />
            <Text style={styles.cardTitle}>Total Earnings</Text>
            <Text style={styles.cardValue}>₹{(earnings?.total_earnings || 0).toLocaleString('en-IN')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card} onPress={handleViewWallet}>
            <Ionicons name="calendar-outline" size={24} color="#333333" />
            <Text style={styles.cardTitle}>This Month</Text>
            <Text style={styles.cardValue}>₹{(earnings?.this_month_earnings || 0).toLocaleString('en-IN')}</Text>
            {earnings?.earnings_growth !== 0 && (
              <Text style={[styles.growthText, { 
                color: earnings?.earnings_growth_positive ? '#000000' : '#666666' 
              }]}>
                {earnings?.earnings_growth_positive ? '+' : ''}{earnings?.earnings_growth}%
              </Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.card}>
            <Ionicons name="star-outline" size={24} color="#000000" />
            <Text style={styles.cardTitle}>Rating</Text>
            <Text style={styles.cardValue}>{(performance?.average_rating || 0).toFixed(1)}/5</Text>
            <Text style={styles.ratingsCount}>({performance?.total_ratings || 0} ratings)</Text>
          </View>
        </View>

        {/* Quick Actions Card */}
        {/* <View style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickAction, stats?.pending_bookings > 0 && styles.quickActionHighlight]}
              onPress={() => handleQuickAction('bookings')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="calendar" size={24} color="#000000" />
                {stats?.pending_bookings > 0 && (
                  <View style={styles.quickActionBadge}>
                    <Text style={styles.quickActionBadgeText}>{stats.pending_bookings}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.quickActionText}>View Bookings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, next_booking && styles.quickActionHighlight]}
              onPress={() => handleQuickAction('qr_code')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="qr-code" size={24} color="#000000" />
              </View>
              <Text style={styles.quickActionText}>Generate QR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleQuickAction('work_session')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="play" size={24} color="#000000" />
              </View>
              <Text style={styles.quickActionText}>Work Session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, worker_info?.training_progress < 100 && styles.quickActionHighlight]}
              onPress={() => handleQuickAction('training')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="school" size={24} color="#000000" />
                {worker_info?.training_progress < 100 && (
                  <View style={styles.quickActionBadge}>
                    <Text style={styles.quickActionBadgeText}>!</Text>
                  </View>
                )}
              </View>
              <Text style={styles.quickActionText}>Training</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => handleQuickAction('wallet')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="wallet" size={24} color="#000000" />
              </View>
              <Text style={styles.quickActionText}>Wallet</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickAction, worker_info?.profile_completion < 100 && styles.quickActionHighlight]}
              onPress={() => handleQuickAction('profile')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="person" size={24} color="#000000" />
              </View>
              <Text style={styles.quickActionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Next Booking Card with Enhanced Navigation */}
        {next_booking && (
          <TouchableOpacity style={styles.nextBookingCard} onPress={handleViewNextBooking}>
            <View style={styles.nextBookingHeader}>
              <Text style={styles.sectionTitle}>Next Booking</Text>
              <View style={styles.nextBookingActions}>
                <TouchableOpacity 
                  style={styles.nextBookingActionButton}
                  onPress={() => handleQuickAction('qr_code')}
                >
                  <Ionicons name="qr-code-outline" size={16} color="#000000" />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color="#000000" />
              </View>
            </View>
            <View style={styles.bookingInfo}>
              <View style={styles.bookingInfoLeft}>
                <Text style={styles.bookingClient}>{next_booking.manufacturer_name}</Text>
                <Text style={styles.bookingCategory}>{next_booking.category}</Text>
                <Text style={styles.bookingDate}>
                  {new Date(next_booking.booking_date).toLocaleDateString('en-IN')} at {next_booking.preferred_start_time}
                </Text>
                <Text style={styles.bookingLocation} numberOfLines={1}>
                  Location: {next_booking.work_location}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Monthly Earnings Chart */}
        {charts?.monthly_earnings?.length > 0 && (
          <TouchableOpacity style={styles.chartContainer} onPress={handleViewWallet}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Monthly Earnings (₹)</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </View>
            <LineChart
              data={earningsChartData}
              width={screenWidth - 40}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </TouchableOpacity>
        )}

        {/* Recent Activity with Enhanced Navigation */}
        {recent_activity?.length > 0 && (
          <View style={styles.activityContainer}>
            <View style={styles.activityHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => handleViewAllBookings('completed')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {recent_activity.slice(0, 3).map((activity) => (
              <TouchableOpacity 
                key={activity.id} 
                style={styles.activityItem}
                onPress={() => handleViewBookingDetails(activity.id)}
              >
                <View style={styles.activityInfo}>
                  <Text style={styles.activityClient}>{activity.manufacturer_name}</Text>
                  <Text style={styles.activityCategory}>{activity.category}</Text>
                  <Text style={styles.activityDate}>{activity.created_at}</Text>
                </View>
                <View style={styles.activityRight}>
                  <View style={styles.activityStatus}>
                    <Text style={styles.activityStatusText}>{activity.status}</Text>
                  </View>
                  <Text style={styles.activityPrice}>₹{activity.price.toLocaleString('en-IN')}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#999999" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#000000',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workerInfoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  workerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  workerInfoLeft: {
    flex: 1,
  },
  workerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  workerCategory: {
    fontSize: 16,
    color: '#666666',
    marginTop: 2,
  },
  profileCompletionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  profileCompletionText: {
    fontSize: 12,
    color: '#000000',
    marginRight: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666666',
  },
  progressRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
  },
  trainingStatus: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
  },
  statsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#ffffff",
    flex: 1,
    marginHorizontal: 3,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 12,
    color: "#666666",
    marginTop: 8,
    textAlign: 'center',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
    color: "#000000",
    textAlign: 'center',
  },
  cardSubtext: {
    fontSize: 10,
    color: '#999999',
    marginTop: 2,
    textAlign: 'center',
  },
  growthText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  ratingsCount: {
    fontSize: 10,
    color: '#999999',
    marginTop: 2,
  },
  quickActionsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 15,
  },
  quickAction: {
    alignItems: 'center',
    padding: 10,
    minWidth: '28%',
    borderRadius: 8,
  },
  quickActionHighlight: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  quickActionBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#000000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickActionText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
  nextBookingActionButton: {
    padding: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  bookingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingInfoLeft: {
    flex: 1,
  },
  bookingClient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  bookingCategory: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  bookingDate: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  bookingLocation: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  scheduleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scheduleDate: {
    fontSize: 14,
    color: '#666666',
  },
  scheduleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scheduleStatItem: {
    alignItems: 'center',
  },
  scheduleStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  scheduleStatLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  activityContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityInfo: {
    flex: 1,
  },
  activityClient: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  activityCategory: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  activityRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
  },
  activityStatusText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  activityPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  alertsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  alertText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
});

export default WorkerDashboardScreen;

 