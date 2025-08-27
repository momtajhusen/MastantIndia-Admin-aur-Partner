// ProviderDetails.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import CustomeHeader from "../../components/header";

const ProviderDetails = () => {
  const documents = [
    { id: "1", title: "ID Proof", file: "Aadhar.jpg", action: "Verify" },
    { id: "2", title: "Portfolio", file: "stitches.pdf", action: "View" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <CustomeHeader title="Provider Details" />

      <ScrollView contentContainerStyle={{ padding: 15 }}>
        {/* Provider Card */}
        <View style={styles.providerCard}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Aarti Tailor</Text>
            <Text style={styles.subText}>Rating 4.7 • 320 jobs</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#e8f5e9" }]}>
            <Text style={[styles.actionText, { color: "#2e7d32" }]}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#fff3e0" }]}>
            <Text style={[styles.actionText, { color: "#ef6c00" }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#ffebee" }]}>
            <Text style={[styles.actionText, { color: "#c62828" }]}>Block</Text>
          </TouchableOpacity>
        </View>

        {/* Documents */}
        <Text style={styles.sectionTitle}>Documents</Text>
        {documents.map((doc) => (
          <View key={doc.id} style={styles.docCard}>
            <View style={styles.avatarSmall} />
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>{doc.title}</Text>
              <Text style={styles.subText}>{doc.file}</Text>
            </View>
            <TouchableOpacity style={styles.statusBtn}>
              <Text style={styles.statusText}>{doc.action}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  docCard: {
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
  avatarSmall: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#ddd",
    marginRight: 15,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
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
});

export default ProviderDetails;
