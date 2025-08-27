//import libraries
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import CustomeHeader from '../../components/header';

// create a component
const SendNotification = () => {
    const [message, setMessage] = useState('');

    return (
        <View style={styles.container}>
            {/* Header */}
            <CustomeHeader title="Notifications" />

            <View style={styles.content}>
                {/* Message Section */}
                <View style={styles.messageSection}>
                    <Text style={styles.messageLabel}>Message</Text>
                    <View style={styles.messageContainer}>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Type your message here..."
                            value={message}
                            onChangeText={setMessage}
                            multiline={true}
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Send to Users</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Send to Providers</Text>
                    </TouchableOpacity>
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
    messageSection: {
        marginBottom: 30,
    },
    messageLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    messageContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        height: 120,
    },
    messageInput: {
        flex: 1,
        padding: 15,
        fontSize: 16,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    actionButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});

//make this component available to the app
export default SendNotification;