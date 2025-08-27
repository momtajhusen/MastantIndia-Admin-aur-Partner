//import libraries
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, FlatList } from 'react-native';
import CustomeHeader from '../../components/header';

// create a component
const RolesPermissions = () => {
    const [roleName, setRoleName] = useState('');
    const [roles, setRoles] = useState([
        {
            id: '1',
            name: 'Support Admin',
            description: 'Tickets, users',
            isEnabled: true,
        },
        {
            id: '2',
            name: 'Finance Admin',
            description: 'Payments, payouts',
            isEnabled: true,
        },
        {
            id: '3',
            name: 'Ops Admin',
            description: 'Bookings, providers',
            isEnabled: false,
        },
    ]);

    const toggleRole = (id) => {
        setRoles(roles.map(role => 
            role.id === id 
                ? { ...role, isEnabled: !role.isEnabled }
                : role
        ));
    };

    const renderRoleItem = ({ item }) => (
        <View style={styles.roleCard}>
            <View style={styles.circle} />
            <View style={styles.roleInfo}>
                <Text style={styles.roleName}>{item.name}</Text>
                <Text style={styles.roleDescription}>{item.description}</Text>
            </View>
            <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>
                    {item.isEnabled ? 'ON' : 'OFF'}
                </Text>
                <Switch
                    value={item.isEnabled}
                    onValueChange={() => toggleRole(item.id)}
                    trackColor={{ false: '#e0e0e0', true: '#333' }}
                    thumbColor={item.isEnabled ? '#fff' : '#fff'}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <CustomeHeader title="Roles & Permissions" />

            <View style={styles.content}>
                {/* Role Name Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Role Name</Text>
                    <TextInput
                        style={styles.roleNameInput}
                        placeholder="Enter role name"
                        value={roleName}
                        onChangeText={setRoleName}
                    />
                </View>

                {/* Roles List */}
                <FlatList
                    data={roles}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRoleItem}
                    style={styles.rolesList}
                    showsVerticalScrollIndicator={false}
                />

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save Role</Text>
                </TouchableOpacity>
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
        marginBottom: 10,
        color: '#333',
    },
    roleNameInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    rolesList: {
        flex: 1,
        marginBottom: 20,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
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
    roleInfo: {
        flex: 1,
    },
    roleName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    roleDescription: {
        fontSize: 14,
        color: '#666',
    },
    switchContainer: {
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 5,
        color: '#333',
    },
    saveButton: {
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});

//make this component available to the app
export default RolesPermissions;