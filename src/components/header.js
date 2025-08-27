import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const CustomeHeader = ({ title }) => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderColor: "#ccc",
      }}
    >
      {/* Profile + Title */}
      {/* <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}> */}
        {/* Profile Image */}
        <TouchableOpacity onPress={() => navigation.navigate('AdminProfile')}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=47" }}
            style={{ width: 34, height: 34, borderRadius: 17 }}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "black" }}>
          {title}
        </Text>
      {/* </View> */}

      {/* Notification Button */}
      <TouchableOpacity onPress={() => navigation.navigate('NotificationHistory')}>
        <Ionicons name="notifications-outline" size={26} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default CustomeHeader;
