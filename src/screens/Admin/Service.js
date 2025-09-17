// Service.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import CustomeHeader from "../../components/header";
import { 
  getAdminCategories, 
  getAdminCategory, 
  deleteCategory, 
  toggleCategoryStatus 
} from "../../../services/categories";
import { useAlert, ALERT_TYPES } from '../../components/AlertProvider';

const Service = () => {
  const { showAlert } = useAlert();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Categories");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Fetch all categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAdminCategories();
      
      // Access data from response.data
      const responseData = response.data;
      
      if (responseData && responseData.success) {
        setCategories(responseData.categories || []);
        setStatistics(responseData.statistics || { total: 0, active: 0, inactive: 0 });
      } else {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Error',
          message: responseData?.error || 'Failed to fetch categories'
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Network Error',
        message: 'Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  const handleToggleCategory = async (categoryId, currentStatus) => {
    showAlert({
      type: ALERT_TYPES.CONFIRM,
      title: "Confirm Action",
      message: `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this category?`,
      dismissible: false,
      actions: [
        {
          text: "Cancel",
          style: 'default',
        },
        {
          text: "Yes",
          style: 'primary',
          onPress: async () => {
            try {
              const response = await toggleCategoryStatus(categoryId);
              const responseData = response.data;
              
              if (responseData && responseData.success) {
                // Update local state
                setCategories(prev => 
                  prev.map(category => 
                    category.id === categoryId 
                      ? { ...category, is_active: !currentStatus }
                      : category
                  )
                );
                
                // Update statistics
                setStatistics(prev => ({
                  ...prev,
                  active: currentStatus ? prev.active - 1 : prev.active + 1,
                  inactive: currentStatus ? prev.inactive + 1 : prev.inactive - 1
                }));
                
                showAlert({
                  type: ALERT_TYPES.SUCCESS,
                  title: 'Success',
                  message: responseData.message,
                  duration: 3000
                });
              } else {
                showAlert({
                  type: ALERT_TYPES.ERROR,
                  title: 'Error',
                  message: responseData?.error || 'Failed to update category status'
                });
              }
            } catch (error) {
              console.error('Error toggling category:', error);
              showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Network Error',
                message: 'Please try again.'
              });
            }
          }
        }
      ]
    });
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    showAlert({
      type: ALERT_TYPES.CONFIRM,
      title: "Delete Category",
      message: `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      dismissible: false,
      actions: [
        {
          text: "Cancel",
          style: 'default',
        },
        {
          text: "Delete",
          style: 'danger',
          onPress: async () => {
            try {
              const response = await deleteCategory(categoryId);
              const responseData = response.data;
              
              if (responseData && responseData.success) {
                // Remove from local state
                setCategories(prev => prev.filter(category => category.id !== categoryId));
                
                // Update statistics
                const deletedCategory = categories.find(cat => cat.id === categoryId);
                if (deletedCategory) {
                  setStatistics(prev => ({
                    total: prev.total - 1,
                    active: deletedCategory.is_active ? prev.active - 1 : prev.active,
                    inactive: !deletedCategory.is_active ? prev.inactive - 1 : prev.inactive
                  }));
                }
                
                showAlert({
                  type: ALERT_TYPES.SUCCESS,
                  title: 'Success',
                  message: responseData.message,
                  duration: 3000
                });
              } else {
                showAlert({
                  type: ALERT_TYPES.ERROR,
                  title: 'Error',
                  message: responseData?.error || 'Failed to delete category'
                });
              }
            } catch (error) {
              console.error('Error deleting category:', error);
              showAlert({
                type: ALERT_TYPES.ERROR,
                title: 'Network Error',
                message: 'Please try again.'
              });
            }
          }
        }
      ]
    });
  };

  const handleEditCategory = async (categoryId) => {
    try {
      // Fetch detailed category data
      const response = await getAdminCategory(categoryId);
      const responseData = response.data;
      
      if (responseData && responseData.success) {
        // Navigate to edit screen with category data
        navigation.navigate("CategoryForm", { 
          category: responseData.category,
          isEditing: true 
        });
      } else {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Error',
          message: responseData?.error || 'Failed to fetch category details'
        });
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
      showAlert({
        type: ALERT_TYPES.ERROR,
        title: 'Network Error',
        message: 'Please try again.'
      });
    }
  };

  const handleAddCategory = () => {
    // Navigate to add category screen
    navigation.navigate("CategoryForm", { 
      isEditing: false 
    });
  };

  const getImageSource = (category) => {
    if (category.icon_url) {
      // API already returns full URLs, so use directly
      return { uri: category.icon_url };
    }
    // Return null for default placeholder if no icon
    return null;
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, !item.is_active && styles.inactiveCard]}
      onPress={() => handleEditCategory(item.id)}
      activeOpacity={0.7}
    >
      {/* Left Section - Icon and Main Info */}
      <View style={styles.leftSection}>
        {/* Category Icon */}
        <View style={styles.iconContainer}>
          {item.icon_url ? (
            <Image 
              source={getImageSource(item)}
              style={styles.categoryIcon}
              resizeMode="cover"
              onError={() => console.log('Error loading image')}
            />
          ) : (
            <View style={styles.placeholderIcon}>
              <Ionicons name="business-outline" size={24} color="#666" />
            </View>
          )}
        </View>

        {/* Category Info */}
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
          <View style={styles.priceContainer}>
            <View style={styles.priceItem}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.priceText}>₹{item.price_per_hour}/hr</Text>
            </View>
            <View style={styles.priceItem}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.priceText}>₹{item.price_per_day}/day</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right Section - Status and Menu */}
      <View style={styles.rightSection}>
        {/* Status Badge */}
        <View style={[
          styles.statusBadge, 
          item.is_active ? styles.activeBadge : styles.inactiveBadge
        ]}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: item.is_active ? '#000' : '#666' }
          ]} />
          <Text style={[
            styles.statusText,
            { color: item.is_active ? '#000' : '#666' }
          ]}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
        
        {/* Menu Trigger */}
        <Menu>
          <MenuTrigger>
            <View style={styles.menuTrigger}>
              <Ionicons name="ellipsis-vertical" size={20} color="#000" />
            </View>
          </MenuTrigger>
          <MenuOptions customStyles={menuStyles}>
            <MenuOption onSelect={() => handleEditCategory(item.id)}>
              <View style={styles.menuOption}>
                <Ionicons name="pencil-outline" size={16} color="#000" />
                <Text style={styles.menuText}>Edit</Text>
              </View>
            </MenuOption>
            <MenuOption onSelect={() => handleToggleCategory(item.id, item.is_active)}>
              <View style={styles.menuOption}>
                <Ionicons 
                  name={item.is_active ? "pause-outline" : "play-outline"} 
                  size={16} 
                  color="#000" 
                />
                <Text style={styles.menuText}>
                  {item.is_active ? 'Deactivate' : 'Activate'}
                </Text>
              </View>
            </MenuOption>
            <View style={styles.menuDivider} />
            <MenuOption onSelect={() => handleDeleteCategory(item.id, item.name)}>
              <View style={styles.menuOption}>
                <Ionicons name="trash-outline" size={16} color="#000" />
                <Text style={[styles.menuText, styles.deleteText]}>Delete</Text>
              </View>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
    </TouchableOpacity>
  );

  const renderStatistics = () => (
    <View style={styles.statisticsContainer}>
      <Text style={styles.statisticsTitle}>Category Overview</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="grid-outline" size={20} color="#000" />
          </View>
          <Text style={styles.statNumber}>{statistics.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
          </View>
          <Text style={styles.statNumber}>{statistics.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="pause-circle-outline" size={20} color="#666" />
          </View>
          <Text style={[styles.statNumber, { color: '#666' }]}>
            {statistics.inactive}
          </Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContent}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="folder-open-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Categories Found</Text>
      <Text style={styles.emptySubtext}>
        Create your first category to get started with managing your services
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddCategory}>
        <Ionicons name="add-circle-outline" size={20} color="white" />
        <Text style={styles.emptyButtonText}>Create Category</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && categories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomeHeader title="Services" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <CustomeHeader title="Services" />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Categories", "Catalog"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "Categories" ? (
          <>
            {/* Statistics */}
            {/* {categories.length > 0 && renderStatistics()} */}
            
            {/* Categories List */}
            {categories.length > 0 ? (
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCategory}
                contentContainerStyle={{ padding: 16, paddingTop: 8 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#000']}
                    tintColor="#000"
                  />
                }
                showsVerticalScrollIndicator={false}
              />
            ) : (
              renderEmptyState()
            )}
          </>
        ) : (
          <View style={styles.emptyContent}>
            <Text style={{ fontSize: 16, color: "gray" }}>
              Catalog content goes here
            </Text>
          </View>
        )}
      </View>

      {/* Floating Add Button */}
      {activeTab === "Categories" && (
        <TouchableOpacity style={styles.floatingButton} onPress={handleAddCategory}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// Menu styles
const menuStyles = {
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  optionWrapper: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  }
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#fff'
  },
  tab: { 
    flex: 1, 
    alignItems: "center", 
    paddingVertical: 16 
  },
  tabText: { 
    fontSize: 16, 
    color: "#666",
    fontWeight: '500'
  },
  activeTabText: { 
    fontWeight: "bold", 
    color: "black" 
  },
  tabUnderline: {
    marginTop: 8,
    height: 3,
    width: "100%",
    backgroundColor: "black",
    borderRadius: 2,
  },
  
  // Statistics Styles
  statisticsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCard: {
    alignItems: 'center',
    flex: 1
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600'
  },

  // Card Styles
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000'
  },
  inactiveCard: {
    opacity: 0.7,
    backgroundColor: '#f8f8f8',
    borderColor: '#ccc'
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row'
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },

  // Icon Styles
  iconContainer: {
    marginRight: 12,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  placeholderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000'
  },

  // Category Info Styles
  categoryInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  categoryName: { 
    fontSize: 16, 
    fontWeight: "bold",
    marginBottom: 4,
    color: '#000'
  },
  categoryDescription: { 
    fontSize: 13, 
    color: "#666",
    marginBottom: 8,
    lineHeight: 18
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 12
  },
  priceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  priceText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600'
  },

  // Status Styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1
  },
  activeBadge: {
    backgroundColor: '#f8f8f8',
    borderColor: '#000'
  },
  inactiveBadge: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc'
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },

  // Menu Styles
  menuTrigger: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff'
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10
  },
  menuText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500'
  },
  deleteText: {
    color: '#000',
    fontWeight: 'bold'
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
    marginHorizontal: 8
  },

  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#000',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Empty State Styles
  emptyContent: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: '#fff'
  },
  emptyIconContainer: {
    backgroundColor: '#f0f0f0',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default Service;