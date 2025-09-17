//import liraries
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import CustomeHeader from "../../components/header";
import { getDashboardStats } from "../../../services/admin";

const screenWidth = Dimensions.get("window").width;

const DashboardScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      if (response?.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomeHeader title="Mastant India" />
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  const userStats = stats?.statistics?.user_statistics || {};
  const businessStats = stats?.statistics?.business_statistics || {};
  const operationalStats = stats?.statistics?.operational_statistics || {};
  const summary = stats?.summary || {};

  return (
    <SafeAreaView style={styles.container}>
      <CustomeHeader title="Mastant India" />

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Row 1 */}
        <View style={styles.statsWrapper}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Users</Text>
            <Text style={styles.cardValue}>{userStats.total_users}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Bookings</Text>
            <Text style={styles.cardValue}>{businessStats.total_bookings}</Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.statsWrapper}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Revenue Today</Text>
            <Text style={styles.cardValue}>₹{summary.revenue_today}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>New Signups</Text>
            <Text style={styles.cardValue}>{summary.new_signups_today}</Text>
          </View>
        </View>

        {/* Row 3 */}
        <View style={styles.statsWrapper}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Active Workers</Text>
            <Text style={styles.cardValue}>{userStats.active_workers}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Completed Bookings</Text>
            <Text style={styles.cardValue}>{businessStats.completed_bookings}</Text>
          </View>
        </View>

        {/* Row 4 */}
        <View style={styles.statsWrapper}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pending KYC</Text>
            <Text style={styles.cardValue}>{operationalStats.pending_kyc}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pending Withdrawals</Text>
            <Text style={styles.cardValue}>{operationalStats.pending_withdrawals}</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Bookings Trend</Text>
          <LineChart
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
              datasets: [{ data: [20, 45, 28, 80, 99, 43] }], // TODO: Replace with API trend if available
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 12 },
            }}
            bezier
            style={{ borderRadius: 12, marginTop: 10 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  statsWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    color: "#555",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    color: "#000",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: "#000",
  },
});

//make this component available to the app
export default DashboardScreen;
