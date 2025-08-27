// BookingDetails.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import CustomeHeader from "../../components/header";

const BookingDetails = ({ navigation }) => {
    
  const booking = {
    user: "Riya",
    provider: "Aarti",
    service: "Blouse Stitching • 1 hr",
    status: "IN PROGRESS",
  };

  const timeline = [
    { id: "1", title: "Accepted", time: "10:10 AM" },
    { id: "2", title: "Reached Location", time: "10:40 AM" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomeHeader title="Booking Details" />

      <View style={{paddingHorizontal:15}}>
      {/* Booking Info */}
      <View style={styles.bookingCard}>
        <Text style={styles.infoText}>
          <Text style={styles.bold}>User:</Text> {booking.user} •{" "}
          <Text style={styles.bold}>Provider:</Text> {booking.provider}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.bold}>Service:</Text> {booking.service}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.bold}>Status:</Text> {booking.status}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Mark Done</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Reassign</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline */}
      <Text style={styles.timelineTitle}>Timeline</Text>
      <FlatList
        data={timeline}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.timelineCard}>
            <View style={styles.circle} />
            <View>
              <Text style={styles.bold}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
      />
      </View>

    </View>
  );
};

export default BookingDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bookingCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: "center",
  },
  actionText: {
    fontWeight: "600",
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  timelineCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 10,
  },
  time: {
    fontSize: 12,
    color: "#555",
  },
});
