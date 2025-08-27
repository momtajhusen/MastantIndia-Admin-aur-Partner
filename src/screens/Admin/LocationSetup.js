//import libraries
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import CustomeHeader from '../../components/header';

// create a component
const LocationSetup = () => {
    const [city, setCity] = useState('');
    const [area, setArea] = useState('');
    const [coordinates, setCoordinates] = useState({
        latitude: 28.6139, // Default to Delhi
        longitude: 77.2090,
    });
    const [mapUrl, setMapUrl] = useState('');

    // Function to search for location
    const searchLocation = async () => {
        if (!city.trim()) {
            Alert.alert('Error', 'Please enter a city name');
            return;
        }

        try {
            const searchQuery = area.trim() 
                ? `${area}, ${city}, India` 
                : `${city}, India`;
            
            // Using OpenStreetMap Nominatim API for geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newCoordinates = {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon),
                };
                
                setCoordinates(newCoordinates);
                
                // Create OpenStreetMap URL
                const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${parseFloat(lon)+0.01},${parseFloat(lat)+0.01}&layer=mapnik&marker=${lat},${lon}`;
                setMapUrl(url);
                
                Alert.alert('Success', 'Location found and added to map!');
            } else {
                Alert.alert('Error', 'Location not found. Please check spelling.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            Alert.alert('Error', 'Failed to search location. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <CustomeHeader title="Location Setup" />

            <View style={styles.content}>
                {/* City Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter city name"
                        value={city}
                        onChangeText={setCity}
                    />
                </View>

                {/* Area/Locality Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Area/Locality</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter area or locality"
                        value={area}
                        onChangeText={setArea}
                    />
                </View>

                {/* Add Button */}
                <TouchableOpacity style={styles.addButton} onPress={searchLocation}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>

                {/* Map Container */}
                <View style={styles.mapContainer}>
                    <Text style={styles.mapLabel}>Map View</Text>
                    {mapUrl ? (
                        <WebView
                            source={{ uri: mapUrl }}
                            style={styles.webMap}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                        />
                    ) : (
                        <View style={styles.placeholderMap}>
                            <Text style={styles.placeholderText}>
                                Enter city name and press Add to view map
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 20,
    },
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    addButton: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        paddingHorizontal: 30,
        paddingVertical: 12,
        marginBottom: 20,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    coordinatesContainer: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    coordinatesText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    mapContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 15,
        backgroundColor: '#fff',
        minHeight: 300,
    },
    mapLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    webMap: {
        flex: 1,
        borderRadius: 4,
    },
    placeholderMap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 4,
    },
    placeholderText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});

//make this component available to the app
export default LocationSetup;