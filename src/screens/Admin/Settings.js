//import libraries
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import CustomeHeader from '../../components/header';

// create a component
const Settings = () => {
    const settingsOptions = [
        {
            id: '1',
            title: 'Roles & Permissions',
            description: 'Manage admin roles',
        },
        {
            id: '2',
            title: 'Commission Setup',
            description: 'Platform fees',
        },
        {
            id: '3',
            title: 'Location Setup',
            description: 'Cities & areas',
        },
        {
            id: '4',
            title: 'Policies',
            description: 'Terms & Privacy',
        },
    ];

    const renderSettingItem = ({ item }) => (
        <TouchableOpacity style={styles.settingCard}>
            <View style={styles.circle} />
            <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingDescription}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <CustomeHeader title="Settings" />

            <View style={styles.content}>
                {/* Settings List */}
                <FlatList
                    data={settingsOptions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderSettingItem}
                    style={styles.settingsList}
                    showsVerticalScrollIndicator={false}
                />
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
    settingsList: {
        flex: 1,
    },
    settingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    circle: {
        width: 44,
        height: 44,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#333',
        marginRight: 15,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
    },
});

//make this component available to the app
export default Settings;