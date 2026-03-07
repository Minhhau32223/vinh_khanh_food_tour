import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const RestaurantDetailScreen = ({ route, navigation }) => {
    // Mock data passed from previous screen or fetched (fallback default here)
    const item = route.params?.item || {
        name: 'Phở Lệ',
        rating: 4.8,
        reviews: 342,
        priceRange: '45.000đ - 75.000đ',
        badge: 'Phở',
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        address: '123 Vĩnh Khánh, P.10, Q.4',
        openHours: '6:00 - 22:00',
        isOpen: true,
        ttsContent: 'Phở Lệ là một trong những quán phở truyền thống lâu đời và nổi tiếng nhất tại khu vực Quận 5 và nay đã có mặt tại Quận 4. Nước dùng được hầm từ xương bò nhiều giờ liền tạo nên vị ngọt thanh tự nhiên, kết hợp cùng sợi phở mềm dai và những lát thịt bò tươi ngon.',
        history: 'Được thành lập từ năm 1975, quán đã phục vụ hàng nghìn thực khách với món ăn truyền thống đậm đà hương vị Sài Gòn. Công thức gia truyền được giữ nguyên qua nhiều thế hệ.',
        specialties: 'Phở bò tái, Phở bò chín',
        menu: [
            { id: '1', name: 'Món đặc biệt', desc: 'Phần ăn đầy đủ nhất', price: '65.000đ' },
            { id: '2', name: 'Món truyền thống', desc: 'Công thức gốc', price: '50.000đ' },
            { id: '3', name: 'Món combo', desc: 'Cho 2 người', price: '85.000đ' },
        ]
    };

    const [activeTab, setActiveTab] = useState('Introduction');
    const [isPlaying, setIsPlaying] = useState(false);

    const handleSpeech = () => {
        if (isPlaying) {
            Speech.stop();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            Speech.speak(item.ttsContent, {
                language: 'vi-VN',
                onDone: () => setIsPlaying(false),
                onStopped: () => setIsPlaying(false),
            });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header Image & Top Icons */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.image }} style={styles.heroImage} />

                    <View style={styles.topIconRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <View style={styles.rightIcons}>
                            <TouchableOpacity style={[styles.iconButton, { marginRight: 10 }]}>
                                <Ionicons name="heart-outline" size={24} color="#333" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="share-social-outline" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Image Overlay Info */}
                    <View style={styles.overlayInfo}>
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                        <Text style={styles.title}>{item.name}</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={16} color="#ffcc00" />
                            <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
                            <Text style={styles.priceText}>{item.priceRange}</Text>
                        </View>
                    </View>
                </View>

                {/* Content Body */}
                <View style={styles.contentBody}>

                    {/* TTS Player Card */}
                    <View style={styles.ttsCard}>
                        <View style={styles.ttsHeader}>
                            <View style={styles.ttsIconHolder}>
                                <Ionicons name="volume-medium" size={24} color="white" />
                            </View>
                            <View style={styles.ttsInfo}>
                                <Text style={styles.ttsTitle}>Thuyết minh tự động</Text>
                                <Text style={styles.ttsSubtitle}>Thời lượng: 3:45</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.playButton, isPlaying && styles.stopButton]}
                            onPress={handleSpeech}
                        >
                            <Ionicons name={isPlaying ? "stop-circle-outline" : "play-circle-outline"} size={20} color="white" />
                            <Text style={styles.playButtonText}>{isPlaying ? "Dừng thuyết minh" : "Nghe thuyết minh"}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info Cards */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color="#f53d00" />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoTitle}>Địa chỉ</Text>
                                <Text style={styles.infoDesc}>{item.address}</Text>
                                <TouchableOpacity>
                                    <Text style={styles.linkText}>Xem bản đồ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={20} color="#f53d00" />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoTitle}>Giờ mở cửa</Text>
                                <Text style={styles.infoDesc}>{item.openHours}</Text>
                                {item.isOpen && (
                                    <View style={styles.openBadge}>
                                        <Text style={styles.openBadgeText}>Đang mở cửa</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Tabs Navigation */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Introduction' && styles.activeTab]}
                            onPress={() => setActiveTab('Introduction')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Introduction' && styles.activeTabText]}>Giới thiệu</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Menu' && styles.activeTab]}
                            onPress={() => setActiveTab('Menu')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Menu' && styles.activeTabText]}>Thực đơn</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'Reviews' && styles.activeTab]}
                            onPress={() => setActiveTab('Reviews')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Reviews' && styles.activeTabText]}>Đánh giá</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Content */}
                    <View style={styles.tabContentCard}>
                        {activeTab === 'Introduction' && (
                            <View>
                                <Text style={styles.sectionHeading}>Về quán</Text>
                                <Text style={styles.paragraph}>{item.history}</Text>

                                <Text style={styles.sectionHeading}>Đặc sản:</Text>
                                <Text style={styles.paragraph}>{item.specialties}</Text>

                                <Text style={styles.sectionHeading}>Lịch sử:</Text>
                                <Text style={styles.paragraph}>{item.history}</Text>
                            </View>
                        )}

                        {activeTab === 'Menu' && (
                            <View>
                                <Text style={styles.sectionHeading}>Thực đơn</Text>
                                {item.menu.map((m) => (
                                    <View key={m.id} style={styles.menuItem}>
                                        <View style={styles.menuItemLeft}>
                                            <Text style={styles.menuItemName}>{m.name}</Text>
                                            <Text style={styles.menuItemDesc}>{m.desc}</Text>
                                        </View>
                                        <Text style={styles.menuItemPrice}>{m.price}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {activeTab === 'Reviews' && (
                            <View>
                                <Text style={styles.sectionHeading}>Đánh giá ({item.reviews})</Text>
                                <Text style={styles.paragraph}>Chưa có bài đánh giá chi tiết nào cho địa điểm này. Hãy là người đầu tiên!</Text>
                            </View>
                        )}
                    </View>

                </View>
            </ScrollView>
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
        backgroundColor: '#faf8f5', // light background matching design
    },
    imageContainer: {
        height: 280,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    topIconRow: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightIcons: {
        flexDirection: 'row',
    },
    overlayInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    badgeContainer: {
        backgroundColor: '#111',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: 'white',
        marginLeft: 5,
        marginRight: 15,
        fontSize: 14,
    },
    priceText: {
        color: '#ccc',
        fontSize: 14,
    },
    contentBody: {
        padding: 20,
    },
    ttsCard: {
        backgroundColor: '#f5f7ff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e5eaff',
    },
    ttsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    ttsIconHolder: {
        width: 50,
        height: 50,
        backgroundColor: '#8a2be2',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    ttsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    ttsSubtitle: {
        color: '#666',
        fontSize: 13,
        marginTop: 2,
    },
    playButton: {
        backgroundColor: '#8a2be2',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    stopButton: {
        backgroundColor: '#d32f2f',
    },
    playButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 10,
        fontSize: 16,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    infoTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    infoDesc: {
        color: '#555',
        marginBottom: 8,
        fontSize: 14,
    },
    linkText: {
        color: '#0066ff',
        fontSize: 14,
        fontWeight: '500',
    },
    openBadge: {
        alignSelf: 'flex-start',
        borderColor: '#00aa00',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
    },
    openBadgeText: {
        color: '#00aa00',
        fontSize: 12,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#eee',
        borderRadius: 25,
        marginVertical: 10,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#333',
        fontWeight: 'bold',
    },
    tabContentCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#eee',
        minHeight: 200,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        marginTop: 15,
    },
    paragraph: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 15,
    },
    menuItemName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    menuItemDesc: {
        fontSize: 13,
        color: '#777',
    },
    menuItemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d32f2f',
    }
});

export default RestaurantDetailScreen;
