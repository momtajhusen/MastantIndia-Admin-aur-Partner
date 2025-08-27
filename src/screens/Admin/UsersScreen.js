// UsersScreen.js
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

const dummyCustomers = [
  { id: "1", name: "Customer 1", orders: 12, city: "BLR", status: "ACTIVE" },
  { id: "2", name: "Customer 2", orders: 8, city: "DEL", status: "ACTIVE" },
  { id: "3", name: "Customer 3", orders: 15, city: "MUM", status: "ACTIVE" },
];

const dummyProviders = [
  { id: "1", name: "Provider 1", rating: 4.6, jobs: 210, status: "PENDING" },
  { id: "2", name: "Provider 2", rating: 4.6, jobs: 210, status: "PENDING" },
  { id: "3", name: "Provider 3", rating: 4.6, jobs: 210, status: "PENDING" },
];

const UsersScreen = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState("Customers");
  const [selectedProviders, setSelectedProviders] = useState([]);

  // Customer Card
  const renderCustomerCard = ({ item }) => (
    <TouchableOpacity onPress={()=>navigation.navigate('ProviderDetails')} style={styles.card}>
      <View style={styles.avatar} />
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

  // Provider Card (same avatar style as Customers)
  const renderProviderCard = ({ item }) => {
    const isSelected = selectedProviders.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && { borderColor: "#000", borderWidth: 2 }]}
        onPress={() => {
          if (isSelected) {
            setSelectedProviders(selectedProviders.filter((id) => id !== item.id));
          } else {
            setSelectedProviders([...selectedProviders, item.id]);
          }
        }}
      >
        {/* Avatar same as Customers */}
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subText}>
            rating: {item.rating} • jobs: {item.jobs}
          </Text>
        </View>
        <View style={styles.statusBtn}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

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

      {/* User List */}
      {selectedTab === "Customers" ? (
        <FlatList
          data={dummyCustomers}
          keyExtractor={(item) => item.id}
          renderItem={renderCustomerCard}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      ) : (
        <>
          <FlatList
            data={dummyProviders}
            keyExtractor={(item) => item.id}
            renderItem={renderProviderCard}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
          {/* Action Buttons */}
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionText}>Approve Selected</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionText}>Block</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
    paddingHorizontal:10
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: "#555",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#000",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    marginRight: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  subText: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  statusBtn: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  footerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal:10
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
});

export default UsersScreen;
