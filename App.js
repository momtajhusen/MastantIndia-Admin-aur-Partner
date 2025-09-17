import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AdminStackNavigation from './src/navigation/AdminStackNavigation';
import { MenuProvider } from 'react-native-popup-menu';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AlertProvider } from './src/components/AlertProvider';

const App = () => {
  return (
    <SafeAreaProvider>
      {/* ✅ Global StatusBar */}
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

    <AlertProvider>
      <MenuProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <NavigationContainer>
            <AdminStackNavigation />
          </NavigationContainer>
        </SafeAreaView>
       </MenuProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
};

export default App;
