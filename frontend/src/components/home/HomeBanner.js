import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HomeBanner = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.bannerContainer}>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                style={styles.bannerImage}
            />
            <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>Chào mừng đến với tour ẩm thực!</Text>
                <TouchableOpacity style={styles.tourButton} onPress={() => navigation.navigate('Tour')}>
                    <Ionicons name="volume-high" size={20} color="white" />
                    <Text style={styles.tourButtonText}>Xem tour của tôi</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bannerContainer: {
        height: 200,
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    bannerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    tourButton: {
        backgroundColor: '#f53d00',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    tourButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 10,
        fontSize: 16,
    },
});

export default HomeBanner;
