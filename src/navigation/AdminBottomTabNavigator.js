import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { rh, rf } from '../constants/responsive';

// Dummy screens (replace later with actual screens)
import DashboardScreen from '../screens/Admin/DashboardScreen';
import UsersScreen from '../screens/Admin/UsersScreen';
import Service from '../screens/Admin/Service';
import BookingScreen from '../screens/Admin/BookingScreen';

const Tab = createBottomTabNavigator();

const AdminBottomTabNavigator = () => {
  useEffect(() => {
    // yaha tum fetch kar sakte ho agar zarurat ho
  }, []);

  return (
    <Tab.Navigator
      lazy={true}
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#000000", 
        tabBarInactiveTintColor: "#757575",  
        tabBarStyle: {
          backgroundColor: "white",
          height: rh(10),
          paddingTop: rh(1),
          borderTopWidth: 0,
          paddingBottom: rh(1),
        },
        headerShown: false,
      }}
    >
      {/* Dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />

      {/* Users */}
      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />

      {/* Services */}
      <Tab.Screen
        name="Services"
        component={Service}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="briefcase-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />

      {/* Booking */}
      <Tab.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />

    </Tab.Navigator>
  );
};

export default AdminBottomTabNavigator;
