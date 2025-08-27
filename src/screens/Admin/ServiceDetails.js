// ServiceDetails.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomeHeader from "../../components/header";

const ServiceDetails = () => {
  const [activeTab, setActiveTab] = useState("Pricing");
  const [basePrice, setBasePrice] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [city, setCity] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <CustomeHeader title="Service Details"/>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Info", "Pricing", "Add-ons"].map((tab) => (
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
            {activeTab === tab && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Pricing Form */}
      {activeTab === "Pricing" && (
        <View style={styles.form}>
          <Text style={styles.label}>Base Price</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter base price"
            keyboardType="numeric"
            value={basePrice}
            onChangeText={setBasePrice}
          />

          <Text style={styles.label}>Hourly Rate</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter hourly rate"
            keyboardType="numeric"
            value={hourlyRate}
            onChangeText={setHourlyRate}
          />

          <Text style={styles.label}>City Availability</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter available cities"
            value={city}
            onChangeText={setCity}
          />

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.outlineBtn}>
              <Text style={styles.outlineText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn}>
              <Text style={styles.outlineText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabText: { fontSize: 15, color: "#555" },
  activeTabText: { fontWeight: "bold", color: "#000" },
  activeIndicator: {
    marginTop: 5,
    height: 2,
    width: "60%",
    backgroundColor: "#000",
    borderRadius: 2,
  },
  form: { padding: 15 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 12,
    height: 48, // 👈 height badhaya
    marginBottom: 18,
    fontSize: 15,
    color: "#000",
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  outlineBtn: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  outlineText: { fontSize: 15, fontWeight: "600", color: "#000" },
});

export default ServiceDetails;
