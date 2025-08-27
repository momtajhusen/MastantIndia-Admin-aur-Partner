//import libraries
import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Alert,
    RefreshControl,
    TextInput,
    Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomeHeader from '../../components/header';

// create a component
const NotificationHistory = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterType, setFilterType] = useState('all'); // all, read, unread

    // Sample notification data - replace with actual API call
    const sampleNotifications = [
        {
            id: '1',
            title: 'New User Registration',
            message: 'A new user has registered: john.doe@email.com',
            type: 'user',
            priority: 'medium',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            read: false,
            icon: 'person-add'
        },
        {
            id: '2',
            title: 'System Alert',
            message: 'High server load detected. CPU usage at 85%',
            type: 'system',
            priority: 'high',
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            read: true,
            icon: 'warning'
        },
        {
            id: '3',
            title: 'Order Notification',
            message: 'New order placed: Order #12345 - ₹2,500',
            type: 'order',
            priority: 'medium',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            read: false,
            icon: 'bag'
        },
        {
            id: '4',
            title: 'Security Alert',
            message: 'Failed login attempts detected from IP: 192.168.1.100',
            type: 'security',
            priority: 'high',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
            read: true,
            icon: 'shield-checkmark'
        },
        {
            id: '5',
            title: 'Backup Complete',
            message: 'Daily database backup completed successfully',
            type: 'system',
            priority: 'low',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            read: false,
            icon: 'cloud-done'
        },
        {
            id: '6',
            title: 'Payment Received',
            message: 'Payment of ₹5,000 received from customer ID: 789',
            type: 'payment',
            priority: 'medium',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            read: true,
            icon: 'card'
        }
    ];

    useEffect(() => {
        loadNotifications();
    }, []);

    useEffect(() => {
        filterNotifications();
    }, [notifications, searchQuery, filterType]);

    const loadNotifications = () => {
        // Simulate API call
        setTimeout(() => {
            setNotifications(sampleNotifications);
        }, 500);
    };

    const filterNotifications = () => {
        let filtered = notifications;

        // Filter by read/unread
        if (filterType === 'read') {
            filtered = filtered.filter(notif => notif.read);
        } else if (filterType === 'unread') {
            filtered = filtered.filter(notif => !notif.read);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(notif => 
                notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                notif.message.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredNotifications(filtered);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications();
        setTimeout(() => setRefreshing(false), 1000);
    };

    const markAsRead = (id) => {
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        Alert.alert(
            'Mark All as Read',
            'Are you sure you want to mark all notifications as read?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: () => {
                        setNotifications(prev => 
                            prev.map(notif => ({ ...notif, read: true }))
                        );
                    }
                }
            ]
        );
    };

    const deleteNotification = (id) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setNotifications(prev => prev.filter(notif => notif.id !== id));
                        setModalVisible(false);
                    }
                }
            ]
        );
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#000';
            case 'medium': return '#666';
            case 'low': return '#999';
            default: return '#ccc';
        }
    };

    const getTypeColor = (type) => {
        return '#333'; // All types same dark color
    };

    const renderNotificationItem = ({ item }) => (
        <TouchableOpacity 
            style={[styles.notificationItem, !item.read && styles.unreadItem]}
            onPress={() => {
                if (!item.read) markAsRead(item.id);
                setSelectedNotification(item);
                setModalVisible(true);
            }}
        >
            <View style={styles.notificationHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons 
                        name={item.icon} 
                        size={24} 
                        color={getTypeColor(item.type)} 
                    />
                </View>
                <View style={styles.notificationContent}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
                            {item.title}
                        </Text>
                        <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                        {item.message}
                    </Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.timestamp}>
                            {formatTime(item.timestamp)}
                        </Text>
                        <Text style={[styles.typeLabel, { color: getTypeColor(item.type) }]}>
                            {item.type.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>
            {!item.read && <View style={styles.unreadIndicator} />}
        </TouchableOpacity>
    );

    const renderFilterButtons = () => (
        <View style={styles.filterContainer}>
            {['all', 'unread', 'read'].map(filter => (
                <TouchableOpacity
                    key={filter}
                    style={[
                        styles.filterButton,
                        filterType === filter && styles.activeFilterButton
                    ]}
                    onPress={() => setFilterType(filter)}
                >
                    <Text style={[
                        styles.filterButtonText,
                        filterType === filter && styles.activeFilterButtonText
                    ]}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <CustomeHeader title="Notifications" />

            {/* Stats and Actions */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{notifications.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#000' }]}>{unreadCount}</Text>
                    <Text style={styles.statLabel}>Unread</Text>
                </View>
                <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                    <Ionicons name="checkmark-done" size={16} color="#fff" />
                    <Text style={styles.markAllButtonText}>Mark All Read</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search notifications..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#666" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Buttons */}
            {renderFilterButtons()}

            {/* Notifications List */}
            <FlatList
                data={filteredNotifications}
                renderItem={renderNotificationItem}
                keyExtractor={item => item.id}
                style={styles.notificationsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No notifications found</Text>
                    </View>
                }
            />

            {/* Notification Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedNotification && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalIconContainer}>
                                        <Ionicons 
                                            name={selectedNotification.icon} 
                                            size={32} 
                                            color={getTypeColor(selectedNotification.type)} 
                                        />
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.closeButton}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Ionicons name="close" size={24} color="#666" />
                                    </TouchableOpacity>
                                </View>
                                
                                <Text style={styles.modalTitle}>{selectedNotification.title}</Text>
                                <Text style={styles.modalMessage}>{selectedNotification.message}</Text>
                                
                                <View style={styles.modalMeta}>
                                    <Text style={styles.modalTime}>
                                        {selectedNotification.timestamp.toLocaleString()}
                                    </Text>
                                    <View style={styles.modalTags}>
                                        <Text style={[styles.modalTag, { backgroundColor: '#000', color: '#fff' }]}>
                                            {selectedNotification.type.toUpperCase()}
                                        </Text>
                                        <Text style={[styles.modalTag, { backgroundColor: '#666', color: '#fff' }]}>
                                            {selectedNotification.priority.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity 
                                        style={styles.deleteButton}
                                        onPress={() => deleteNotification(selectedNotification.id)}
                                    >
                                        <Ionicons name="trash" size={16} color="#fff" />
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#000',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    statItem: {
        alignItems: 'center',
        marginRight: 30,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: '#ccc',
        marginTop: 2,
    },
    markAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 'auto',
    },
    markAllButtonText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        margin: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    activeFilterButton: {
        backgroundColor: '#000',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeFilterButtonText: {
        color: '#fff',
    },
    notificationsList: {
        flex: 1,
        paddingHorizontal: 15,
    },
    notificationItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        position: 'relative',
    },
    unreadItem: {
        borderLeftWidth: 4,
        borderLeftColor: '#000',
        backgroundColor: '#f8f8f8',
    },
    notificationHeader: {
        flexDirection: 'row',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    unreadText: {
        color: '#000',
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
    },
    typeLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666',
    },
    unreadIndicator: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#000',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
        marginBottom: 20,
    },
    modalMeta: {
        marginBottom: 20,
    },
    modalTime: {
        fontSize: 14,
        color: '#999',
        marginBottom: 12,
    },
    modalTags: {
        flexDirection: 'row',
    },
    modalTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        backgroundColor: '#000',
    },
    modalActions: {
        alignItems: 'center',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
});

//make this component available to the app
export default NotificationHistory;