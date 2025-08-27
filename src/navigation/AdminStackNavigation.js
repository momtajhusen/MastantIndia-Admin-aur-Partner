//import liraries
import React, { useContext } from 'react';
import SplashScreen from '../screens/SplashScreen';
import AdminBottomTabNavigator from './AdminBottomTabNavigator';
import LoginScreen from '../screens/Admin/LoginScreen';
import ProviderDetails from '../screens/Admin/ProviderDetails';
import ServiceDetails from '../screens/Admin/ServiceDetails';
import BookingDetails from '../screens/Admin/BookingDetails';
import AdminProfile from '../screens/Admin/AdminProfile';
import Payments from '../screens/Admin/payments';
import RatingsReviews from '../screens/Admin/RatingsReviews';
import Notification from '../screens/Admin/Notification';
import RolesPermissions from '../screens/Admin/RolesPermissions';
import LocationSetup from '../screens/Admin/LocationSetup';
import Settings from '../screens/Admin/Settings';

import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
const Stack = createSharedElementStackNavigator();

// create a component
const AdminStackNavigation = () => {

    return (
        <Stack.Navigator>
        {/* Auth navigation  */}
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="AdminBottomTabNavigator" component={AdminBottomTabNavigator} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="ProviderDetails" component={ProviderDetails} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="ServiceDetails" component={ServiceDetails} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="BookingDetails" component={BookingDetails} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="AdminProfile" component={AdminProfile} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="Payments" component={Payments} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="RatingsReviews" component={RatingsReviews} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="Notification" component={Notification} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="RolesPermissions" component={RolesPermissions} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="LocationSetup" component={LocationSetup} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false, animation: 'fade' }} />











     </Stack.Navigator>
    );
};

//make this component available to the app
export default AdminStackNavigation;
