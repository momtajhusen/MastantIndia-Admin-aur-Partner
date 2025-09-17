import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWorkerBookings, updateBookingStatus } from "../../../services/workers";
import { generateWorkerQr } from "../../../services/qrCode";

// ADD THIS IMPORT - This was missing!
import apiClient from "../../../services/apiClient";

// Components
import BookingCard from '../../components/Booking/BookingCard';
import SearchAndFilters from '../../components/Booking/SearchAndFilters';
import BookingDetailsModal from '../../components/Booking/BookingDetailsModal';
import EmptyState from '../../components/Booking/EmptyState';
import QRCodeModal from '../../components/Booking/QRCodeModal';
import { LoadingOverlay, LoadingFooter, LoadingScreen } from '../../components/Booking/LoadingOverlay';

const WorkerBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [totalBookings, setTotalBookings] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [currentQRBookingId, setCurrentQRBookingId] = useState(null);
  const [qrBookingContext, setQrBookingContext] = useState({}); // FIXED: Added missing state

  useEffect(() => {
    setCurrentPage(1);
    fetchBookings(1, true);
  }, [selectedStatus]);

  const checkIfOverdue = (booking, workerStatus) => {
    if (workerStatus === 'completed' || workerStatus === 'cancelled') {
      return false;
    }
    
    const bookingDate = new Date(booking.booking_date);
    const currentDate = new Date();
    
    return bookingDate < currentDate && 
           ['assigned', 'confirmed', 'in_progress'].includes(workerStatus);
  };

  const fetchBookings = async (page = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const params = {
        page: page,
        per_page: 10,
        ...(selectedStatus !== 'all' && { status: selectedStatus })
      };

      const response = await getWorkerBookings(params);
      
      let responseData;
      if (response.data && response.data.data) {
        responseData = response.data.data;
      } else if (response.data) {
        responseData = response.data;
      } else {
        responseData = response;
      }

      if (responseData && (responseData.success || responseData.bookings)) {
        const bookingsData = responseData.bookings?.data || responseData.bookings || [];
        const totalCount = responseData.total_bookings || responseData.bookings?.total || 0;
        const currentPageNum = responseData.current_page || responseData.bookings?.current_page || 1;
        
        const processedBookings = bookingsData.map(booking => {
          const workerStatus = booking.booking_workers[0]?.status || 'assigned';
          const bookingStatus = booking.status || 'pending';
          
          return {
            ...booking,
            effectiveStatus: workerStatus,
            bookingStatus: bookingStatus,
            workerStatus: workerStatus,
            isOverdue: checkIfOverdue(booking, workerStatus)
          };
        });

        if (isRefresh || page === 1) {
          setBookings(processedBookings);
        } else {
          setBookings(prev => [...prev, ...processedBookings]);
        }
        
        setTotalBookings(totalCount);
        setCurrentPage(currentPageNum);
        setHasMoreData(bookingsData.length >= 10);
      } else {
        Alert.alert('Error', responseData?.message || 'Failed to fetch bookings');
      }
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Something went wrong while fetching bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setCurrentPage(1);
    await fetchBookings(1, true);
  };

  const handleLoadMore = () => {
    if (hasMoreData && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchBookings(nextPage, false);
    }
  };

  const toggleCardExpansion = (bookingId) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(bookingId)) {
      newExpandedCards.delete(bookingId);
    } else {
      newExpandedCards.add(bookingId);
    }
    setExpandedCards(newExpandedCards);
  };

  const handleStatusUpdate = async (bookingId, newWorkerStatus) => {
    try {
      setActionLoading(true);

      const response = await updateBookingStatus(bookingId, { status: newWorkerStatus });

      if (response.data.success) {
        Alert.alert('Success', `Your status updated to ${newWorkerStatus}`);
        await fetchBookings(1, true);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  // FIXED: Updated QR generation function with proper context handling
  const generateWorkerQrFunction = async (bookingId) => {
    try {
      console.log('🔧 Generating QR for booking:', bookingId);
      
      // Find the booking to get current status
      const currentBooking = bookings.find(b => b.id === bookingId);
      console.log('🔧 Current booking context:', {
        bookingId,
        workerStatus: currentBooking?.workerStatus,
        bookingStatus: currentBooking?.bookingStatus
      });
      
      const hasToken = !!apiClient.defaults?.headers?.Authorization || 
                      !!apiClient.defaults?.headers?.authorization ||
                      !!apiClient.defaults?.headers?.common?.Authorization;
      console.log('🔧 User token exists:', hasToken);
      
      setActionLoading(true);
      
      const response = await generateWorkerQr(bookingId);
      
      console.log('🔧 QR Generation Response:', response);
      console.log('🔧 Response Status:', response.status);
      console.log('🔧 Response Data:', response.data);
      
      if (response.data.success) {
        setQrData({
          qr_code: response.data.qr_code,
          expires_at: response.data.expires_at
        });
        setCurrentQRBookingId(bookingId);
        
        // FIXED: Store booking context for modal with proper fallback
        const bookingContext = currentBooking ? {
          workerStatus: currentBooking.workerStatus,
          bookingStatus: currentBooking.bookingStatus
        } : {
          workerStatus: 'confirmed', // Default fallback
          bookingStatus: 'confirmed'  // Default fallback
        };
        
        console.log('🔧 Setting booking context:', bookingContext);
        setQrBookingContext(bookingContext);
        setShowQRModal(true);
      } else {
        console.log('🚨 QR Generation failed:', response.data.message);
        Alert.alert('Error', response.data.message || 'Failed to generate QR code');
      }
    } catch (error) {
      console.log('🚨 QR Generation Error:', error);
      console.log('🚨 Error Response:', error.response?.data);
      console.log('🚨 Error Status:', error.response?.status);
      console.log('🚨 Error Message:', error.message);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to generate QR code';
      
      Alert.alert('Error', errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setQrData(null);
    setCurrentQRBookingId(null);
    setQrBookingContext({}); // FIXED: Reset context when closing
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.manufacturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.work_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.work_location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'overdue' ? booking.isOverdue : booking.effectiveStatus === selectedStatus);

    return matchesSearch && matchesStatus;
  });

  const renderBookingCard = ({ item }) => (
    <BookingCard
      item={item}
      isExpanded={expandedCards.has(item.id)}
      onToggleExpansion={toggleCardExpansion}
      onStatusUpdate={handleStatusUpdate}
      onGenerateQR={generateWorkerQrFunction}
      onViewDetails={handleViewDetails}
      actionLoading={actionLoading}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Bookings</Text>
      <Text style={styles.headerSubtitle}>
        {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <LoadingScreen text="Loading bookings..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        totalBookings={totalBookings}
      />
      
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          filteredBookings.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#000']}
            tintColor="#000"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState 
            selectedStatus={selectedStatus} 
            onRefresh={handleRefresh} 
          />
        }
        ListFooterComponent={<LoadingFooter visible={loadingMore} />}
        showsVerticalScrollIndicator={false}
      />

      <BookingDetailsModal
        visible={showBookingDetails}
        booking={selectedBooking}
        onClose={() => setShowBookingDetails(false)}
      />
      
      <LoadingOverlay 
        visible={actionLoading} 
        text="Processing..." 
      />

      {/* FIXED: Pass proper context to QRCodeModal */}
      <QRCodeModal
        visible={showQRModal}
        qrData={qrData}
        bookingId={currentQRBookingId}
        workerStatus={qrBookingContext.workerStatus}
        bookingStatus={qrBookingContext.bookingStatus}
        onClose={handleCloseQRModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#000000',
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContainer: {
    padding: 10,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
});

export default WorkerBookingsScreen;