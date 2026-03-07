import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HomeMenu = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('Danh sách')}>
                <View style={[styles.iconContainer, { backgroundColor: '#fff0e5' }]}>
                    <Ionicons name="location-outline" size={24} color="#f53d00" />
                </View>
                <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Danh sách quán</Text>
                    <Text style={styles.menuSubtitle}>25+ địa điểm</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('Bản đồ')}>
                <View style={[styles.iconContainer, { backgroundColor: '#e5f0ff' }]}>
                    <Ionicons name="map-outline" size={24} color="#0066ff" />
                </View>
                <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Bản đồ</Text>
                    <Text style={styles.menuSubtitle}>Xem vị trí</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuCard} onPress={() => navigation.navigate('Giới thiệu')}>
                <View style={[styles.iconContainer, { backgroundColor: '#e5ffe5' }]}>
                    <Ionicons name="information-circle-outline" size={24} color="#00cc00" />
                </View>
                <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Lịch sử văn hóa</Text>
                    <Text style={styles.menuSubtitle}>Tìm hiểu</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    menuContainer: {
        padding: 20,
    },
    menuCard: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#666',
    },
});

export default HomeMenu;
