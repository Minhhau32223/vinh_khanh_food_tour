import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeHeader = () => {
    return (
        <View style={styles.header}>
            <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="white" />
                <Text style={styles.locationText}>Quận 4, TP.HCM</Text>
            </View>
            <Text style={styles.headerTitle}>Phố Ẩm Thực Vĩnh Khánh</Text>
            <Text style={styles.headerSubtitle}>Khám phá hương vị ẩm thực đường phố Sài Gòn</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#e60000',
        padding: 20,
        paddingBottom: 25,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    locationText: {
        color: 'white',
        marginLeft: 5,
        fontSize: 14,
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    headerSubtitle: {
        color: '#ffcccc',
        fontSize: 14,
    },
});

export default HomeHeader;
