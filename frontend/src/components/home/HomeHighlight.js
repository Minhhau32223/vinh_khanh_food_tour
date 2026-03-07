import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DATA = [
    {
        id: '1',
        name: 'Phở Lệ',
        rating: 4.8,
        description: 'Phở bò truyền thống nổi tiếng từ năm 1975',
        address: '123 Vĩnh Khánh, P.10, Q.4',
        badge: 'Phở',
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: '2',
        name: 'Bánh Mì Huynh Hoa',
        rating: 4.9,
        description: 'Bánh mì thập cẩm đặc biệt với nhân đầy đặn',
        address: '187 Vĩnh Khánh, P.10, Q.4',
        badge: 'Bánh Mì',
        image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
        id: '3',
        name: 'Cà Phê Sài Gòn',
        rating: 4.7,
        description: 'Cà phê phin truyền thống đậm đà',
        address: '256 Vĩnh Khánh, P.10, Q.4',
        badge: 'Cà Phê',
        image: 'https://images.unsplash.com/photo-1579560875955-e51c22bc756c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    }
];

const HomeHighlight = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.highlightSection}>
            <View style={styles.highlightHeader}>
                <Text style={styles.sectionTitle}>Nổi bật</Text>
                <TouchableOpacity style={styles.seeAllRow} onPress={() => navigation.navigate('Danh sách')}>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                    <Ionicons name="chevron-forward" size={16} color="#333" />
                </TouchableOpacity>
            </View>

            {DATA.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    style={styles.highlightCard}
                    onPress={() => navigation.navigate('RestaurantDetail', { item })}
                >
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: item.image }} style={styles.highlightImage} />
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#ffb300" />
                            <Text style={styles.ratingText}>{item.rating}</Text>
                        </View>
                        <Text style={styles.cardDescription}>{item.description}</Text>
                        <Text style={styles.cardAddress}>{item.address}</Text>
                    </View>
                </TouchableOpacity>
            ))}

        </View>
    );
};

const styles = StyleSheet.create({
    highlightSection: {
        padding: 20,
        backgroundColor: '#fff', // Match body of UI
    },
    highlightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAllRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginRight: 5,
    },
    highlightCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#eee',
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 180,
    },
    highlightImage: {
        width: '100%',
        height: '100%',
    },
    badgeContainer: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
    },
    badgeText: {
        fontWeight: 'bold',
        color: '#333',
    },
    cardContent: {
        padding: 15,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 4,
        color: '#333',
    },
    cardDescription: {
        fontSize: 13,
        color: '#555',
        marginBottom: 6,
    },
    cardAddress: {
        fontSize: 11,
        color: '#888',
    }
});

export default HomeHighlight;
