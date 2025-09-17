// CategoryForm.js
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
  Image,
  Switch,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomeHeader from '../../components/header';
import { useAlert, ALERT_TYPES } from '../../components/AlertProvider';
import { 
  createCategory, 
  updateCategory, 
  uploadCategoryIcon,
  uploadCategoryBanner 
} from '../../../services/categories';

const CategoryForm = () => {
  const { showAlert } = useAlert();
  const navigation = useNavigation();
  const route = useRoute();
  const { category, isEditing } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_hour: '',
    price_per_day: '',
    price_per_week: '',
    price_per_month: '',
    price_full_time: '',
    is_active: true,
    requirements: '',
    average_completion_time: '',
    tools_required: '',
  });
  
  const [iconImage, setIconImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [iconUri, setIconUri] = useState(null);
  const [bannerUri, setBannerUri] = useState(null);

  // Initialize form data for editing
  useEffect(() => {
    if (isEditing && category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        price_per_hour: category.price_per_hour?.toString() || '',
        price_per_day: category.price_per_day?.toString() || '',
        price_per_week: category.price_per_week?.toString() || '',
        price_per_month: category.price_per_month?.toString() || '',
        price_full_time: category.price_full_time?.toString() || '',
        is_active: category.is_active || true,
        requirements: category.requirements || '',
        average_completion_time: category.average_completion_time?.toString() || '',
        tools_required: Array.isArray(category.tools_required) 
          ? category.tools_required.join(', ') 
          : (category.tools_required || ''),
      });
      
      if (category.icon_url) {
        setIconUri(category.icon_url);
      }
      if (category.banner_image) {
        setBannerUri(category.banner_image);
      }
    }
  }, [isEditing, category]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectImage = (type) => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) return;
      
      if (response.assets && response.assets[0]) {
        const imageAsset = response.assets[0];
        
        if (type === 'icon') {
          setIconImage(imageAsset);
          setIconUri(imageAsset.uri);
        } else {
          setBannerImage(imageAsset);
          setBannerUri(imageAsset.uri);
        }
      }
    });
  };

  const validateForm = () => {
    const required = ['name', 'price_per_hour', 'price_per_day', 'price_per_week', 'price_per_month', 'price_full_time'];
    
    for (let field of required) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Validation Error',
          message: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`
        });
        return false;
      }
    }

    // Validate numeric fields
    const numericFields = ['price_per_hour', 'price_per_day', 'price_per_week', 'price_per_month', 'price_full_time'];
    for (let field of numericFields) {
      if (isNaN(parseFloat(formData[field])) || parseFloat(formData[field]) < 0) {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Validation Error',
          message: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} must be a valid positive number`
        });
        return false;
      }
    }

    if (formData.average_completion_time && (isNaN(parseInt(formData.average_completion_time)) || parseInt(formData.average_completion_time) < 1)) {
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Validation Error',
        message: 'Average completion time must be a valid positive number'
      });
      return false;
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
      Object.keys(formData).forEach(key => {
        if (key === 'tools_required' && formData[key]) {
          // Convert comma-separated string to array for Laravel
          const toolsArray = formData[key].split(',').map(tool => tool.trim()).filter(tool => tool);
          toolsArray.forEach((tool, index) => {
            submitData.append(`tools_required[${index}]`, tool);
          });
        } else if (key === 'is_active') {
          // Convert boolean to string for Laravel
          submitData.append(key, formData[key] ? '1' : '0');
        } else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          submitData.append(key, formData[key].toString());
        }
      });

      // Add images if selected (React Native format)
      if (iconImage) {
        submitData.append('icon', {
          uri: iconImage.uri,
          type: iconImage.type || 'image/jpeg',
          name: iconImage.fileName || `icon_${Date.now()}.jpg`,
        });
      }

      if (bannerImage) {
        submitData.append('banner_image', {
          uri: bannerImage.uri,
          type: bannerImage.type || 'image/jpeg', 
          name: bannerImage.fileName || `banner_${Date.now()}.jpg`,
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
        response = await updateCategory(category.id, submitData, config);
      } else {
        response = await createCategory(submitData, config);
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
        if (responseData?.validation_errors) {
          const errors = Object.values(responseData.validation_errors).flat();
          showAlert({
            type: ALERT_TYPES.ERROR,
            title: 'Validation Error',
            message: errors.join('\n')
          });
        } else {
          showAlert({
            type: ALERT_TYPES.ERROR,
            title: 'Error',
            message: responseData?.error || 'Failed to save category'
          });
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      
      if (error.response?.data?.validation_errors) {
        const errors = Object.values(error.response.data.validation_errors).flat();
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Validation Error',
          message: errors.join('\n')
        });
      } else if (error.response?.data?.error) {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Error',
          message: error.response.data.error
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
  };

  const renderImagePicker = (type, uri, title) => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.imageLabel}>{title}</Text>
      <TouchableOpacity 
        style={styles.imagePicker} 
        onPress={() => selectImage(type)}
        activeOpacity={0.7}
      >
        {uri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.imagePreview} />
            <View style={styles.imageOverlay}>
              <Ionicons name="camera-outline" size={20} color="#fff" />
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={30} color="#666" />
            <Text style={styles.imagePlaceholderText}>Select {title}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomeHeader 
        title={isEditing ? 'Edit Category' : 'Add Category'} 
        showBack={true}
        onBackPress={handleGoBack}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          
          {/* Category Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter category name"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              maxLength={255}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter category description"
              placeholderTextColor="#999"
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              multiline
              numberOfLines={3}
              maxLength={1000}
            />
          </View>

          {/* Pricing Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag-outline" size={20} color="#000" />
            <Text style={styles.sectionTitle}>Pricing Information</Text>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Hourly Rate (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                value={formData.price_per_hour}
                onChangeText={(text) => handleInputChange('price_per_hour', text)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Daily Rate (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                value={formData.price_per_day}
                onChangeText={(text) => handleInputChange('price_per_day', text)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Weekly Rate (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                value={formData.price_per_week}
                onChangeText={(text) => handleInputChange('price_per_week', text)}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Monthly Rate (₹) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                value={formData.price_per_month}
                onChangeText={(text) => handleInputChange('price_per_month', text)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full-time Rate (₹) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#999"
              value={formData.price_full_time}
              onChangeText={(text) => handleInputChange('price_full_time', text)}
              keyboardType="numeric"
            />
          </View>

          {/* Additional Information */}
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#000" />
            <Text style={styles.sectionTitle}>Additional Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Requirements</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter job requirements"
              placeholderTextColor="#999"
              value={formData.requirements}
              onChangeText={(text) => handleInputChange('requirements', text)}
              multiline
              numberOfLines={3}
              maxLength={2000}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Average Completion Time (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="480"
              placeholderTextColor="#999"
              value={formData.average_completion_time}
              onChangeText={(text) => handleInputChange('average_completion_time', text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tools Required (comma-separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="tool1, tool2, tool3"
              placeholderTextColor="#999"
              value={formData.tools_required}
              onChangeText={(text) => handleInputChange('tools_required', text)}
            />
          </View>

          {/* Images */}
          <View style={styles.sectionHeader}>
            <Ionicons name="image-outline" size={20} color="#000" />
            <Text style={styles.sectionTitle}>Images</Text>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              {renderImagePicker('icon', iconUri, 'Icon')}
            </View>
            <View style={styles.halfWidth}>
              {renderImagePicker('banner', bannerUri, 'Banner')}
            </View>
          </View>

          {/* Status Toggle */}
          <View style={styles.statusContainer}>
            <View style={styles.statusHeader}>
              <Ionicons name="toggle-outline" size={20} color="#000" />
              <Text style={styles.label}>Category Status</Text>
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
                name={isEditing ? "checkmark-circle-outline" : "add-circle-outline"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Update Category' : 'Create Category'}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  imagePickerContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
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
  statusContainer: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  statusHeader: {
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

export default CategoryForm;