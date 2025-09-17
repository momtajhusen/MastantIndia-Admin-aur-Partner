// Updated Worker Profile Screen with Small Logout Icon
import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomeHeader from "../../components/header";
import { getWorkerProfile, getCategories } from "../../../services/workers";
import { useAlert, ALERT_TYPES } from '../../components/AlertProvider';
import { useFocusEffect } from '@react-navigation/native';
import WorkerProfileUpdateModal from "../../components/WorkerProfileUpdateModal";

const WorkerProfileScreen = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { showAlert } = useAlert();
  
  // Refs to prevent multiple simultaneous API calls
  const isFetchingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Memoized token validation helper
  const validateToken = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      const userType = await AsyncStorage.getItem('user_type');
      
      if (!accessToken || !userType) {
        console.log('❌ Missing authentication credentials');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return false;
    }
  }, []);

  // Fetch categories for the modal
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      if (response?.data?.success && response.data.data) {
        setCategories(response.data.data);
        console.log('✅ Categories loaded:', response.data.data.length);
      }
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      // Don't show error for categories as it's not critical
    }
  }, []);

  // Enhanced fetch profile data with proper cleanup and duplicate call prevention
  const fetchProfileData = useCallback(async (isRefresh = false) => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      console.log('🚫 API call already in progress, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;
      console.log('🔄 Fetching worker profile...', { isRefresh });
      
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      // Check if access token exists before making API call
      const accessToken = await AsyncStorage.getItem('access_token');
      const userType = await AsyncStorage.getItem('user_type');
      
      console.log('🔑 Token Check:', {
        hasToken: !!accessToken,
        userType: userType,
        tokenLength: accessToken ? accessToken.length : 0
      });

      if (!accessToken) {
        console.log('❌ No access token found, redirecting to login');
        showAlert({
          type: ALERT_TYPES.WARNING,
          title: 'Session Expired',
          message: 'Your session has expired. Please login again.',
          actions: [
            {
              text: 'Login',
              style: 'primary',
              onPress: () => navigation.replace('LoginScreen'),
            },
          ],
        });
        return;
      }
      
      // Fetch both profile and categories concurrently
      const [profileResponse] = await Promise.all([
        getWorkerProfile({
          signal: abortControllerRef.current.signal
        }),
        fetchCategories() // Fetch categories in background
      ]);
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        console.log('🚫 Request was aborted');
        return;
      }
      
      console.log('✅ API Response received:', {
        status: profileResponse?.status,
        hasData: !!profileResponse?.data,
        dataKeys: profileResponse?.data ? Object.keys(profileResponse.data) : [],
        hasWorkerProfile: !!(profileResponse?.data?.data?.worker_profile),
        actualStructure: profileResponse?.data ? 'data -> data -> worker_profile' : 'no data'
      });

      if (!profileResponse) {
        throw new Error('No response received from API');
      }

      if (!profileResponse.data) {
        throw new Error('No data in API response');
      }

      if (!profileResponse.data.data || !profileResponse.data.data.worker_profile) {
        console.warn('⚠️ worker_profile not found. Response structure:', JSON.stringify(profileResponse.data, null, 2));
        throw new Error('Worker profile not found in response');
      }

      setProfileData(profileResponse.data.data.worker_profile);
      console.log('✅ Profile data set successfully');
      
    } catch (error) {
      // Don't handle aborted requests
      if (error.name === 'AbortError') {
        console.log('🚫 Request was aborted');
        return;
      }

      console.error('❌ Profile API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      setError(error);
      
      let errorMessage = 'Failed to load profile data';
      let shouldLogout = false;
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        errorMessage = 'Network connection error. Please check your internet connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
        shouldLogout = true;
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You may not have permission to view this profile.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Profile not found. Please contact support.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      if (shouldLogout) {
        // Handle 401 - Auto logout and redirect
        showAlert({
          type: ALERT_TYPES.WARNING,
          title: 'Session Expired',
          message: errorMessage,
          actions: [
            {
              text: 'Login Again',
              style: 'primary',
              onPress: async () => {
                await clearStorageAndRedirect();
              },
            },
          ],
        });
      } else {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Error',
          message: errorMessage,
        });
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
      abortControllerRef.current = null;
    }
  }, [showAlert, navigation, fetchCategories]);

  // Clear storage and redirect helper
  const clearStorageAndRedirect = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['access_token', 'user_type']);
      navigation.replace('LoginScreen');
    } catch (error) {
      console.error('Error clearing storage:', error);
      // Force navigation even if storage clear fails
      navigation.replace('LoginScreen');
    }
  }, [navigation]);

  // Initialize screen only once
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    console.log('🚀 WorkerProfileScreen mounted, initializing...');
    const initializeScreen = async () => {
      const isValidToken = await validateToken();
      if (!isValidToken) {
        showAlert({
          type: ALERT_TYPES.WARNING,
          title: 'Authentication Required',
          message: 'Please login to continue.',
          actions: [
            {
              text: 'Go to Login',
              style: 'primary',
              onPress: () => navigation.replace('LoginScreen'),
            },
          ],
        });
        return;
      }
      
      await fetchProfileData();
      isInitializedRef.current = true;
    };
    
    initializeScreen();
  }, []); // Empty dependency array - only run once

  // Handle screen focus - refresh data only if needed
  useFocusEffect(
    useCallback(() => {
      // Only refresh if screen was already initialized and we have no data
      if (isInitializedRef.current && !profileData && !loading) {
        console.log('🔄 Screen focused, refreshing data...');
        fetchProfileData();
      }
    }, [profileData, loading, fetchProfileData])
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const onRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    fetchProfileData(true);
  }, [fetchProfileData]);

  // Updated handleEditProfile to open modal instead of navigating
  const handleEditProfile = useCallback(() => {
    if (!profileData) {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Error',
        message: 'Profile data not available',
      });
      return;
    }
    
    // Ensure categories are loaded before opening modal
    if (categories.length === 0) {
      fetchCategories().then(() => {
        setModalVisible(true);
      });
    } else {
      setModalVisible(true);
    }
  }, [profileData, categories, fetchCategories, showAlert]);

  // Handle profile update success
  const handleProfileUpdated = useCallback((updatedProfile) => {
    console.log('🔄 Profile updated successfully:', updatedProfile);
    setProfileData(updatedProfile);
    
    // Show success feedback
    showAlert({
      type: ALERT_TYPES.SUCCESS,
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully!',
    });
  }, [showAlert]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Fixed logout functionality with better error handling
  const handleLogout = useCallback(() => {
    showAlert({
      type: ALERT_TYPES.CONFIRM,
      title: 'Logout Confirmation',
      message: 'Are you sure you want to logout? You will need to login again to access your account.',
      dismissible: false,
      actions: [
        {
          text: 'Cancel',
          style: 'default',
        },
        {
          text: 'Logout',
          style: 'danger',
          onPress: performLogout,
        },
      ],
    });
  }, []);

  const performLogout = useCallback(async () => {
    console.log('🚪 Starting logout process...');
    
    try {
      // Cancel any ongoing API calls
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear async storage
      await AsyncStorage.multiRemove(['access_token', 'user_type']);
      console.log('✅ Storage cleared successfully');
      
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
      console.log('✅ Navigation reset successful');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Fallback: try individual removal
      try {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('user_type');
        console.log('✅ Individual storage removal successful');
      } catch (fallbackError) {
        console.error('❌ Fallback storage removal failed:', fallbackError);
      }
      
      // Always try to navigate even if storage clearing fails
      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        });
      } catch (navError) {
        console.error('❌ Navigation error:', navError);
        // Last resort
        navigation.replace('LoginScreen');
      }
    }
  }, [navigation]);

  const checkNetworkAndRetry = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('📶 Network is available, retrying API call...');
        fetchProfileData();
      } else {
        throw new Error('Network check failed');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Network Timeout',
          message: 'Network check timed out. Please check your internet connection.',
        });
      } else {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Network Error',
          message: 'No internet connection detected. Please check your network settings.',
        });
      }
    }
  }, [fetchProfileData, showAlert]);

  // Memoized helper functions
  const getInitials = useCallback((name) => {
    if (!name) return 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }, []);

  const getProfileCompletionPercentage = useCallback(() => {
    if (!profileData) return 0;
    
    let completedFields = 0;
    const totalFields = 10;
    
    if (profileData.worker?.name) completedFields++;
    if (profileData.worker?.mobile) completedFields++;
    if (profileData.worker?.email) completedFields++;
    if (profileData.worker?.address) completedFields++;
    if (profileData.worker?.profile_image) completedFields++;
    if (profileData.worker?.date_of_birth) completedFields++;
    if (profileData.worker?.gender) completedFields++;
    if (profileData.bio) completedFields++;
    if (profileData.skills) completedFields++;
    if (profileData.category_id) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  }, [profileData]);

  const formatPhoneNumber = useCallback((phone) => {
    if (!phone) return 'Not provided';
    if (phone.startsWith('+91')) return phone;
    return `+91${phone.replace(/^\+91/, '')}`;
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomeHeader title="Profile" navigation={navigation} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading profile...</Text>
          <Text style={styles.loadingSubText}>Please wait while we fetch your data</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData || error) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomeHeader title="Profile" navigation={navigation} showBackButton />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ff4444" />
          <Text style={styles.errorTitle}>Unable to Load Profile</Text>
          <Text style={styles.errorMessage}>
            {error?.message || 'Failed to load profile data'}
          </Text>
          
          {__DEV__ && error && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>
                Status: {error.response?.status || 'No status'}
              </Text>
              <Text style={styles.debugText}>
                Response: {JSON.stringify(error.response?.data, null, 2)}
              </Text>
            </View>
          )}
          
          <View style={styles.retryButtonContainer}>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => fetchProfileData()}
              disabled={isFetchingRef.current}
            >
              <Ionicons name="refresh" size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.retryButtonText}>
                {isFetchingRef.current ? 'Retrying...' : 'Retry'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.networkButton} onPress={checkNetworkAndRetry}>
              <Ionicons name="wifi" size={16} color="#000000" style={{ marginRight: 8 }} />
              <Text style={styles.networkButtonText}>Check Network</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const profileCompletion = getProfileCompletionPercentage();

  return (
    <SafeAreaView style={styles.container}>
      <CustomeHeader title="Profile" navigation={navigation} showBackButton />
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Profile Completion Banner */}
        {/* {profileCompletion < 100 && (
          <View style={styles.completionBanner}>
            <View style={styles.completionHeader}>
              <Ionicons name="information-circle" size={20} color="#ff9800" />
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <Text style={styles.completionPercentage}>{profileCompletion}%</Text>
            </View>
            <View style={styles.completionBar}>
              <View 
                style={[styles.completionFill, { width: `${profileCompletion}%` }]}
              />
            </View>
            <Text style={styles.completionText}>
              Complete your profile to get more job opportunities
            </Text>
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.completeButtonText}>Complete Now</Text>
            </TouchableOpacity>
          </View>
        )} */}

        {/* Profile Header Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.profileRow}>
            <View style={styles.profileImageContainer}>
              {profileData.worker?.profile_image ? (
                <Image 
                  source={{ uri: profileData.worker.profile_image }} 
                  style={styles.profileImage} 
                  onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                />
              ) : (
                <View style={styles.profileInitials}>
                  <Text style={styles.profileInitialsText}>
                    {getInitials(profileData.worker?.name)}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.editImageButton}>
                <Ionicons name="camera" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                <Text style={styles.profileName}>{profileData.worker?.name || 'Not provided'}</Text>
                <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={20} color="#666666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.profileCategory}>{profileData.category?.name || 'No category'}</Text>
              <Text style={styles.profileId}>ID: WRK{String(profileData.worker?.id).padStart(6, '0')}</Text>
              
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#000000" />
                <Text style={styles.ratingText}>{parseFloat(profileData.average_rating || 0).toFixed(1)}</Text>
                <Text style={styles.reviewText}>({profileData.total_ratings || 0} reviews)</Text>
              </View>

              <View style={[styles.statusDisplay, { 
                backgroundColor: profileData.is_available ? '#e8f5e8' : '#f0f0f0' 
              }]}>
                <Text style={[styles.statusText, {
                  color: profileData.is_available ? '#2d5a2d' : '#666666'
                }]}>
                  {profileData.is_available ? 'Available' : 'Offline'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="briefcase-outline" size={24} color="#000000" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color="#333333" />
            <Text style={styles.statValue}>{profileData.experience_years || 0}</Text>
            <Text style={styles.statLabel}>Years Exp.</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="location-outline" size={24} color="#666666" />
            <Text style={styles.statValue}>{profileData.max_travel_distance || 0}</Text>
            <Text style={styles.statLabel}>Max KM</Text>
          </View>
        </View>

        {/* Additional Profile Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Profile Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={18} color="#666666" />
            <Text style={styles.detailLabel}>Mobile:</Text>
            <Text style={styles.detailValue}>{formatPhoneNumber(profileData.worker?.mobile)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={18} color="#666666" />
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{profileData.worker?.email || 'Not provided'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color="#666666" />
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{profileData.worker?.address || 'Not provided'}</Text>
          </View>

          {profileData.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.bioTitle}>Bio</Text>
              <Text style={styles.bioText}>{profileData.bio}</Text>
            </View>
          )}

          {profileData.skills && (
            <View style={styles.skillsSection}>
              <Text style={styles.skillsTitle}>Skills</Text>
              <Text style={styles.skillsText}>{profileData.skills}</Text>
            </View>
          )}
        </View>

        {/* Success message for debugging */}
        {profileData && __DEV__ && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✅ Profile loaded successfully!</Text>
            <Text style={styles.debugInfoText}>
              Worker ID: {profileData.worker?.id}, Category: {profileData.category?.name}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Update Profile Modal */}
      <WorkerProfileUpdateModal
        visible={modalVisible}
        onClose={handleModalClose}
        profileData={profileData}
        onProfileUpdated={handleProfileUpdated}
        categories={categories}
      />
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
  loadingSubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
    marginTop: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  debugContainer: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    maxHeight: 150,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 10,
    color: '#666666',
    fontFamily: 'monospace',
  },
  retryButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  networkButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  successText: {
    color: '#2d5a2d',
    fontSize: 14,
    fontWeight: 'bold',
  },
  debugInfoText: {
    color: '#2d5a2d',
    fontSize: 12,
    marginTop: 5,
  },
  // Profile Completion Banner
  completionBanner: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    flex: 1,
    marginLeft: 8,
  },
  completionPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
  },
  completionBar: {
    height: 6,
    backgroundColor: '#f8f8f8',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#ff9800',
    borderRadius: 3,
  },
  completionText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 10,
  },
  completeButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Profile Header
  profileHeaderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileInitials: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitialsText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 4,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  logoutIcon: {
    padding: 4,
    marginLeft: 10,
  },
  profileCategory: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  profileId: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  statusDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  // Stats Row
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#ffffff",
    flex: 1,
    marginHorizontal: 5,
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
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    color: "#000000",
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
    textAlign: 'center',
  },
  // Details
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 10,
    marginRight: 10,
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  bioSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  skillsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  skillsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  skillsText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});


export default WorkerProfileScreen;