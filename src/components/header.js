import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CustomeHeader = ({ title }) => {
  const navigation = useNavigation();
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem("user_type");
        if (storedUserType) {
          setUserType(storedUserType);
        }
      } catch (error) {
        console.log("Error reading user_type:", error);
      }
    };
    fetchUserType();
  }, []);

  const handleProfilePress = () => {
    if (userType === "admin") {
      navigation.navigate("AdminProfile");
    } else if (userType === "worker") {
      navigation.navigate("Profile");
    }
  };

  const handleNotificationPress = () => {
    if (userType === "admin") {
      navigation.navigate("NotificationHistory");
    } else if (userType === "worker") {
      console.log("Worker has no notification screen");
      // ya navigation.navigate("WorkerNotification") jab bana lo
    }
  };

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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {/* Profile Image */}
        <TouchableOpacity onPress={handleProfilePress}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=47" }}
            style={{ width: 34, height: 34, borderRadius: 17 }}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "black" }}>
          {title}
        </Text>
      </View>

      {/* Notification Button */}
      <TouchableOpacity
        onPress={handleNotificationPress}
        disabled={userType === "worker"} // disable worker notification
      >
        <Ionicons
          name="notifications-outline"
          size={26}
          color={userType === "worker" ? "#ccc" : "black"} // grey if worker
        />
      </TouchableOpacity>
    </View>
  );
};

export default CustomeHeader;
