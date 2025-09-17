import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { verifyOtp } from '../../../services/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";


const OtpVerificationScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);
  
  const { mobile } = route.params || { mobile: '+918603150862' };

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when all fields are filled
    if (newOtp.every(digit => digit !== '') && !loading) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode) => {
    setLoading(true);
    setError('');

    try {
      const response = await verifyOtp({
        mobile: mobile.replace('+91', ''),
        otp: otpCode,
        name: "Test User",
        role: "admin"
      });

      console.log(response.data);

      if (response.data.success) {
        // Store user data and token if needed
        AsyncStorage.setItem('access_token', response.data.token);
        AsyncStorage.setItem('user_type', response.data.user.role);

        // Navigate based on user role
        if (response.data.user.role === 'admin') {
          navigation.navigate('AdminBottomTabNavigator');
        } else if (response.data.user.role === 'worker') {
          navigation.navigate('WorkerBottomTabNavigator');
        }
      } else {
        setError(response.data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setResendTimer(30);
    // Call resend OTP API here
    // await sendOtp({ mobile: mobile.replace('+91', ''), purpose: 'login' });
  };

  const formatMobile = (mobile) => {
    if (mobile.startsWith('+91')) {
      return mobile.replace('+91', '+91 ').replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    return mobile;
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Enter the 6-digit code</Text>
              <Text style={styles.subtitle}>
                6 digit OTP has been sent to {formatMobile(mobile)}
              </Text>
            </View>

            {/* OTP Input Fields */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => inputRefs.current[index] = ref}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"    // <-- change from numeric
                  textContentType="telephoneNumber" // helps iOS recognize it as a phone input
                  maxLength={1}
                  editable={!loading}
                  textAlign="center"
                />
              ))}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Resend OTP */}
            <View style={styles.resendSection}>
              <Text style={styles.resendText}>
                Didn't receive the OTP?{' '}
              </Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendTimer > 0}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.resendLink,
                  resendTimer > 0 ? styles.resendLinkDisabled : styles.resendLinkEnabled
                ]}>
                  {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              onPress={() => handleVerifyOtp(otp.join(''))}
              disabled={loading || otp.some(digit => digit === '')}
              style={[
                styles.continueButton,
                (loading || otp.some(digit => digit === '')) ? styles.buttonDisabled : styles.buttonEnabled
              ]}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.buttonText}>Verifying...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Verifying OTP...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  flex1: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    backgroundColor: 'white',
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  mainContent: {
    flex: 1,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: 'white',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  resendLinkEnabled: {
    color: '#000',
  },
  resendLinkDisabled: {
    color: '#9ca3af',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  buttonEnabled: {
    backgroundColor: '#000',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModal: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 12,
  },
});

export default OtpVerificationScreen;