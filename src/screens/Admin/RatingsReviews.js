//import libraries
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import CustomeHeader from '../../components/header';

const screenWidth = Dimensions.get('window').width;

// create a component
const RatingsReviews = () => {
    const reviewsData = [
        { 
            id: '1', 
            name: 'Riya', 
            review: '"Great service!"', 
            rating: '★★★★★',
            action: 'FLAG'
        },
        { 
            id: '2', 
            name: 'Aman', 
            review: '"Delayed arrival."', 
            rating: '★★★■■',
            action: 'HIDE'
        },
    ];

    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.circle} />
            <View style={styles.reviewInfo}>
                <Text style={styles.reviewerName}>{item.name}</Text>
                <Text style={styles.reviewText}>{item.review} {item.rating}</Text>
            </View>
            <TouchableOpacity 
                style={[
                    styles.actionBtn, 
                    item.action === 'FLAG' ? styles.flagBtn : styles.hideBtn
                ]}
            >
                <Text style={styles.actionBtnText}>{item.action}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <CustomeHeader title="Ratings & Reviews" />

            <View style={styles.content}>
                {/* Chart Container */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Avg Rating Trend</Text>
                    <LineChart
                        data={{
                            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                            datasets: [{ data: [3.5, 4.2, 3.8, 4.5, 4.8, 4.1] }],
                        }}
                        width={screenWidth - 60}
                        height={140}
                        yAxisLabel=""
                        chartConfig={{
                            backgroundColor: "#ffffff",
                            backgroundGradientFrom: "#ffffff",
                            backgroundGradientTo: "#ffffff",
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 8 },
                        }}
                        bezier
                        style={{ borderRadius: 8, marginTop: 10 }}
                    />
                </View>

                {/* Reviews List */}
                <FlatList
                    data={reviewsData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderReviewItem}
                    style={styles.reviewsList}
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
    },
    chartContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 15,
        marginVertical: 20,
        backgroundColor: '#fff',
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
        color: '#000',
    },
    reviewsList: {
        flex: 1,
    },
    reviewCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
    },
    circle: {
        width: 44,
        height: 44,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#333',
        marginRight: 15,
    },
    reviewInfo: {
        flex: 1,
    },
    reviewerName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    reviewText: {
        fontSize: 14,
        color: '#666',
    },
    actionBtn: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 8,
    },
    flagBtn: {
        borderColor: '#e74c3c',
        backgroundColor: '#ffeaea',
    },
    hideBtn: {
        borderColor: '#95a5a6',
        backgroundColor: '#f8f9fa',
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

//make this component available to the app
export default RatingsReviews;