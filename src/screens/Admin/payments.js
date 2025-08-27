//import libraries
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import CustomeHeader from '../../components/header';

// create a component
const Payments = () => {
    const [activeTab, setActiveTab] = useState('Customer');

    const payoutData = [
        { id: '1', title: 'Payout to Aarti', amount: '1,250', status: 'Pending' },
        { id: '2', title: 'Payout to Aarti', amount: '1,250', status: 'Pending' },
        { id: '3', title: 'Payout to Aarti', amount: '1,250', status: 'Pending' },
    ];

    const reportData = [
        { id: '1', title: 'INV-2100', amount: '799', status: 'UPI • Success' },
        { id: '2', title: 'INV-2101', amount: '799', status: 'UPI • Success' },
        { id: '3', title: 'INV-2102', amount: '799', status: 'UPI • Success' },
    ];

    const renderPayoutItem = ({ item }) => (
        <View style={styles.paymentCard}>
            <View style={styles.circle} />
            <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>{item.title}</Text>
                <Text style={styles.paymentDetails}>
                    <Text style={styles.bold}>₹ {item.amount}</Text> • {item.status}
                </Text>
            </View>
            <TouchableOpacity style={styles.approveBtn}>
                <Text style={styles.approveBtnText}>APPROVE</Text>
            </TouchableOpacity>
        </View>
    );

    const renderReportItem = ({ item }) => (
        <View style={styles.paymentCard}>
            <View style={styles.circle} />
            <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>{item.title}</Text>
                <Text style={styles.paymentDetails}>
                    <Text style={styles.bold}>₹ {item.amount}</Text> • {item.status}
                </Text>
            </View>
            <TouchableOpacity style={styles.invoiceBtn}>
                <Text style={styles.invoiceBtnText}>INVOICE</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <CustomeHeader title="Payments" />

            <View style={styles.content}>
                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'Customer' && styles.activeTab]}
                        onPress={() => setActiveTab('Customer')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Customer' && styles.activeTabText]}>
                            Customer
                        </Text>
                        {activeTab === 'Customer' && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'Payouts' && styles.activeTab]}
                        onPress={() => setActiveTab('Payouts')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Payouts' && styles.activeTabText]}>
                            Payouts
                        </Text>
                        {activeTab === 'Payouts' && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'Reports' && styles.activeTab]}
                        onPress={() => setActiveTab('Reports')}
                    >
                        <Text style={[styles.tabText, activeTab === 'Reports' && styles.activeTabText]}>
                            Reports
                        </Text>
                        {activeTab === 'Reports' && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                </View>

                {/* Payment List */}
                <ScrollView style={styles.listContainer}>
                    {activeTab === 'Payouts' ? (
                        <FlatList
                            data={payoutData}
                            keyExtractor={(item) => item.id}
                            renderItem={renderPayoutItem}
                            scrollEnabled={false}
                        />
                    ) : activeTab === 'Reports' ? (
                        <FlatList
                            data={reportData}
                            keyExtractor={(item) => item.id}
                            renderItem={renderReportItem}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Customer data will be shown here</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Action Buttons */}
                {activeTab === 'Payouts' ? (
                    <View style={styles.bottomActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Text style={styles.actionBtnText}>Approve Selected</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Text style={styles.actionBtnText}>Hold</Text>
                        </TouchableOpacity>
                    </View>
                ) : activeTab === 'Reports' ? (
                    <View style={styles.bottomActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Text style={styles.actionBtnText}>Refund</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Text style={styles.actionBtnText}>Export</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Text style={styles.actionBtnText}>Download</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 15,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        position: 'relative',
    },
    activeTab: {
        // Active tab styling handled by activeIndicator
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '600',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: '#000',
    },
    listContainer: {
        flex: 1,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
    },
    circle: {
        width: 44,
        height: 44,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#333',
        marginRight: 15,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    paymentDetails: {
        fontSize: 14,
        color: '#666',
    },
    bold: {
        fontWeight: 'bold',
        color: '#000',
    },
    approveBtn: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    approveBtnText: {
        fontSize: 12,
        fontWeight: '600',
    },
    invoiceBtn: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    invoiceBtnText: {
        fontSize: 12,
        fontWeight: '600',
    },
    bottomActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        marginTop: 'auto',
    },
    actionBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        paddingVertical: 12,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});

//make this component available to the app
export default Payments;