import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const AdminProfile = ({ navigation }) => {
  const menuItems = [
    { id: "1", title: "Payments", icon: "card-outline" },
    { id: "2", title: "Rating & Reviews", icon: "star-outline" },
    { id: "3", title: "Notification", icon: "notifications-outline" },
    { id: "4", title: "Roles & Permissions", icon: "people-outline" },
    { id: "5", title: "Location Setup", icon: "location-outline" },
    { id: "6", title: "Settings", icon: "settings-outline" },
    { id: "7", title: "Logout", icon: "log-out-outline" },
  ];

  const handlePress = (item) => {
    if (item.title === "Logout") {
      navigation.replace("LoginScreen");
    } 
    if (item.title === "Payments") {
      navigation.navigate("Payments");
    } 
    if (item.title === "Rating & Reviews") {
      navigation.navigate("RatingsReviews");
    } 
    if (item.title === "Notification") {
      navigation.navigate("SendNotification");
    } 
    if (item.title === "Roles & Permissions") {
      navigation.navigate("RolesPermissions");
    } 
    if (item.title === "Location Setup") {
      navigation.navigate("LocationSetup");
    } 
    if (item.title === "Settings") {
      navigation.navigate("Settings");
    } 
    else {
      console.log("Navigate to:", item.title);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=47" }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>Admin Name</Text>
        <Text style={styles.email}>xxxxxxx@gmail.com</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Menu List */}
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.menuRow} onPress={() => handlePress(item)}>
            <View style={styles.row}>
              <Icon name={item.icon} size={22} style={styles.icon} />
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Icon name="chevron-forward-outline" size={20} color="#666" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default AdminProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  email: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  editButton: {
    borderWidth:1,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editButtonText: {
    color: "black",
    fontWeight: "600",
    fontSize: 14,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
    color: "#333",
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
});
