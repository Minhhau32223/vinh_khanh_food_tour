import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { DATA, CATEGORIES } from '../data/mockData';

const ListScreen = () => {
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#ffb300" />
                    <Text style={styles.ratingText}>{item.rating} <Text style={{ color: '#888', fontSize: 11 }}>({item.reviews})</Text></Text>
                </View>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.badge}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>

                <View style={styles.cardRow}>
                    <Ionicons name="location-outline" size={14} color="#888" />
                    <Text style={styles.cardAddress}>{item.address}</Text>
                </View>

                <Text style={styles.cardPrice}>{item.price}</Text>

                <View style={styles.divider} />

                <Text style={styles.cardFooterText}>Đặc sản: {item.specialty}</Text>
                <Text style={styles.cardFooterText}>Giờ mở cửa: {item.hours}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* Header containing search & filters directly */}
                <View style={styles.header}>
                    <View style={styles.searchHeader}>
                        <TouchableOpacity style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Danh sách quán ăn</Text>
                    </View>

                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#888" />
                        <TextInput
                            placeholder="Tìm kiếm món ăn, quán ăn..."
                            style={styles.searchInput}
                            placeholderTextColor="#888"
                        />
                    </View>

                    <View style={styles.categoriesContainer}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={CATEGORIES}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.categoryTag, activeCategory === item && styles.categoryTagActive]}
                                    onPress={() => setActiveCategory(item)}
                                >
                                    <Text style={[styles.categoryTagText, activeCategory === item && styles.categoryTagTextActive]}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>

                {/* List Content */}
                <View style={styles.listContainer}>
                    <Text style={styles.resultsText}>Tìm thấy {DATA.length} kết quả</Text>
                    <FlatList
                        data={DATA}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.flatListContent}
                    />
                </View>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    backButton: {
        padding: 5,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    categoriesContainer: {
        flexDirection: 'row',
    },
    categoryTag: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
        marginRight: 10,
        backgroundColor: '#fff',
    },
    categoryTagActive: {
        backgroundColor: '#ff4500',
        borderColor: '#ff4500',
    },
    categoryTagText: {
        color: '#333',
        fontWeight: '500',
    },
    categoryTagTextActive: {
        color: '#fff',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 15,
    },
    resultsText: {
        fontSize: 14,
        color: '#666',
        marginVertical: 15,
    },
    flatListContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        height: 180,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    ratingBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        marginLeft: 4,
        fontWeight: 'bold',
        fontSize: 13,
    },
    categoryBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryBadgeText: {
        fontWeight: 'bold',
        fontSize: 13,
    },
    cardContent: {
        padding: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    cardDescription: {
        fontSize: 14,
        color: '#444',
        marginBottom: 10,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardAddress: {
        fontSize: 13,
        color: '#888',
        marginLeft: 5,
    },
    cardPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ff4500',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    cardFooterText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    }
});

export default ListScreen;
