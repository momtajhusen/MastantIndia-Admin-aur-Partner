// ===================================
// Worker Wallet Screen - Black & White Theme with Dummy Data
// ===================================

import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions 
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";
import CustomeHeader from "../../components/header";

const screenWidth = Dimensions.get("window").width;

const WorkerWalletScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Dummy wallet data
  const walletData = {
    current_balance: 45750,
    total_earnings: 187500,
    this_month_earnings: 28500,
    last_month_earnings: 32200,
    pending_amount: 5500,
    transactions: [
      {
        id: 1,
        type: 'credit',
        amount: 2500,
        description: 'Job completed - Electrical Installation',
        client: 'ABC Manufacturing',
        date: '2024-01-15',
        status: 'completed'
      },
      {
        id: 2,
        type: 'credit',
        amount: 1800,
        description: 'Job completed - Plumbing Service',
        client: 'XYZ Industries',
        date: '2024-01-14',
        status: 'completed'
      },
      {
        id: 3,
        type: 'debit',
        amount: 500,
        description: 'Withdrawal to Bank Account',
        date: '2024-01-12',
        status: 'completed'
      },
      {
        id: 4,
        type: 'credit',
        amount: 3200,
        description: 'Job completed - Mechanical Repair',
        client: 'PQR Factory',
        date: '2024-01-10',
        status: 'completed'
      },
      {
        id: 5,
        type: 'pending',
        amount: 2200,
        description: 'Job completed - Equipment Installation',
        client: 'DEF Company',
        date: '2024-01-08',
        status: 'pending'
      }
    ],
    monthly_earnings: [
      { month: 'Jul', earnings: 22000 },
      { month: 'Aug', earnings: 28500 },
      { month: 'Sep', earnings: 31200 },
      { month: 'Oct', earnings: 26800 },
      { month: 'Nov', earnings: 32200 },
      { month: 'Dec', earnings: 28500 }
    ],
    bank_details: {
      account_holder: 'Rajesh Kumar',
      account_number: '****1234',
      ifsc_code: 'ICIC0001234',
      bank_name: 'ICICI Bank'
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw Money',
      `Available balance: ₹${walletData.current_balance.toLocaleString('en-IN')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed', 
          onPress: () => {
            // Navigate to withdrawal screen or show withdrawal form
            Alert.alert('Success', 'Withdrawal request submitted successfully');
          }
        }
      ]
    );
  };

  const handleTransactionDetails = (transaction) => {
    Alert.alert(
      'Transaction Details',
      `Amount: ₹${transaction.amount}\nDate: ${transaction.date}\nStatus: ${transaction.status}\n${transaction.description}`,
      [{ text: 'OK' }]
    );
  };

  // Chart configuration
  const chartData = {
    labels: walletData.monthly_earnings.map(item => item.month),
    datasets: [{
      data: walletData.monthly_earnings.map(item => item.earnings),
      strokeWidth: 2,
    }]
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#000000"
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomeHeader title="Wallet" navigation={navigation} showBackButton />
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{walletData.current_balance.toLocaleString('en-IN')}</Text>
          
          <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
            <Ionicons name="arrow-up-outline" size={20} color="#ffffff" />
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={24} color="#000000" />
            <Text style={styles.statValue}>₹{walletData.total_earnings.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color="#333333" />
            <Text style={styles.statValue}>₹{walletData.this_month_earnings.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color="#666666" />
            <Text style={styles.statValue}>₹{walletData.pending_amount.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Monthly Earnings Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Monthly Earnings (₹)</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Bank Details Card */}
        <View style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <Text style={styles.sectionTitle}>Bank Account</Text>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.bankDetails}>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>Account Holder</Text>
              <Text style={styles.bankDetailValue}>{walletData.bank_details.account_holder}</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>Account Number</Text>
              <Text style={styles.bankDetailValue}>{walletData.bank_details.account_number}</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>IFSC Code</Text>
              <Text style={styles.bankDetailValue}>{walletData.bank_details.ifsc_code}</Text>
            </View>
            <View style={styles.bankDetailRow}>
              <Text style={styles.bankDetailLabel}>Bank Name</Text>
              <Text style={styles.bankDetailValue}>{walletData.bank_details.bank_name}</Text>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionContainer}>
          <View style={styles.transactionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {walletData.transactions.map((transaction) => (
            <TouchableOpacity 
              key={transaction.id} 
              style={styles.transactionItem}
              onPress={() => handleTransactionDetails(transaction)}
            >
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, {
                  backgroundColor: transaction.type === 'credit' ? '#000000' : 
                                  transaction.type === 'pending' ? '#666666' : '#999999'
                }]}>
                  <Ionicons 
                    name={transaction.type === 'credit' ? 'arrow-down' : 
                          transaction.type === 'pending' ? 'time' : 'arrow-up'} 
                    size={16} 
                    color="#ffffff" 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription} numberOfLines={1}>
                    {transaction.description}
                  </Text>
                  {transaction.client && (
                    <Text style={styles.transactionClient}>{transaction.client}</Text>
                  )}
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
              </View>
              
              <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, {
                  color: transaction.type === 'credit' ? '#000000' : 
                         transaction.type === 'pending' ? '#666666' : '#999999'
                }]}>
                  {transaction.type === 'debit' ? '-' : '+'}₹{transaction.amount.toLocaleString('en-IN')}
                </Text>
                <View style={[styles.statusBadge, {
                  backgroundColor: transaction.status === 'completed' ? '#000000' : '#666666'
                }]}>
                  <Text style={styles.statusText}>{transaction.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
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
  balanceCard: {
    backgroundColor: "#000000",
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: "#ffffff",
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: "#ffffff",
    marginVertical: 10,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
  },
  withdrawButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
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
    fontSize: 16,
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
  chartContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  bankCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  bankDetails: {
    gap: 12,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankDetailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  bankDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  transactionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  transactionClient: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
});

export default WorkerWalletScreen;