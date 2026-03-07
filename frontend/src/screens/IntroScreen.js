import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const IntroScreen = () => {
    const [activeTab, setActiveTab] = useState('Văn hóa');

    const renderContent = () => {
        if (activeTab === 'Văn hóa') {
            return (
                <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>Nét Văn Hóa Đặc Sắc</Text>
                    <Text style={styles.sectionDesc}>
                        Phố Vĩnh Khánh là nơi hội tụ của nhiều nền văn hóa ẩm thực khác nhau.
                        Từ món ăn Bắc, Trung, Nam đều có mặt tại đây, tạo nên một bức tranh
                        ẩm thực đa sắc màu và phong phú.
                    </Text>

                    <View style={styles.featureCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#ffe6cc' }]}>
                            <Ionicons name="people-outline" size={24} color="#f53d00" />
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Cộng đồng đa dạng</Text>
                            <Text style={styles.featureDesc}>Hội tụ nhiều nền văn hóa ẩm thực từ Bắc đến Nam, tạo nên sự phong phú trong món ăn.</Text>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#ffe6cc' }]}>
                            <Ionicons name="ribbon-outline" size={24} color="#f53d00" />
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Công thức gia truyền</Text>
                            <Text style={styles.featureDesc}>Nhiều quán giữ nguyên công thức nấu ăn truyền thống qua nhiều thế hệ.</Text>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#ffe6cc' }]}>
                            <Ionicons name="location-outline" size={24} color="#f53d00" />
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Vị trí đắc địa</Text>
                            <Text style={styles.featureDesc}>Nằm ở trung tâm Quận 4, gần các khu dân cư và trục đường chính, dễ dàng tiếp cận.</Text>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#ffe6cc' }]}>
                            <Ionicons name="book-outline" size={24} color="#f53d00" />
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Giá trị lịch sử</Text>
                            <Text style={styles.featureDesc}>Gắn liền với quá trình hình thành và phát triển của Sài Gòn sau năm 1975.</Text>
                        </View>
                    </View>
                </View>
            );
        } else if (activeTab === 'Đặc sản') {
            return (
                <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>Các Món Đặc Sản</Text>
                    <Text style={styles.sectionDesc}>
                        Phố Vĩnh Khánh tự hào với sự đa dạng của các món ăn đại diện cho ba
                        miền Bắc - Trung - Nam, mỗi món đều mang trong mình hương vị đặc
                        trưng riêng.
                    </Text>

                    <View style={styles.specialtyCard}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                            style={styles.specialtyImage}
                        />
                        <View style={styles.specialtyTextContainer}>
                            <Text style={styles.specialtyTitle}>Phở Bắc</Text>
                            <Text style={styles.specialtySubtitle}>Miền Bắc</Text>
                            <Text style={styles.specialtyDesc}>Nước dùng trong, thanh đạm, thịt bò tươi ngon</Text>
                        </View>
                    </View>

                    <View style={styles.specialtyCard}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                            style={styles.specialtyImage}
                        />
                        <View style={styles.specialtyTextContainer}>
                            <Text style={styles.specialtyTitle}>Bánh Mì Sài Gòn</Text>
                            <Text style={styles.specialtySubtitle}>Miền Nam</Text>
                            <Text style={styles.specialtyDesc}>Bánh mì giòn rụm, nhân thập cẩm phong phú</Text>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>Lịch Sử Sơ Lược</Text>
                    <Text style={styles.sectionDesc}>Đang cập nhật nội dung...</Text>
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lịch Sử & Văn Hóa</Text>
                    <Text style={styles.headerSubtitle}>Khám phá câu chuyện đằng sau Phố Ẩm Thực Vĩnh Khánh</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>1000+</Text>
                        <Text style={styles.statLabel}>Khách/ngày</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>4.8</Text>
                        <Text style={styles.statLabel}>Đánh giá TB</Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    {['Lịch sử', 'Văn hóa', 'Đặc sản'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Dynamic Content */}
                <View style={styles.mainContentBox}>
                    {renderContent()}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#e60000', // blends with header
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: '#faf8f5',
    },
    header: {
        backgroundColor: '#e60000',
        padding: 20,
        paddingBottom: 30,
    },
    backButton: {
        marginBottom: 15,
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    headerSubtitle: {
        color: '#ffcccc',
        fontSize: 14,
        lineHeight: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginTop: -20,
        borderRadius: 12,
        paddingVertical: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#eee',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f53d00',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 13,
        color: '#666',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 25,
        padding: 5,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    tabButtonActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#f53d00',
        fontWeight: 'bold',
    },
    mainContentBox: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#eee',
        padding: 20,
    },
    contentSection: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    sectionDesc: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        marginBottom: 20,
    },
    featureCard: {
        flexDirection: 'row',
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        marginBottom: 15,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    featureDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    specialtyCard: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
    },
    specialtyImage: {
        width: '100%',
        height: 180,
    },
    specialtyTextContainer: {
        padding: 15,
    },
    specialtyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    specialtySubtitle: {
        fontSize: 13,
        color: '#f53d00',
        marginBottom: 8,
    },
    specialtyDesc: {
        fontSize: 14,
        color: '#555',
    }
});

export default IntroScreen;
