// Service.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import CustomeHeader from "../../components/header";

const Service = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("Categories");
  const [categories, setCategories] = useState([
    { id: "1", name: "Salon", enabled: true },
    { id: "2", name: "Plumbing", enabled: false },
    { id: "3", name: "Tailoring", enabled: true },
    { id: "4", name: "AC Repair", enabled: false },
  ]);

  const toggleCategory = (id) => {
    setCategories((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ServiceDetails")}
      activeOpacity={0.7}
    >
      {/* Circle Placeholder */}
      <View style={styles.circle} />

      {/* Text Content */}
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtext}>Tap to view/edit</Text>
      </View>

      {/* ON/OFF Button */}
      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() => toggleCategory(item.id)}
      >
        <Text style={styles.toggleBtnText}>
          {item.enabled ? "OFF" : "ON"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={renderCategory}
            contentContainerStyle={{ padding: 16 }}
          />
        ) : (
          <View style={styles.emptyContent}>
            <Text style={{ fontSize: 16, color: "gray" }}>
              Catalog content goes here
            </Text>
          </View>
        )}
      </View>

      {/* Add Category Button */}
      {activeTab === "Categories" && (
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal:10
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabText: { fontSize: 16, color: "gray" },
  activeTabText: { fontWeight: "bold", color: "black" },
  tabUnderline: {
    marginTop: 15,
    height: 2,
    width: "100%",
    backgroundColor: "black",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardSubtext: { fontSize: 14, color: "gray" },
  toggleBtn: {
    borderWidth: 1,
    borderColor: "black",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  toggleBtnText: { fontSize: 14, fontWeight: "bold", color: "black" },
  addButton: {
    margin: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { fontSize: 16, fontWeight: "bold" },
  emptyContent: { flex: 1, alignItems: "center", justifyContent: "center" },
});

export default Service;
