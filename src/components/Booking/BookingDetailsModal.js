import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const BookingDetailsModal = ({
  visible,
  booking,
  onClose,
}) => {
  const getStatusColor = (status, isOverdue = false) => {
    if (isOverdue) return '#c0392b';
    
    switch (status) {
      case 'assigned': return '#f39c12';
      case 'confirmed': return '#2ecc71';
      case 'in_progress': return '#9b59b6';
      case 'completed': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusDisplayText = (status, isOverdue = false) => {
    if (isOverdue) return 'OVERDUE';
    
    switch (status) {
      case 'in_progress': return 'ACTIVE';
      case 'assigned': return 'NEW';
      default: return status.replace('_', ' ').toUpperCase();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  if (!booking) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Booking #{booking.id}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Booking Summary</Text>
              {/* <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Your Status:</Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: getStatusColor(booking.effectiveStatus, booking.isOverdue) 
                }]}>
                  <Text style={styles.statusText}>
                    {getStatusDisplayText(booking.effectiveStatus, booking.isOverdue)}
                  </Text>
                </View>
              </View> */}
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Booking Status:</Text>
                <Text style={styles.modalValue}>
                  {booking.bookingStatus?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Created:</Text>
                <Text style={styles.modalValue}>{formatDate(booking.created_at)}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Your Earning:</Text>
                <Text style={styles.modalPriceValue}>
                  {formatCurrency(booking.booking_workers[0]?.worker_price || 0)}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Total Payment:</Text>
                <Text style={styles.modalValue}>{formatCurrency(booking.total_price)}</Text>
              </View>
            </View>

            {/* Client Details */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Client Information</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Name:</Text>
                <Text style={styles.modalValue}>{booking.manufacturer.name}</Text>
              </View>
              {booking.manufacturer.mobile && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Mobile:</Text>
                  <Text style={styles.modalValue}>{booking.manufacturer.mobile}</Text>
                </View>
              )}
              {booking.manufacturer.company_name && (
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Company:</Text>
                  <Text style={styles.modalValue}>{booking.manufacturer.company_name}</Text>
                </View>
              )}
            </View>

            {/* Work Details */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Work Details</Text>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Category:</Text>
                <Text style={styles.modalValue}>{booking.booking_workers[0]?.category.name}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Location:</Text>
                <Text style={styles.modalValue}>{booking.work_location}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Date:</Text>
                <Text style={styles.modalValue}>{formatDate(booking.booking_date)}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Duration:</Text>
                <Text style={styles.modalValue}>
                  {booking.duration_value} {booking.duration_type}(s)
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Description:</Text>
                <Text style={[styles.modalValue, styles.modalValueMultiline]}>
                  {booking.work_description}
                </Text>
              </View>
            </View>

            {/* Requirements */}
            {(booking.requirements?.length > 0 || booking.special_instructions) && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Requirements & Instructions</Text>
                {booking.requirements?.length > 0 && (
                  <View style={styles.requirementsContainer}>
                    <Text style={styles.requirementsLabel}>Requirements:</Text>
                    {booking.requirements.map((req, index) => (
                      <Text key={index} style={styles.requirementText}>• {req}</Text>
                    ))}
                  </View>
                )}
                {booking.special_instructions && (
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.requirementsLabel}>Special Instructions:</Text>
                    <Text style={styles.instructionText}>{booking.special_instructions}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    minWidth: 80,
  },
  modalValue: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  modalValueMultiline: {
    textAlign: 'left',
    lineHeight: 18,
  },
  modalPriceValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  instructionsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
  },
  requirementsLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 11,
    color: '#000',
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 11,
    color: '#000',
    lineHeight: 15,
  },
});

export default BookingDetailsModal;