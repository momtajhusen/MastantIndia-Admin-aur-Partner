import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getQrStatus } from "../../../services/qrCode";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const QRCodeModal = ({ visible, qrData, onClose, bookingId, workerStatus, bookingStatus }) => {
  console.log('QR Modal Props:', { bookingId, workerStatus, bookingStatus });
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [qrStatus, setQrStatus] = useState('pending');
  const [statusMessage, setStatusMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [checkingData, setCheckingData] = useState(null);
  const statusCheckInterval = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const checkCount = useRef(0);

  // Determine QR purpose based on worker/booking status
  const getQRPurpose = () => {
    if (workerStatus === 'confirmed' && bookingStatus === 'confirmed') {
      return 'start'; // For check-in at start of work
    } else if (workerStatus === 'in_progress' || bookingStatus === 'in_progress') {
      return 'end'; // For check-out at end of work
    }
    return 'start'; // Default to start
  };

  const qrPurpose = getQRPurpose();

  useEffect(() => {
    if (visible) {
      console.log('QR Modal opened:', { bookingId, qrPurpose, workerStatus, bookingStatus });
      
      // Reset status when modal opens
      setQrStatus('pending');
      setStatusMessage('');
      setIsChecking(false);
      setDebugInfo('');
      setCheckingData(null);
      checkCount.current = 0;
      
      // Animate modal in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();

      // Start status checking with delay to ensure modal is ready
      setTimeout(() => {
        startStatusChecking();
      }, 500);
    } else {
      // Animate modal out
      Animated.spring(slideAnim, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();

      // Stop status checking
      stopStatusChecking();
    }

    return () => {
      stopStatusChecking();
    };
  }, [visible, slideAnim, bookingId]);

  const startStatusChecking = () => {
    if (!bookingId) {
      console.log('No booking ID provided for QR status checking');
      setDebugInfo('Error: No booking ID provided');
      return;
    }
    
    console.log('Starting QR status checking for booking:', bookingId);
    setIsChecking(true);
    setDebugInfo('Starting status checks...');
    
    // Check immediately
    checkQrStatus();
    
    // Clear any existing interval
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }
    
    // Start new interval - check every 2 seconds
    statusCheckInterval.current = setInterval(() => {
      checkQrStatus();
    }, 2000);
  };

  const stopStatusChecking = () => {
    console.log('Stopping QR status checking');
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
      statusCheckInterval.current = null;
    }
    setIsChecking(false);
  };

  const checkQrStatus = async () => {
    try {
      checkCount.current += 1;
      console.log(`Checking QR status attempt #${checkCount.current} for booking: ${bookingId}`);
      setDebugInfo(`Checking... (attempt #${checkCount.current})`);
      
      const response = await getQrStatus(bookingId);
      console.log('QR Status Raw Response:', response);
      console.log('QR Status Response Data:', response.data);
      
      // Handle both success and direct data responses
      let responseData = response.data;
      let isSuccess = false;
      let currentStatus = null;
      let currentBookingStatus = null;

      // Check if response has success field (new API format)
      if (responseData && typeof responseData === 'object') {
        if (responseData.success !== undefined) {
          // New API format with success field
          isSuccess = responseData.success;
          currentStatus = responseData.qr_status;
          currentBookingStatus = responseData.booking_status;
          console.log('New API format detected:', { isSuccess, currentStatus, currentBookingStatus });
        } else if (responseData.status) {
          // Direct QR checkin data format
          isSuccess = true;
          currentStatus = responseData.status;
          console.log('Direct QR data format detected:', { currentStatus });
          setCheckingData(responseData);
        }
      }
      
      if (isSuccess && currentStatus) {
        console.log('Current QR Status:', currentStatus);
        setDebugInfo(`Status: ${currentStatus} (checked ${checkCount.current} times)`);
        
        // Handle different statuses based on purpose
        switch (currentStatus) {
          case 'checkedin':
            if (qrStatus !== 'checkedin') {
              console.log('QR Code has been scanned! Status changed to checkedin');
              handleStatusChange('checkedin', responseData);
            }
            break;
          
          case 'checkedout':
            if (qrStatus !== 'checkedout') {
              console.log('QR Code checkout scanned! Status changed to checkedout');
              handleStatusChange('checkedout', responseData);
            }
            break;
          
          case 'generated':
            setQrStatus('generated');
            setStatusMessage(`QR code is ready for ${qrPurpose === 'start' ? 'check-in' : 'check-out'}`);
            break;
          
          case 'not_generated':
            setQrStatus('not_generated');
            setStatusMessage('QR code not yet generated');
            break;
          
          case 'expired':
            setQrStatus('expired');
            setStatusMessage('QR code has expired');
            stopStatusChecking();
            break;
          
          default:
            setQrStatus(currentStatus);
            setStatusMessage(`Status: ${currentStatus}`);
        }
      } else {
        console.log('API response unsuccessful or no status:', responseData);
        
        if (responseData && responseData.message) {
          setDebugInfo(`API Message: ${responseData.message} (attempt #${checkCount.current})`);
        } else {
          setDebugInfo(`No valid status received (attempt #${checkCount.current})`);
        }
        
        if (checkCount.current > 5) {
          setQrStatus('error');
          setStatusMessage('Unable to get QR status');
        }
      }
    } catch (error) {
      console.error('Error checking QR status:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || error.message || 'Network error';
      setDebugInfo(`Error: ${errorMsg} (attempt #${checkCount.current})`);
      
      if (checkCount.current > 10) {
        console.log('Too many failed attempts, stopping status checks');
        stopStatusChecking();
        setDebugInfo('Stopped checking due to repeated errors');
        setQrStatus('error');
        setStatusMessage('Connection error - please try again');
      }
    }
  };

  const handleStatusChange = (newStatus, data = null) => {
    if (newStatus === 'checkedin') {
      console.log('Handling status change to checkedin');
      setQrStatus('checkedin');
      
      let successMsg = 'Great! Client has confirmed your arrival and work start.';
      if (data && data.checkin_time) {
        const checkinTime = new Date(data.checkin_time).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        successMsg += ` Check-in time: ${checkinTime}`;
      }
      
      setStatusMessage(successMsg);
      setDebugInfo(`Success! Scanned after ${checkCount.current} checks`);
      stopStatusChecking();
      
      // Animate QR code fade out
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else if (newStatus === 'checkedout') {
      console.log('Handling status change to checkedout');
      setQrStatus('checkedout');
      
      let successMsg = 'Work completed! Client has confirmed your check-out.';
      if (data && data.checkout_time) {
        const checkoutTime = new Date(data.checkout_time).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        successMsg += ` Check-out time: ${checkoutTime}`;
      }
      if (data && data.total_hours) {
        successMsg += ` Total hours: ${data.total_hours}`;
      }
      
      setStatusMessage(successMsg);
      setDebugInfo(`Success! Work completed after ${checkCount.current} checks`);
      stopStatusChecking();
      
      // Animate QR code fade out
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleBackdropPress = () => {
    onClose();
  };

  const handleClose = () => {
    stopStatusChecking();
    onClose();
  };

  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    checkCount.current = 0;
    checkQrStatus();
  };

  const renderStatusIndicator = () => {
    if (qrStatus === 'checkedin') {
      return (
        <View style={styles.statusContainer}>
          <View style={styles.successIndicator}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Work Started!</Text>
          <Text style={styles.successMessage}>{statusMessage}</Text>
          
          {checkingData && checkingData.checkin_time && (
            <Text style={styles.checkinTimeText}>
              Started: {new Date(checkingData.checkin_time).toLocaleString('en-IN')}
            </Text>
          )}
        </View>
      );
    }

    if (qrStatus === 'checkedout') {
      return (
        <View style={styles.statusContainer}>
          <View style={styles.completedIndicator}>
            <Text style={styles.completedIcon}>🎉</Text>
          </View>
          <Text style={styles.completedTitle}>Work Completed!</Text>
          <Text style={styles.completedMessage}>{statusMessage}</Text>
          
          {checkingData && checkingData.checkout_time && (
            <Text style={styles.checkoutTimeText}>
              Completed: {new Date(checkingData.checkout_time).toLocaleString('en-IN')}
            </Text>
          )}
        </View>
      );
    }

    if (qrStatus === 'error') {
      return (
        <View style={styles.statusContainer}>
          <View style={styles.errorIndicator}>
            <Text style={styles.errorIcon}>⚠</Text>
          </View>
          <Text style={styles.errorTitle}>Connection Issue</Text>
          <Text style={styles.errorMessage}>{statusMessage}</Text>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleManualRefresh}
          >
            <Text style={styles.refreshButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (qrStatus === 'expired') {
      return (
        <View style={styles.statusContainer}>
          <View style={styles.expiredIndicator}>
            <Text style={styles.expiredIcon}>⏰</Text>
          </View>
          <Text style={styles.expiredTitle}>QR Code Expired</Text>
          <Text style={styles.expiredMessage}>Please generate a new QR code</Text>
        </View>
      );
    }

    if (isChecking) {
      return (
        <View style={styles.statusContainer}>
          <View style={[
            styles.pendingIndicator,
            qrPurpose === 'end' && styles.pendingIndicatorEnd
          ]}>
            <ActivityIndicator size="small" color={qrPurpose === 'start' ? "#27ae60" : "#e74c3c"} />
          </View>
          <Text style={styles.pendingTitle}>
            {qrPurpose === 'start' ? 'Waiting for check-in...' : 'Waiting for check-out...'}
          </Text>
          <Text style={styles.pendingMessage}>
            {qrPurpose === 'start' 
              ? 'Ask your client to scan the QR code to start work'
              : 'Ask your client to scan the QR code to complete work'
            }
          </Text>
          
          {statusMessage && (
            <Text style={styles.currentStatusText}>{statusMessage}</Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        <Text style={styles.debugText}>Status checking not active</Text>
        {debugInfo ? <Text style={styles.debugText}>{debugInfo}</Text> : null}
      </View>
    );
  };

  const renderActionButton = () => {
    if (qrStatus === 'checkedin') {
      return (
        <TouchableOpacity 
          style={[styles.closeButton, styles.successButton]}
          onPress={handleClose}
        >
          <Text style={styles.closeButtonText}>Start Working!</Text>
        </TouchableOpacity>
      );
    }

    if (qrStatus === 'checkedout') {
      return (
        <TouchableOpacity 
          style={[styles.closeButton, styles.completedButton]}
          onPress={handleClose}
        >
          <Text style={styles.closeButtonText}>Work Completed!</Text>
        </TouchableOpacity>
      );
    }

    if (qrStatus === 'error' || qrStatus === 'expired') {
      return (
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.closeButton, styles.retryButton]}
            onPress={handleManualRefresh}
          >
            <Text style={styles.closeButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={handleClose}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={handleBackdropPress}
      >
        {/* Modal Content */}
        <Animated.View 
          style={[
            styles.modalContainer,
            qrStatus === 'checkedin' && styles.modalContainerSuccess,
            qrStatus === 'checkedout' && styles.modalContainerCompleted,
            qrStatus === 'error' && styles.modalContainerError,
            qrPurpose === 'end' && styles.modalContainerEnd,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            {/* Handle Bar */}
            <View style={[
              styles.handleBar,
              qrPurpose === 'end' && styles.handleBarEnd
            ]} />
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={[
                styles.headerTitle,
                qrStatus === 'checkedin' && styles.headerTitleSuccess,
                qrStatus === 'checkedout' && styles.headerTitleCompleted,
                qrStatus === 'error' && styles.headerTitleError,
                qrPurpose === 'end' && styles.headerTitleEnd
              ]}>
                {qrStatus === 'checkedin' ? 'Work Started!' : 
                 qrStatus === 'checkedout' ? 'Work Completed!' :
                 qrStatus === 'error' ? 'Connection Issue' :
                 qrStatus === 'expired' ? 'QR Code Expired' :
                 qrPurpose === 'start' ? 'QR Code for Check-In' : 'QR Code for Check-Out'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {qrStatus === 'checkedin' 
                  ? 'Your client has confirmed work start time'
                  : qrStatus === 'checkedout'
                  ? 'Your client has confirmed work completion'
                  : qrStatus === 'error'
                  ? 'Unable to check QR status - please try again'
                  : qrStatus === 'expired'
                  ? 'Please generate a new QR code'
                  : qrPurpose === 'start'
                  ? 'Show this to your client to start work'
                  : 'Show this to your client to complete work'
                }
              </Text>
            </View>

            {/* Status Indicator */}
            {renderStatusIndicator()}

            {/* QR Code Container */}
            {!['checkedin', 'checkedout', 'error', 'expired'].includes(qrStatus) && (
              <Animated.View style={[styles.qrContainer, { opacity: fadeAnim }]}>
                <View style={[
                  styles.qrCodeWrapper,
                  qrPurpose === 'end' && styles.qrCodeWrapperEnd
                ]}>
                  {qrData?.qr_code && (
                    <QRCode
                      value={qrData.qr_code}
                      size={200}
                      color="#000000"
                      backgroundColor="#ffffff"
                      logo={require('../../assets/images/Applogo.png')}
                      logoSize={30}
                      logoBackgroundColor="transparent"
                    />
                  )}
                </View>
              </Animated.View>
            )}

            {/* Instructions */}
            {!['checkedin', 'checkedout', 'error', 'expired'].includes(qrStatus) && (
              <View style={[
                styles.instructionsContainer,
                qrPurpose === 'end' && styles.instructionsContainerEnd
              ]}>
                <Text style={styles.instructionsTitle}>Instructions:</Text>
                <Text style={styles.instructionsText}>
                  {qrPurpose === 'start' 
                    ? '• Ask the client to scan this QR code to start work\n• This confirms your arrival and work start time\n• The status will update automatically when scanned'
                    : '• Ask the client to scan this QR code to complete work\n• This confirms your work completion and end time\n• Payment processing will begin after scan'
                  }
                </Text>
              </View>
            )}

            {/* Success Instructions */}
            {qrStatus === 'checkedin' && (
              <View style={[styles.instructionsContainer, styles.successInstructionsContainer]}>
                <Text style={styles.instructionsTitle}>What's Next?</Text>
                <Text style={styles.instructionsText}>
                  • Your work start has been confirmed{'\n'}
                  • You can now begin working on the assigned tasks{'\n'}
                  • Client has been notified of your arrival{'\n'}
                  • Track your time and update progress as needed
                </Text>
              </View>
            )}

            {/* Completion Instructions */}
            {qrStatus === 'checkedout' && (
              <View style={[styles.instructionsContainer, styles.completedInstructionsContainer]}>
                <Text style={styles.instructionsTitle}>Work Completed!</Text>
                <Text style={styles.instructionsText}>
                  • Your work completion has been confirmed{'\n'}
                  • Client has been notified of work completion{'\n'}
                  • Payment processing will begin shortly{'\n'}
                  • You can now rate your experience with this client
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {renderActionButton()}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalContainerSuccess: {
    backgroundColor: '#f8fff8',
    borderColor: '#27ae60',
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  modalContainerCompleted: {
    backgroundColor: '#fff8f0',
    borderColor: '#f39c12',
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  modalContainerError: {
    backgroundColor: '#fff5f5',
    borderColor: '#e74c3c',
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  modalContainerEnd: {
    backgroundColor: '#fef5f5',
    borderColor: '#e74c3c',
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  handleBarEnd: {
    backgroundColor: '#e74c3c',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  headerTitleSuccess: {
    color: '#27ae60',
  },
  headerTitleCompleted: {
    color: '#f39c12',
  },
  headerTitleError: {
    color: '#e74c3c',
  },
  headerTitleEnd: {
    color: '#e74c3c',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 1,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 5,
    paddingVertical: 16,
  },
  successIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#27ae60',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  completedIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f39c12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pendingIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  pendingIndicatorEnd: {
    backgroundColor: '#fef2f2',
    borderColor: '#e74c3c',
  },
  errorIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e74c3c',
  },
  expiredIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  successIcon: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  completedIcon: {
    fontSize: 24,
    color: 'white',
  },
  errorIcon: {
    fontSize: 30,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  expiredIcon: {
    fontSize: 24,
    color: '#f59e0b',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 6,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 6,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 6,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 6,
  },
  expiredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 6,
  },
  successMessage: {
    fontSize: 14,
    color: '#27ae60',
    textAlign: 'center',
    fontWeight: '500',
  },
  completedMessage: {
    fontSize: 14,
    color: '#f39c12',
    textAlign: 'center',
    fontWeight: '500',
  },
  pendingMessage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 8,
  },
  expiredMessage: {
    fontSize: 14,
    color: '#f59e0b',
    textAlign: 'center',
  },
  currentStatusText: {
    fontSize: 12,
    color: '#27ae60',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  checkinTimeText: {
    fontSize: 12,
    color: '#27ae60',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  checkoutTimeText: {
    fontSize: 12,
    color: '#f39c12',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  refreshButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  qrCodeWrapperEnd: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  instructionsContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  instructionsContainerEnd: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  successInstructionsContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  completedInstructionsContainer: {
    backgroundColor: '#fff8f0',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#27ae60',
  },
  completedButton: {
    backgroundColor: '#f39c12',
  },
  retryButton: {
    backgroundColor: '#3498db',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRCodeModal;