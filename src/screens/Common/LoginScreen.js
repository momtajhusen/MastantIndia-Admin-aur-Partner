import React, { useState } from 'react';
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
import { sendOtp } from '../../../services/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LoginScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateMobile = (number) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
  };

  const formatMobileInput = (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 10) {
      return digitsOnly;
    }
    return digitsOnly.slice(0, 10);
  };

  const handleMobileChange = (value) => {
    const formatted = formatMobileInput(value);
    setMobile(formatted);
    setError('');
  };

  const displayMobile = mobile.replace(/(\d{5})(\d{5})/, '$1 $2');

const handleSendOtp = async () => {
  // ✅ Mobile validation
  if (!validateMobile(mobile)) {
    setError('Please enter a valid 10-digit mobile number');
    return;
  }

  setLoading(true);
  setError('');

  try {
    // ✅ API call
    const response = await sendOtp({
      mobile: mobile,
      purpose: 'login'
    });

    const data = response.data;
    console.log(data);
    if (data.success) {
      // ✅ If user is login
      if (data.status === 'login') {
        // ✅ Role check: only admin or worker
        if (data.role === 'admin' || data.role === 'worker') {
          navigation.navigate('OTPVerificationScreen', {
            mobile: `+91${mobile}`,
            otp: data.otp // Make sure OTP is returned from backend
          });
        } else {
          setError('You do not have access to this app.'); // Unauthorized role
        }
      } else {
        // Status register or something else
        setError('User not found.');
      }
    } else {
      setError(data.message || 'Failed to send OTP. Please try again.');
    }
  } catch (error) {
    setError('Something went wrong. Please check your connection and try again.');
    console.error('Send OTP error:', error);
  } finally {
    setLoading(false);
  }
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
            <Text style={styles.headerTitle}>Sign In</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.iconContainer}>
              <Icon name="lock" size={32} color="white" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Enter your mobile number to continue
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Mobile Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={[
                styles.inputContainer, 
                error ? styles.inputError : 
                mobile.length === 10 && validateMobile(mobile) ? styles.inputSuccess : 
                styles.inputDefault
              ]}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.textInput}
                  value={displayMobile}
                  onChangeText={handleMobileChange}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"    // <-- change from numeric
                  textContentType="telephoneNumber" // helps iOS recognize it as a phone input
                  maxLength={11}
                  editable={!loading}
                />
                {mobile.length === 10 && validateMobile(mobile) && (
                  <Icon name="check" size={20} color="#10b981" />
                )}
              </View>
              {mobile.length > 0 && mobile.length < 10 && (
                <Text style={styles.helperText}>
                  {10 - mobile.length} more digits required
                </Text>
              )}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Continue Button */}
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={loading || !validateMobile(mobile)}
              style={[
                styles.continueButton,
                (loading || !validateMobile(mobile)) ? styles.buttonDisabled : styles.buttonEnabled
              ]}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.buttonText}>Sending OTP...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Info Section */}
            <View style={styles.infoContainer}>
              <Icon name="info" size={20} color="#3b82f6" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>
                  We'll send you a 6-digit verification code
                </Text>
                <Text style={styles.infoSubtitle}>
                  Standard messaging rates may apply
                </Text>
              </View>
            </View>
          </View>
 

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Sending OTP...</Text>
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
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    marginHorizontal: -24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#000',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: 'white',
  },
  inputDefault: {
    borderColor: '#d1d5db',
  },
  inputError: {
    borderColor: '#fca5a5',
  },
  inputSuccess: {
    borderColor: '#86efac',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
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
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 12,
    color: '#2563eb',
  },
  alternativeSection: {
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    fontSize: 14,
    color: '#6b7280',
    paddingHorizontal: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
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
  footerLink: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
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

export default LoginScreen;