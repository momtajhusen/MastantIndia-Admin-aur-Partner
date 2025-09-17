import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const LoadingOverlay = ({ visible, text = "Processing..." }) => {
  if (!visible) return null;

  return (
    <View style={styles.actionLoadingOverlay}>
      <View style={styles.actionLoadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.actionLoadingText}>{text}</Text>
      </View>
    </View>
  );
};

const LoadingFooter = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.loadingFooter}>
      <ActivityIndicator size="small" color="#000" />
      <Text style={styles.loadingFooterText}>Loading more...</Text>
    </View>
  );
};

const LoadingScreen = ({ text = "Loading bookings..." }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  actionLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLoadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  loadingFooter: {
    padding: 15,
    alignItems: 'center',
  },
  loadingFooterText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export { LoadingOverlay, LoadingFooter, LoadingScreen };