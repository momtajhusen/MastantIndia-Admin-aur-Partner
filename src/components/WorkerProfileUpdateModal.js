import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { updateWorkerProfile } from '../../services/workers';
import { useAlert, ALERT_TYPES } from '../components/AlertProvider';

const WorkerProfileUpdateModal = ({ 
  visible, 
  onClose, 
  profileData, 
  onProfileUpdated,
  categories = []
}) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    category_id: '',
    experience_years: '',
    skills: '',
    bio: '',
    max_travel_distance: '',
    is_available: true,
    training_status: 'hired'
  });
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const { showAlert } = useAlert();

  // Memoize initial data transformation
  const initializeFormData = useMemo(() => {
    if (!profileData) return {};
    
    return {
      name: profileData.worker?.name || '',
      mobile: profileData.worker?.mobile?.replace(/^\+91/, '') || '',
      address: profileData.worker?.address || '',
      category_id: profileData.category_id?.toString() || '',
      experience_years: profileData.experience_years?.toString() || '',
      skills: profileData.skills || '',
      bio: profileData.bio || '',
      max_travel_distance: profileData.max_travel_distance?.toString() || '',
      is_available: profileData.is_available ?? true,
      training_status: profileData.training_status || 'hired'
    };
  }, [profileData]);

  // Initialize form data when modal opens or profileData changes
  useEffect(() => {
    if (visible && profileData) {
      const initialData = initializeFormData;
      setFormData(initialData);
      setOriginalData(initialData);
      setErrors({});
      setHasChanges(false);
    }
  }, [visible, profileData, initializeFormData]);

  // Check for changes in form data
  useEffect(() => {
    const hasFormChanges = Object.keys(formData).some(key => {
      return formData[key] !== originalData[key];
    });
    setHasChanges(hasFormChanges);
  }, [formData, originalData]);

  // Enhanced validation with real-time feedback
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) {
          return 'Name is required';
        }
        if (value.trim().length > 255) {
          return 'Name cannot exceed 255 characters';
        }
        return '';

      case 'mobile':
        if (!value || value.trim().length === 0) {
          return 'Mobile number is required';
        }
        if (!/^[6-9]\d{9}$/.test(value.trim())) {
          return 'Enter valid 10-digit mobile number (6-9)';
        }
        return '';

      case 'address':
        if (value && value.length > 500) {
          return 'Address cannot exceed 500 characters';
        }
        return '';

      case 'experience_years':
        if (value !== '') {
          const exp = parseInt(value);
          if (isNaN(exp) || exp < 0 || exp > 50) {
            return 'Experience must be 0-50 years';
          }
        }
        return '';

      case 'skills':
        if (value && value.length > 500) {
          return 'Skills cannot exceed 500 characters';
        }
        return '';

      case 'bio':
        if (value && value.length > 1000) {
          return 'Bio cannot exceed 1000 characters';
        }
        return '';

      case 'max_travel_distance':
        if (value !== '') {
          const distance = parseInt(value);
          if (isNaN(distance) || distance < 1 || distance > 200) {
            return 'Distance must be 1-200 km';
          }
        }
        return '';

      default:
        return '';
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Real-time validation
    const fieldError = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: fieldError
    }));
  }, [validateField]);

  // Enhanced API call with better error handling
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Validation Error',
        message: 'Please fix all errors before submitting.',
      });
      return;
    }

    if (!hasChanges) {
      showAlert({
        type: ALERT_TYPES.INFO,
        title: 'No Changes',
        message: 'No changes detected to update.',
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare optimized update data - only send changed fields
      const updateData = {};
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== originalData[key]) {
          switch (key) {
            case 'name':
            case 'address':
            case 'skills':
            case 'bio':
              updateData[key] = formData[key].trim();
              break;
            case 'mobile':
              updateData[key] = formData[key].trim();
              break;
            case 'category_id':
            case 'experience_years':
            case 'max_travel_distance':
              updateData[key] = formData[key] ? parseInt(formData[key]) : null;
              break;
            case 'is_available':
            case 'training_status':
              updateData[key] = formData[key];
              break;
          }
        }
      });

      console.log('🔄 Updating profile with optimized data:', updateData);

      const response = await updateWorkerProfile(updateData);

      if (response?.data?.success) {
        const updatedFields = response.data.data?.updated_fields || {};
        const fieldsCount = [
          ...(updatedFields.user_fields || []),
          ...(updatedFields.profile_fields || [])
        ].length;

        showAlert({
          type: ALERT_TYPES.SUCCESS,
          title: 'Profile Updated',
          message: `Successfully updated ${fieldsCount} field${fieldsCount !== 1 ? 's' : ''}`,
        });

        // Update original data to reflect changes
        setOriginalData(formData);
        setHasChanges(false);

        // Callback with updated profile data
        if (onProfileUpdated && response.data.data?.worker_profile) {
          onProfileUpdated(response.data.data.worker_profile);
        }

        // Auto-close after successful update
        setTimeout(() => onClose(), 500);

      } else {
        throw new Error(response?.data?.message || 'Update failed');
      }

    } catch (error) {
      console.error('❌ Profile update error:', error);
      
      let errorMessage = 'Failed to update profile';
      let errorTitle = 'Update Failed';
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        // Server validation errors
        const serverErrors = error.response.data.errors;
        setErrors(serverErrors);
        errorMessage = 'Please fix the validation errors highlighted below';
        errorTitle = 'Validation Error';
      } else if (error.response?.status === 409) {
        errorMessage = 'Mobile number already exists. Please use a different number.';
        errorTitle = 'Duplicate Mobile Number';
      } else if (error.response?.status === 404) {
        errorMessage = 'Profile not found. Please try refreshing the screen.';
        errorTitle = 'Profile Not Found';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this profile.';
        errorTitle = 'Access Denied';
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        errorTitle = 'Authentication Required';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && error.message !== 'Network Error') {
        errorMessage = error.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network connection failed. Please check your internet connection.';
        errorTitle = 'Connection Error';
      }

      showAlert({
        type: ALERT_TYPES.ERROR,
        title: errorTitle,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [formData, originalData, validateForm, hasChanges, showAlert, onProfileUpdated, onClose]);

  const handleClose = useCallback(() => {
    if (hasChanges && !loading) {
      showAlert({
        type: ALERT_TYPES.CONFIRM,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close?',
        actions: [
          {
            text: 'Stay',
            style: 'default',
          },
          {
            text: 'Close',
            style: 'danger',
            onPress: onClose,
          },
        ],
      });
    } else {
      onClose();
    }
  }, [hasChanges, loading, showAlert, onClose]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh - in real app, you might want to refetch profile data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderInputField = (field, label, placeholder, multiline = false, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {['name', 'mobile'].includes(field) && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textAreaInput,
          errors[field] && styles.inputError,
          loading && styles.inputDisabled
        ]}
        placeholder={placeholder}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        editable={!loading}
        maxLength={field === 'mobile' ? 10 : undefined}
      />
      {errors[field] && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#ff4444" />
          <Text style={styles.errorText}>{errors[field]}</Text>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
            disabled={loading}
          >
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Update Profile</Text>
            {hasChanges && <View style={styles.changeIndicator} />}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.saveButton,
              (!hasChanges || loading) && styles.saveButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={!hasChanges || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={[
                styles.saveButtonText,
                !hasChanges && styles.saveButtonTextDisabled
              ]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Form with Pull-to-Refresh */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.formContainer}>
            
            {/* Basic Information Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={20} color="#000000" />
                <Text style={styles.sectionTitle}>Basic Information</Text>
              </View>
              
              {renderInputField('name', 'Full Name', 'Enter your full name')}
              {renderInputField('mobile', 'Mobile Number', 'Enter 10-digit mobile number', false, 'numeric')}
              {renderInputField('address', 'Address', 'Enter your address', true)}
            </View>

            {/* Professional Information Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="briefcase-outline" size={20} color="#000000" />
                <Text style={styles.sectionTitle}>Professional Information</Text>
              </View>
              
              {/* Enhanced Category Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={[styles.pickerContainer, errors.category_id && styles.inputError]}>
                  <Picker
                    selectedValue={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                    enabled={!loading && categories.length > 0}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Category" value="" />
                    {categories.map(category => (
                      <Picker.Item 
                        key={category.id} 
                        label={category.name} 
                        value={category.id.toString()} 
                      />
                    ))}
                  </Picker>
                </View>
                {errors.category_id && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#ff4444" />
                    <Text style={styles.errorText}>{errors.category_id}</Text>
                  </View>
                )}
              </View>

              {renderInputField('experience_years', 'Experience (Years)', 'Years of experience', false, 'numeric')}
              {renderInputField('skills', 'Skills', 'List your skills (comma separated)', true)}
              {renderInputField('bio', 'Bio', 'Write a brief bio about yourself', true)}
              {renderInputField('max_travel_distance', 'Max Travel Distance (KM)', 'Maximum distance willing to travel', false, 'numeric')}
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="settings-outline" size={20} color="#000000" />
                <Text style={styles.sectionTitle}>Settings</Text>
              </View>
              
              {/* Enhanced Availability Toggle */}
              <View style={styles.inputGroup}>
                <View style={styles.switchRow}>
                  <View style={styles.switchInfo}>
                    <View style={styles.switchLabelRow}>
                      <Ionicons 
                        name={formData.is_available ? "checkmark-circle" : "close-circle"} 
                        size={18} 
                        color={formData.is_available ? "#4CAF50" : "#f44336"} 
                      />
                      <Text style={styles.switchLabel}>Available for Work</Text>
                    </View>
                    <Text style={styles.switchSubLabel}>
                      {formData.is_available 
                        ? "You are currently available for new jobs" 
                        : "You are not available for new jobs"
                      }
                    </Text>
                  </View>
                  <Switch
                    value={formData.is_available}
                    onValueChange={(value) => handleInputChange('is_available', value)}
                    disabled={loading}
                    trackColor={{ false: '#f0f0f0', true: '#000000' }}
                    thumbColor={formData.is_available ? '#ffffff' : '#666666'}
                  />
                </View>
              </View>

              {/* Enhanced Training Status Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Training Status</Text>
                <View style={[styles.pickerContainer, errors.training_status && styles.inputError]}>
                  <Picker
                    selectedValue={formData.training_status}
                    onValueChange={(value) => handleInputChange('training_status', value)}
                    enabled={!loading}
                    style={styles.picker}
                  >
                    <Picker.Item label="🆕 Hired" value="hired" />
                    <Picker.Item label="📚 In Training" value="training" />
                    <Picker.Item label="✅ Training Completed" value="completed" />
                  </Picker>
                </View>
                {errors.training_status && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#ff4444" />
                    <Text style={styles.errorText}>{errors.training_status}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Enhanced Mobile Update Button */}
            <TouchableOpacity 
              style={[
                styles.mobileUpdateButton,
                (!hasChanges || loading) && styles.mobileUpdateButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!hasChanges || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                  <Text style={styles.mobileUpdateButtonText}>
                    {hasChanges ? 'Update Profile' : 'No Changes'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  changeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff9800',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
    color: '#888888',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#ff4444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ff4444',
    backgroundColor: '#fff5f5',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999999',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginLeft: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 6,
  },
  switchSubLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    marginLeft: 24,
  },
  mobileUpdateButton: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  mobileUpdateButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  mobileUpdateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default WorkerProfileUpdateModal;