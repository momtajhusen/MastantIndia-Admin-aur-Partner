// AddWorkerScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomeHeader from '../../components/header';
import { useAlert, ALERT_TYPES } from '../../components/AlertProvider';
import { 
  createWorker, 
  updateWorker,
} from '../../../services/workers';
import {
  getAdminCategories
} from '../../../services/categories';

const trainingStatuses = [
  { value: 'hired', label: 'Hired', color: '#666', description: 'Recently hired, training not started' },
  { value: 'pending', label: 'Training Pending', color: '#999', description: 'Training scheduled but not completed' },
  { value: 'completed', label: 'Training Completed', color: '#000', description: 'Successfully completed training' },
];

const AddWorkerScreen = () => {
  const { showAlert } = useAlert();
  const navigation = useNavigation();
  const route = useRoute();
  const { worker, isEditing } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUri, setProfileImageUri] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    category_id: '',
    experience_years: '',
    training_status: 'hired',
    skills: '',
    bio: '',
    is_available: false,
    max_travel_distance: '30',
    is_active: true,
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Initialize form data for editing
  useEffect(() => {
    if (isEditing && worker) {
      setFormData({
        name: worker.worker?.name || '',
        mobile: worker.worker?.mobile?.replace('+91', '') || '',
        address: worker.worker?.address || '',
        category_id: worker.category_id?.toString() || '',
        experience_years: worker.experience_years?.toString() || '',
        training_status: worker.training_status || 'hired',
        skills: worker.skills || '',
        bio: worker.bio || '',
        is_available: worker.is_available || false,
        max_travel_distance: worker.max_travel_distance?.toString() || '30',
        is_active: worker.worker?.is_active !== undefined ? worker.worker.is_active : true,
      });
      
      if (worker.worker?.profile_image) {
        setProfileImageUri(worker.worker.profile_image);
      }
    }
  }, [isEditing, worker]);

const fetchCategories = async () => {
  try {
    setCategoriesLoading(true);
    const response = await getAdminCategories();
    const responseData = response.data;
    
    if (responseData && responseData.success) {
      // Filter only active categories
      const activeCategories = responseData.categories.filter(cat => cat.is_active);
      setCategories(activeCategories);
    }
  } catch (error) {
    // Error handling
  } finally {
    setCategoriesLoading(false);
  }
};

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectProfileImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) return;
      
      if (response.assets && response.assets[0]) {
        const imageAsset = response.assets[0];
        setProfileImage(imageAsset);
        setProfileImageUri(imageAsset.uri);
      }
    });
  };

  const validateForm = () => {
    // Name validation
    if (!formData.name || formData.name.trim() === '') {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Validation Error',
        message: 'Worker name is required.'
      });
      return false;
    }

    if (formData.name.length > 255) {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Validation Error',
        message: 'Worker name cannot exceed 255 characters.'
      });
      return false;
    }

    // Mobile validation (Indian mobile number)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.mobile || formData.mobile.trim() === '') {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Validation Error',
        message: 'Mobile number is required.'
      });
      return false;
    }

    if (!mobileRegex.test(formData.mobile)) {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Validation Error',
        message: 'Mobile number must be a valid 10-digit Indian number starting with 6-9.'
      });
      return false;
    }

    // Address validation
    if (!formData.address || formData.address.trim() === '') {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Validation Error',
        message: 'Worker address is required.'
      });
      return false;
    }

    if (formData.address.length > 500) {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Validation Error',
        message: 'Address cannot exceed 500 characters.'
      });
      return false;
    }

    // Category validation
    if (!formData.category_id) {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Validation Error',
        message: 'Worker category is required.'
      });
      return false;
    }

    // Experience validation
    if (formData.experience_years) {
      const experience = parseInt(formData.experience_years);
      if (isNaN(experience) || experience < 0 || experience > 50) {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Validation Error',
          message: 'Experience years must be between 0 and 50.'
        });
        return false;
      }
    }

    // Travel distance validation
    if (formData.max_travel_distance) {
      const distance = parseInt(formData.max_travel_distance);
      if (isNaN(distance) || distance < 1 || distance > 200) {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Validation Error',
          message: 'Maximum travel distance must be between 1 and 200 km.'
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Prepare form data
      const submitData = new FormData();
      
      // Add text fields
      submitData.append('name', formData.name.trim());
      submitData.append('mobile', formData.mobile.trim());
      submitData.append('address', formData.address.trim());
      submitData.append('category_id', formData.category_id);
      
      if (formData.experience_years) {
        submitData.append('experience_years', formData.experience_years);
      }
      
      if (isEditing) {
        submitData.append('training_status', formData.training_status);
        submitData.append('skills', formData.skills || '');
        submitData.append('bio', formData.bio || '');
        submitData.append('is_available', formData.is_available ? '1' : '0');
        submitData.append('max_travel_distance', formData.max_travel_distance || '30');
        submitData.append('is_active', formData.is_active ? '1' : '0');
      }

      // Add profile image if selected
      if (profileImage) {
        submitData.append('profile_image', {
          uri: profileImage.uri,
          type: profileImage.type || 'image/jpeg',
          name: profileImage.fileName || `profile_${Date.now()}.jpg`,
        });
      }

      // Add Content-Type header for multipart
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      let response;
      if (isEditing) {
        // For PUT request with FormData, use _method field
        submitData.append('_method', 'PUT');
        response = await updateWorker(worker.id, submitData, config);
      } else {
        response = await createWorker(submitData, config);
      }

      const responseData = response.data;
      
      if (responseData && responseData.success) {
        showAlert({
          type: ALERT_TYPES.SUCCESS,
          title: 'Success',
          message: responseData.message,
          actions: [
            {
              text: 'OK',
              style: 'primary',
              onPress: () => navigation.goBack()
            }
          ]
        });
      } else {
        if (responseData?.errors) {
          const errors = Object.values(responseData.errors).flat();
          showAlert({
            type: ALERT_TYPES.ERROR,
            title: 'Validation Error',
            message: errors.join('\n')
          });
        } else {
          showAlert({
            type: ALERT_TYPES.ERROR,
            title: 'Error',
            message: responseData?.message || 'Failed to save worker'
          });
        }
      }
    } catch (error) {
      console.error('Error saving worker:', error);
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Validation Error',
          message: errors.join('\n')
        });
      } else if (error.response?.status === 409) {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Mobile Already Exists',
          message: 'This mobile number is already registered in the system.'
        });
      } else if (error.response?.status === 404) {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Category Not Found',
          message: 'The selected category does not exist.'
        });
      } else if (error.response?.data?.message) {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Error',
          message: error.response.data.message
        });
      } else {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Network Error',
          message: 'Please check your connection and try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    const hasChanges = isEditing ? (
      formData.name !== (worker?.worker?.name || '') ||
      formData.mobile !== (worker?.worker?.mobile?.replace('+91', '') || '') ||
      formData.address !== (worker?.worker?.address || '') ||
      formData.category_id !== (worker?.category_id?.toString() || '') ||
      profileImage !== null
    ) : (
      formData.name || formData.mobile || formData.address || formData.category_id || profileImage
    );

    if (hasChanges) {
      showAlert({
        type: ALERT_TYPES.CONFIRM,
        title: 'Discard Changes',
        message: 'Are you sure you want to go back? Any unsaved changes will be lost.',
        dismissible: false,
        actions: [
          {
            text: 'Stay',
            style: 'default'
          },
          {
            text: 'Discard',
            style: 'danger',
            onPress: () => navigation.goBack()
          }
        ]
      });
    } else {
      navigation.goBack();
    }
  };

  const renderCategorySelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Category *</Text>
      {categoriesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                formData.category_id === category.id.toString() && styles.selectedCategory
              ]}
              onPress={() => handleInputChange('category_id', category.id.toString())}
              activeOpacity={0.7}
            >
              <View style={styles.categoryContent}>
                {category.icon_url ? (
                  <Image 
                    source={{ uri: category.icon_url }} 
                    style={styles.categoryIcon}
                  />
                ) : (
                  <View style={styles.categoryPlaceholder}>
                    <Ionicons name="business-outline" size={20} color="#666" />
                  </View>
                )}
                <View style={styles.categoryText}>
                  <Text style={[
                    styles.categoryName,
                    formData.category_id === category.id.toString() && styles.selectedCategoryText
                  ]}>
                    {category.name}
                  </Text>
                  <Text style={styles.categoryDescription}>
                    ₹{category.price_per_hour}/hr • ₹{category.price_per_day}/day
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  formData.category_id === category.id.toString() && styles.radioButtonSelected
                ]}>
                  {formData.category_id === category.id.toString() && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderTrainingStatusSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Training Status</Text>
      <View style={styles.statusContainer}>
        {trainingStatuses.map((status) => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.statusOption,
              formData.training_status === status.value && styles.selectedStatus
            ]}
            onPress={() => handleInputChange('training_status', status.value)}
            activeOpacity={0.7}
          >
            <View style={styles.statusContent}>
              <View style={[
                styles.radioButton,
                formData.training_status === status.value && styles.radioButtonSelected
              ]}>
                {formData.training_status === status.value && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <View style={styles.statusText}>
                <Text style={[
                  styles.statusName,
                  formData.training_status === status.value && styles.selectedStatusText
                ]}>
                  {status.label}
                </Text>
                <Text style={styles.statusDescription}>{status.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderProfileImage = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Profile Image</Text>
      <TouchableOpacity 
        style={styles.imagePicker} 
        onPress={selectProfileImage}
        activeOpacity={0.7}
      >
        {profileImageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: profileImageUri }} style={styles.imagePreview} />
            <View style={styles.imageOverlay}>
              <Ionicons name="camera-outline" size={20} color="#fff" />
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={30} color="#666" />
            <Text style={styles.imagePlaceholderText}>Select Profile Image</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomeHeader 
        title={isEditing ? 'Edit Worker' : 'Add Worker'} 
        showBack={true}
        onBackPress={handleGoBack}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          
          {/* Profile Image */}
          {renderProfileImage()}

          {/* Worker Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Worker Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter worker name"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              maxLength={255}
            />
          </View>

          {/* Mobile Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter mobile number (e.g., 9876543210)"
              placeholderTextColor="#999"
              value={formData.mobile}
              onChangeText={(text) => handleInputChange('mobile', text.replace(/\D/g, ''))}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!isEditing} // Disable mobile editing in edit mode
            />
            <Text style={styles.helpText}>
              {isEditing ? 'Mobile number cannot be changed' : 'Enter 10-digit Indian mobile number (6-9 starting)'}
            </Text>
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter worker address"
              placeholderTextColor="#999"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          {/* Category Selector */}
          {renderCategorySelector()}

          {/* Experience Years */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Experience (Years)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter years of experience (0-50)"
              placeholderTextColor="#999"
              value={formData.experience_years}
              onChangeText={(text) => handleInputChange('experience_years', text.replace(/\D/g, ''))}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          {/* Additional fields for editing */}
          {isEditing && (
            <>
              {/* Training Status */}
              {renderTrainingStatusSelector()}

              {/* Skills */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Skills</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter worker skills (comma-separated)"
                  placeholderTextColor="#999"
                  value={formData.skills}
                  onChangeText={(text) => handleInputChange('skills', text)}
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Bio */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter worker bio"
                  placeholderTextColor="#999"
                  value={formData.bio}
                  onChangeText={(text) => handleInputChange('bio', text)}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Max Travel Distance */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Maximum Travel Distance (km)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter maximum travel distance"
                  placeholderTextColor="#999"
                  value={formData.max_travel_distance}
                  onChangeText={(text) => handleInputChange('max_travel_distance', text.replace(/\D/g, ''))}
                  keyboardType="numeric"
                />
              </View>

              {/* Availability Switch */}
              <View style={styles.switchContainer}>
                <View style={styles.switchHeader}>
                  <Ionicons name="time-outline" size={20} color="#000" />
                  <Text style={styles.label}>Availability</Text>
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>
                    {formData.is_available ? 'Available for work' : 'Not available'}
                  </Text>
                  <Switch
                    value={formData.is_available}
                    onValueChange={(value) => handleInputChange('is_available', value)}
                    trackColor={{ false: '#ccc', true: '#000' }}
                    thumbColor={formData.is_available ? '#fff' : '#666'}
                  />
                </View>
              </View>

              {/* Status Switch */}
              <View style={styles.switchContainer}>
                <View style={styles.switchHeader}>
                  <Ionicons name="toggle-outline" size={20} color="#000" />
                  <Text style={styles.label}>Worker Status</Text>
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </Text>
                  <Switch
                    value={formData.is_active}
                    onValueChange={(value) => handleInputChange('is_active', value)}
                    trackColor={{ false: '#ccc', true: '#000' }}
                    thumbColor={formData.is_active ? '#fff' : '#666'}
                  />
                </View>
              </View>
            </>
          )}

        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText}>Saving...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Ionicons 
                name={isEditing ? "checkmark-circle-outline" : "person-add-outline"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Update Worker' : 'Create Worker'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Profile Image
  imagePicker: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },

  // Category Selector
  categoryContainer: {
    gap: 8,
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  selectedCategory: {
    borderColor: '#000',
    backgroundColor: '#f8f8f8',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 12,
  },
  categoryPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedCategoryText: {
    color: '#000',
    fontWeight: 'bold',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#999',
  },

  // Training Status
  statusContainer: {
    gap: 8,
  },
  statusOption: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  selectedStatus: {
    borderColor: '#000',
    backgroundColor: '#f8f8f8',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusText: {
    flex: 1,
  },
  statusName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedStatusText: {
    color: '#000',
    fontWeight: 'bold',
  },
  statusDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },

  // Radio Button
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#000',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },

  // Switch Container
  switchContainer: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  switchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },

  // Button
  buttonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddWorkerScreen;
