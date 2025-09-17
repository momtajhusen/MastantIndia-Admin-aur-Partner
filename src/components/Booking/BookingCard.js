import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';

const BookingCard = ({
  item,
  isExpanded,
  onToggleExpansion,
  onStatusUpdate,
  onGenerateQR,
  onViewDetails,
  actionLoading,
  refreshData, // Add this prop to refresh data after QR completion
}) => {
  const [waveAnim] = React.useState(new Animated.Value(0));
  const [fireShadowAnim] = React.useState(new Animated.Value(0));
 
  // Extract status values first
  const bookingStatus = item.status || item.bookingStatus;
  const workerStatus = item.booking_workers?.[0]?.status || item.workerStatus || item.effectiveStatus;

  // Status color mappings - Black and White theme
  const getBookingStatusColor = (status) => {
    const colors = {
      'pending': '#666666',
      'confirmed': '#000000',
      'in_progress': '#000000',
      'completed': '#333333',
      'cancelled': '#999999',
      'overdue': '#000000',
      'working': '#000000', // Added for WORKING status
    };
    return colors[status] || '#666666';
  };

  // Status text mappings
  const getBookingStatusText = (status) => {
    const texts = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED',
      'in_progress': 'WORKING',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED',
      'overdue': 'OVERDUE',
      'working': 'WORKING', // Added for direct working status
    };
    return texts[status] || status?.toUpperCase() || 'UNKNOWN';
  };

  // Check if status should show WORKING and animate
  const isWorkingStatus = () => {
    const statusText = getBookingStatusText(bookingStatus);
    return (
      workerStatus === 'in_progress' || 
      bookingStatus === 'in_progress' || 
      bookingStatus === 'working' ||
      statusText === 'WORKING'
    );
  };

  // Start wave animation for working status
  React.useEffect(() => {
    if (isWorkingStatus()) {
      const wave = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      wave.start();
      return () => wave.stop();
    }
  }, [bookingStatus, workerStatus, waveAnim]);

  // Fire shadow animation for working status
  React.useEffect(() => {
    if (isWorkingStatus()) {
      const fireAnimation = Animated.loop(
        Animated.timing(fireShadowAnim, {
          toValue: 1,
          duration: 1500, // 1.5s like the CSS version
          easing: Easing.linear,
          useNativeDriver: false, // We need this false for shadow properties
        })
      );
      fireAnimation.start();
      return () => fireAnimation.stop();
    }
  }, [bookingStatus, workerStatus, fireShadowAnim]);

  // Utility functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const getDaysUntilBooking = (bookingDate) => {
    const today = new Date();
    const booking = new Date(bookingDate);
    const diffTime = booking - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  // Handle QR generation with callback to refresh data
  const handleGenerateQR = async (itemId) => {
    try {
      await onGenerateQR(itemId);
      // Refresh data after QR modal closes
      if (refreshData) {
        setTimeout(() => {
          refreshData();
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

 // Enhanced action button logic with QR flow management
  const getActionButtons = (item) => {
    const buttons = [];
    const workerStatus = item.booking_workers?.[0]?.status || item.workerStatus || item.effectiveStatus;
    const bookingStatus = item.status || item.bookingStatus;
    
    // Early returns for states where no actions are possible
    if (bookingStatus === 'cancelled' || bookingStatus === 'pending') {
      return buttons;
    }

    // Handle overdue cases separately
    if (item.isOverdue) {
      return getOverdueActionButtons(workerStatus, bookingStatus, item.id);
    }

    // Normal workflow based on worker status
    return getNormalActionButtons(workerStatus, bookingStatus, item.id);
  };

  const getOverdueActionButtons = (workerStatus, bookingStatus, itemId) => {
    const buttons = [];
    
    if (workerStatus === 'assigned' && bookingStatus === 'confirmed') {
      buttons.push(
        <TouchableOpacity
          key="accept-overdue"
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => onStatusUpdate(itemId, 'confirmed')}
          disabled={actionLoading}
        >
          <Text style={styles.actionButtonText}>Accept Anyway</Text>
        </TouchableOpacity>
      );
    }
    
    if (workerStatus === 'confirmed') {
      buttons.push(
        <TouchableOpacity
          key="qr-overdue"
          style={[styles.actionButton, styles.qrButton]}
          onPress={() => handleGenerateQR(itemId)}
          disabled={actionLoading}
        >
          <Text style={styles.actionButtonText}>Generate QR (Start)</Text>
        </TouchableOpacity>
      );
    }
    
    if (workerStatus === 'in_progress') {
      // For in_progress, show Generate QR for checkout
      buttons.push(
        <TouchableOpacity
          key="qr-checkout-overdue"
          style={[styles.actionButton, styles.qrCheckoutButton]}
          onPress={() => handleGenerateQR(itemId)}
          disabled={actionLoading}
        >
          <Text style={styles.actionButtonText}>Generate QR (End)</Text>
        </TouchableOpacity>
      );
      
      // Also show manual complete option
      buttons.push(
        <TouchableOpacity
          key="complete-overdue"
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => onStatusUpdate(itemId, 'completed')}
          disabled={actionLoading}
        >
          <Text style={styles.actionButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      );
    }
    
    return buttons;
  };

  const getNormalActionButtons = (workerStatus, bookingStatus, itemId) => {
    const buttons = [];

    switch (workerStatus) {
      case 'assigned':
        if (bookingStatus === 'confirmed') {
          buttons.push(
            <TouchableOpacity
              key="urgent-accept"
              style={[styles.actionButton, styles.urgentButton]}
              onPress={() => onStatusUpdate(itemId, 'confirmed')}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonText}>Accept Now</Text>
            </TouchableOpacity>
          );
          
          buttons.push(
            <TouchableOpacity
              key="decline"
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onStatusUpdate(itemId, 'cancelled')}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonText}>Decline</Text>
            </TouchableOpacity>
          );
        }
        break;

      case 'confirmed':
        // Worker confirmed, ready to start work - Generate QR for check-in
        buttons.push(
          <TouchableOpacity
            key="qr-start"
            style={[styles.actionButton, styles.qrStartButton]}
            onPress={() => handleGenerateQR(itemId)}
            disabled={actionLoading}
          >
            <Text style={styles.actionButtonText}>Generate QR (Start)</Text>
          </TouchableOpacity>
        );
        break;

      case 'in_progress':
        // Work in progress - Generate QR for check-out
        buttons.push(
          <TouchableOpacity
            key="qr-end"
            style={[styles.actionButton, styles.qrEndButton]}
            onPress={() => handleGenerateQR(itemId)}
            disabled={actionLoading}
          >
            <Text style={styles.actionButtonText}>Generate QR (End)</Text>
          </TouchableOpacity>
        );
        
        // Alternative manual completion
        buttons.push(
          <TouchableOpacity
            key="complete"
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => onStatusUpdate(itemId, 'completed')}
            disabled={actionLoading}
          >
            <Text style={styles.actionButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        );
        break;

      case 'completed':
        buttons.push(
          <TouchableOpacity
            key="rate"
            style={[styles.actionButton, styles.rateButton]}
            onPress={() => {
              console.log('Rate manufacturer for booking:', itemId);
            }}
          >
            <Text style={styles.actionButtonText}>Rate Client</Text>
          </TouchableOpacity>
        );
        break;
    }

    return buttons;
  };

  return (
    <View style={[
      styles.bookingCard, 
      item.isOverdue && styles.overdueCard,
    ]}>
      {/* Card Header */}
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => onToggleExpansion(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.headerMain}>
          <View style={styles.headerLeft}>
            <View style={styles.headerInfo}>
              <Text style={styles.manufacturerName} numberOfLines={1}>
                {item.manufacturer.name}
              </Text>
              <Text style={styles.categoryText}>
                {item.booking_workers[0]?.category.name}
              </Text>
              <View style={styles.quickInfo}>
                <Text style={styles.locationQuick} numberOfLines={1}>
                  📍 {item.work_location.split(',')[0]}
                </Text>
                <Text style={[
                  styles.dateQuick, 
                  item.isOverdue && styles.overdueText
                ]}>
                  📅 {getDaysUntilBooking(item.booking_date)}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.priceTextHeader}>
              {formatCurrency(item.booking_workers[0]?.worker_price || 0)}
            </Text>
            
            {/* Status with Animation */}
            <View style={styles.statusContainer}>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: getBookingStatusColor(bookingStatus) }]}>
                  <Text style={styles.statusText}>{getBookingStatusText(bookingStatus)}</Text>
                  {isWorkingStatus() && (
                    <Animated.View style={[
                      styles.waveAnimation,
                      {
                        opacity: waveAnim,
                        transform: [{
                          scaleX: waveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1.2],
                          }),
                        }],
                      },
                    ]}>
                      <Text style={styles.waveText}>~~~</Text>
                    </Animated.View>
                  )}
                </View>
              </View>
            </View>
            
            <Text style={styles.expandIcon}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded Details */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Basic Work Info */}
          <View style={styles.detailBlock}>
            <View style={styles.workSummary}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time:</Text>
                <Text style={[styles.detailValue, item.isOverdue && styles.overdueText]}>
                  {formatDate(item.booking_date)} 
                  {item.preferred_start_time && ` at ${formatTime(item.preferred_start_time)}`}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duration:</Text>
                <Text style={styles.detailValue}>
                  {item.duration_value} {item.duration_type}(s) • {item.booking_workers[0]?.assigned_hours}h
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{item.work_location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Client:</Text>
                <Text style={styles.detailValue}>{item.manufacturer.name}</Text>
              </View>
              {/* Debug Info - Remove this in production */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Debug:</Text>
                <Text style={styles.detailValue}>
                  Worker: {workerStatus} | Booking: {bookingStatus} | Display: {getBookingStatusText(bookingStatus)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.expandedActions}>
            {getActionButtons(item)}
            
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => onViewDetails(item)}
            >
              <Text style={styles.viewDetailsButtonText}>Full Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default BookingCard;

const styles = StyleSheet.create({
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  overdueCard: {
    borderWidth: 2,
  },
  cardHeader: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    marginRight: 12,
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryIcon: {
    fontSize: 20,
  },
  alertIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000000',
  },
  headerInfo: {
    flex: 1,
  },
  manufacturerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 6,
  },
  quickInfo: {
    gap: 4,
  },
  locationQuick: {
    fontSize: 11,
    color: '#888888',
  },
  dateQuick: {
    fontSize: 11,
    color: '#888888',
  },
  overdueText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  priceTextHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  statusContainer: {
    position: 'relative',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  waveAnimation: {
    position: 'absolute',
    right: -16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  waveText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  dotContainer: {
    position: 'relative',
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
  },
  rippleEffect: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  animatedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
    marginLeft: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: '#666666',
  },
  expandedContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  detailBlock: {
    marginBottom: 16,
  },
  workSummary: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 12,
    color: '#000000',
    flex: 1,
  },
  expandedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#000000',
  },
  rejectButton: {
    backgroundColor: '#666666',
  },
  qrButton: {
    backgroundColor: '#333333',
  },
  qrStartButton: {
    backgroundColor: '#000000',
  },
  qrEndButton: {
    backgroundColor: '#333333',
  },
  qrCheckoutButton: {
    backgroundColor: '#666666',
  },
  startButton: {
    backgroundColor: '#555555',
  },
  completeButton: {
    backgroundColor: '#000000',
  },
  rateButton: {
    backgroundColor: '#444444',
  },
  urgentButton: {
    backgroundColor: '#333333',
  },
  viewDetailsButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  viewDetailsButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});