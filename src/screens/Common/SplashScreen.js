//import liraries
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { rw } from '../../constants/responsive';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const SplashScreen = () => {
  const navigation = useNavigation();

useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          navigation.replace('LoginScreen');
        } else {
          const userType = await AsyncStorage.getItem('user_type');
          if (userType === 'admin') {
            navigation.replace('AdminBottomTabNavigator');
          } else if (userType === 'worker') {
            navigation.replace('WorkerBottomTabNavigator');
          } else {
            navigation.replace('LoginScreen');
          }
        }
      } catch (err) {
        console.log('Error reading async storage:', err);
        navigation.replace('LoginScreen');
      }
    };

    // 3 second delay then check
    const timer = setTimeout(() => {
      checkAuth();
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <>
    <StatusBar backgroundColor="#000" barStyle="dark-content" />
    <View style={styles.container}>
      <Animatable.Image
        animation="zoomIn"    // 👈 ZoomIn animation
        duration={1500}       // 1.5 sec animation duration
        source={require('../../assets/images/Applogo.png')}
        style={{ width: rw(25), height: rw(25), borderRadius: 10 }}
        resizeMode="contain"
      />
    </View>
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});

export default SplashScreen;
