// UsersScreen.js
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
import CustomeHeader from "../../components/header";
import { 
  getAdminWorkers, 
  updateWorkerStatus,
  deleteWorker
} from "../../../services/workers";
import { useAlert, ALERT_TYPES } from '../../components/AlertProvider';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

const dummyCustomers = [
  { id: "1", name: "Customer 1", orders: 12, city: "BLR", status: "ACTIVE" },
  { id: "2", name: "Customer 2", orders: 8, city: "DEL", status: "ACTIVE" },
  { id: "3", name: "Customer 3", orders: 15, city: "MUM", status: "ACTIVE" },
];

const UsersScreen = () => {
  const { showAlert } = useAlert();
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState("Customers");
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    total_workers: 0,
    active_workers: 0,
    completed_training: 0,
    average_rating: 0
  });

  useEffect(() => {
    if (selectedTab === "Providers") {
      fetchWorkers();
    }
  }, [selectedTab]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await getAdminWorkers();
      const responseData = response.data;
      
      if (responseData && responseData.success) {
        setWorkers(responseData.data.workers.data || []);
        setStatistics(responseData.data.statistics || {
          total_workers: 0,
          active_workers: 0,
          completed_training: 0,
          average_rating: 0
        });
      } else {
        showAlert({
          type: ALERT_TYPES.ERROR,
          title: 'Error',
          message: responseData?.message || 'Failed to fetch workers'
        });
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
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
    if (selectedTab === "Providers") {
      setRefreshing(true);
      await fetchWorkers();
      setRefreshing(false);
    }
  };

  const handleUpdateWorkerStatus = async (workerId, workerName, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    
    showAlert({
      type: ALERT_TYPES.CONFIRM,
      title: "Confirm Action",
      message: `Are you sure you want to ${action} ${workerName}?`,
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
              const response = await updateWorkerStatus(workerId, !currentStatus);
              const responseData = response.data;
              
              if (responseData && responseData.success) {
                // Update local state
                setWorkers(prev => 
                  prev.map(worker => 
                    worker.id === workerId 
                      ? { ...worker, worker: { ...worker.worker, is_active: !currentStatus } }
                      : worker
                  )
                );
                
                // Update statistics
                setStatistics(prev => ({
                  ...prev,
                  active_workers: currentStatus ? prev.active_workers - 1 : prev.active_workers + 1
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
                  message: responseData?.message || 'Failed to update worker status'
                });
              }
            } catch (error) {
              console.error('Error updating worker status:', error);
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

  const handleDeleteWorker = async (workerId, workerName) => {
    showAlert({
      type: ALERT_TYPES.CONFIRM,
      title: "Delete Worker",
      message: `Are you sure you want to delete ${workerName}? This action cannot be undone.`,
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
              const response = await deleteWorker(workerId);
              const responseData = response.data;
              
              if (responseData && responseData.success) {
                // Remove from local state
                setWorkers(prev => prev.filter(worker => worker.id !== workerId));
                
                // Update statistics
                const deletedWorker = workers.find(w => w.id === workerId);
                if (deletedWorker) {
                  setStatistics(prev => ({
                    total_workers: prev.total_workers - 1,
                    active_workers: deletedWorker.worker.is_active ? prev.active_workers - 1 : prev.active_workers,
                    completed_training: deletedWorker.training_status === 'completed' ? prev.completed_training - 1 : prev.completed_training,
                    average_rating: prev.average_rating
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
                  message: responseData?.message || 'Failed to delete worker'
                });
              }
            } catch (error) {
              console.error('Error deleting worker:', error);
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

  const handleWorkerDetails = (worker) => {
    navigation.navigate('WorkerDetails', { worker });
  };

  const handleAddWorker = () => {
    navigation.navigate('AddWorkerScreen', { isEditing: false });
  };

  const handleEditWorker = (worker) => {
    navigation.navigate('AddWorkerScreen', { worker, isEditing: true });
  };

  const handleApproveSelected = () => {
    if (selectedProviders.length === 0) {
      showAlert({
        type: ALERT_TYPES.WARNING,
        title: 'No Selection',
        message: 'Please select workers to approve.'
      });
      return;
    }

    showAlert({
      type: ALERT_TYPES.CONFIRM,
      title: 'Approve Workers',
      message: `Are you sure you want to approve ${selectedProviders.length} selected worker(s)?`,
      dismissible: false,
      actions: [
        {
          text: "Cancel",
          style: 'default',
        },
        {
          text: "Approve",
          style: 'primary',
          onPress: () => {
            // Implement batch approval logic here
            setSelectedProviders([]);
            showAlert({
              type: ALERT_TYPES.SUCCESS,
              title: 'Success',
              message: `${selectedProviders.length} worker(s) approved successfully`,
              duration: 3000
            });
          }
        }
      ]
    });
  };

  const handleBlockSelected = () => {
    if (selectedProviders.length === 0) {
      showAlert({
        type: ALERT_TYPES.WARNING,
        title: 'No Selection',
        message: 'Please select workers to block.'
      });
      return;
    }

    showAlert({
      type: ALERT_TYPES.CONFIRM,
      title: 'Block Workers',
      message: `Are you sure you want to block ${selectedProviders.length} selected worker(s)?`,
      dismissible: false,
      actions: [
        {
          text: "Cancel",
          style: 'default',
        },
        {
          text: "Block",
          style: 'danger',
          onPress: () => {
            // Implement batch blocking logic here
            setSelectedProviders([]);
            showAlert({
              type: ALERT_TYPES.SUCCESS,
              title: 'Success',
              message: `${selectedProviders.length} worker(s) blocked successfully`,
              duration: 3000
            });
          }
        }
      ]
    });
  };

  const getTrainingStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#000';
      case 'hired': return '#666';
      case 'pending': return '#999';
      default: return '#ccc';
    }
  };

  const getTrainingStatusText = (status) => {
    switch (status) {
      case 'completed': return 'TRAINED';
      case 'hired': return 'HIRED';
      case 'pending': return 'PENDING';
      default: return 'UNKNOWN';
    }
  };

  // Customer Card
  const renderCustomerCard = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('CustomerDetails')} style={styles.card}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color="#666" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subText}>
          orders: {item.orders} • city: {item.city}
        </Text>
      </View>
      <View style={styles.statusBtn}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  // Provider/Worker Card
  const renderProviderCard = ({ item }) => {
    const isSelected = selectedProviders.includes(item.id);
    const worker = item.worker;
    const category = item.category;

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && { borderColor: "#000", borderWidth: 2 }]}
        onPress={() => handleWorkerDetails(item)}
        activeOpacity={0.7}
      >
        {/* Selection Indicator */}
        <TouchableOpacity
          style={styles.selectionArea}
          onPress={() => {
            if (isSelected) {
              setSelectedProviders(selectedProviders.filter((id) => id !== item.id));
            } else {
              setSelectedProviders([...selectedProviders, item.id]);
            }
          }}
        >
          <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        </TouchableOpacity>

        {/* Avatar */}
        <View style={styles.avatar}>
          {worker.profile_image ? (
            <Image 
              source={{ uri: worker.profile_image }} 
              style={styles.avatarImage} 
            />
          ) : (
            <Ionicons name="person" size={20} color="#666" />
          )}
        </View>

        {/* Worker Info */}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{worker.name}</Text>
          <Text style={styles.subText}>
            {category.name} • {item.experience_years}y exp
          </Text>
          <Text style={styles.subText}>
            Rating: {parseFloat(item.average_rating).toFixed(1)} • {worker.mobile}
          </Text>
        </View>

        {/* Status and Actions */}
        <View style={styles.rightSection}>
          {/* Training Status */}
          <View style={[
            styles.statusBtn, 
            { borderColor: getTrainingStatusColor(item.training_status) }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getTrainingStatusColor(item.training_status) }
            ]}>
              {getTrainingStatusText(item.training_status)}
            </Text>
          </View>

          {/* Menu */}
          <Menu>
            <MenuTrigger>
              <View style={styles.menuTrigger}>
                <Ionicons name="ellipsis-vertical" size={20} color="#000" />
              </View>
            </MenuTrigger>
            <MenuOptions customStyles={menuStyles}>
              <MenuOption onSelect={() => handleWorkerDetails(item)}>
                <View style={styles.menuOption}>
                  <Ionicons name="eye-outline" size={16} color="#000" />
                  <Text style={styles.menuText}>View Details</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => handleEditWorker(item)}>
                <View style={styles.menuOption}>
                  <Ionicons name="pencil-outline" size={16} color="#000" />
                  <Text style={styles.menuText}>Edit Worker</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => handleUpdateWorkerStatus(item.id, worker.name, worker.is_active)}>
                <View style={styles.menuOption}>
                  <Ionicons 
                    name={worker.is_active ? "pause-outline" : "play-outline"} 
                    size={16} 
                    color="#000" 
                  />
                  <Text style={styles.menuText}>
                    {worker.is_active ? 'Deactivate' : 'Activate'}
                  </Text>
                </View>
              </MenuOption>
              <View style={styles.menuDivider} />
              <MenuOption onSelect={() => handleDeleteWorker(item.id, worker.name)}>
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
  };

  const renderStatistics = () => (
    <View style={styles.statisticsContainer}>
      <Text style={styles.statisticsTitle}>Workers Overview</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="people-outline" size={20} color="#000" />
          </View>
          <Text style={styles.statNumber}>{statistics.total_workers}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
          </View>
          <Text style={styles.statNumber}>{statistics.active_workers}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="school-outline" size={20} color="#000" />
          </View>
          <Text style={styles.statNumber}>{statistics.completed_training}</Text>
          <Text style={styles.statLabel}>Trained</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="star-outline" size={20} color="#000" />
          </View>
          <Text style={styles.statNumber}>{statistics.average_rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContent}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="people-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Workers Found</Text>
      <Text style={styles.emptySubtext}>
        No workers are currently registered in the system
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddWorker}>
        <Ionicons name="person-add-outline" size={20} color="white" />
        <Text style={styles.emptyButtonText}>Add First Worker</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && workers.length === 0 && selectedTab === "Providers") {
    return (
      <SafeAreaView style={styles.container}>
        <CustomeHeader title="Users" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading workers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <CustomeHeader title="Users" />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "Customers" && styles.activeTab]}
          onPress={() => setSelectedTab("Customers")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "Customers" && styles.activeTabText,
            ]}
          >
            Customers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "Providers" && styles.activeTab]}
          onPress={() => setSelectedTab("Providers")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "Providers" && styles.activeTabText,
            ]}
          >
            Providers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === "Customers" ? (
        <FlatList
          data={dummyCustomers}
          keyExtractor={(item) => item.id}
          renderItem={renderCustomerCard}
          contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 16 }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Statistics */}
          {/* {workers.length > 0 && renderStatistics()} */}
          
          {/* Workers List */}
          {workers.length > 0 ? (
            <FlatList
              data={workers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderProviderCard}
              contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 16 }}
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
          
          {/* Action Buttons */}
          {workers.length > 0 && (
            <View style={styles.footerActions}>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={handleApproveSelected}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#000" />
                <Text style={styles.actionText}>Approve Selected</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={handleBlockSelected}
              >
                <Ionicons name="ban-outline" size={16} color="#000" />
                <Text style={styles.actionText}>Block Selected</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Floating Add Button for Providers */}
      {selectedTab === "Providers" && (
        <TouchableOpacity style={styles.floatingButton} onPress={handleAddWorker}>
          <Ionicons name="person-add" size={28} color="white" />
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
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff'
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: '500',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#000",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#000",
  },

  // Statistics
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600'
  },

  // Cards
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectionArea: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 2,
  },
  subText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBtn: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    textTransform: 'uppercase',
  },

  // Menu
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

  // Footer Actions
  footerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },

  // Empty State
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32
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
    lineHeight: 20,
    marginBottom: 24
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
});

export default UsersScreen;