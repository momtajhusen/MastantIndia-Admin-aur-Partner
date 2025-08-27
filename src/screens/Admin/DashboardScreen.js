//import liraries
import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import CustomeHeader from "../../components/header";

const screenWidth = Dimensions.get("window").width;

const DashboardScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <CustomeHeader title="Mastant India" />

      {/* Stats Cards */}
      <View style={styles.statsWrapper}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Users</Text>
          <Text style={styles.cardValue}>12,340</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Bookings</Text>
          <Text style={styles.cardValue}>320</Text>
        </View>
      </View>

      <View style={styles.statsWrapper}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Revenue (M)</Text>
          <Text style={styles.cardValue}>12.4L</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pending Approvals</Text>
          <Text style={styles.cardValue}>18</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Bookings Trend</Text>
        <LineChart
          data={{
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [{ data: [20, 45, 28, 80, 99, 43] }],
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
    padding:10
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
