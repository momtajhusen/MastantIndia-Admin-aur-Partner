// 1. Updated Bottom Tab Navigator
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { rh, rf } from '../constants/responsive';

// Import all screens
import WorkerDashboardScreen from '../screens/Partner/WorkerDashboardScreen';
import WorkerTrainingScreen from '../screens/Partner/WorkerTrainingScreen';
import WorkerBookingsScreen from '../screens/Partner/WorkerBookingsScreen';
import WorkerProfileScreen from '../screens/Partner/WorkerProfileScreen';
import WorkerWalletScreen from '../screens/Partner/WorkerWalletScreen';

const Tab = createBottomTabNavigator();

const WorkerBottomTabNavigator = () => {
  return (
    <Tab.Navigator
      lazy={true}
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#6200ea", 
        tabBarInactiveTintColor: "#757575",  
        tabBarStyle: {
          backgroundColor: "white",
          height: rh(10),
          paddingTop: rh(1),
          borderTopWidth: 0,
          paddingBottom: rh(1),
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
      }}
    >
      {/* Dashboard */}
      <Tab.Screen
        name="Dashboard"
        component={WorkerDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />
 
      {/* Bookings */}
      <Tab.Screen
        name="Bookings"
        component={WorkerBookingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />

      {/* Training */}
      {/* <Tab.Screen
        name="Training"
        component={WorkerTrainingScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="school-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      /> */}

      {/* Wallet */}
      {/* <Tab.Screen
        name="Wallet"
        component={WorkerWalletScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      /> */}

      {/* Profile */}
      <Tab.Screen
        name="Profile"
        component={WorkerProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={rf(3.5)} color={color} />
          ),
          tabBarButton: (props) => <Pressable {...props} android_ripple={null} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default WorkerBottomTabNavigator;