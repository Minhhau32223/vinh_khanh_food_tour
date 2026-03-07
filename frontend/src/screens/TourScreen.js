import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TourScreen = () => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Tour Của Tôi</Text>
                        <Text style={styles.headerSubtitle}>0 tour cá nhân</Text>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    {/* Create Button */}
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => navigation.navigate('CreateTour')}
                    >
                        <Ionicons name="add" size={24} color="white" />
                        <Text style={styles.createButtonText}>Tạo Tour Mới</Text>
                    </TouchableOpacity>

                    {/* System Tours */}
                    <Text style={styles.sectionTitle}>Tour Hệ Thống</Text>
                    <View style={styles.tourCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconBox}>
                                <Ionicons name="location-outline" size={24} color="#fff" />
                            </View>
                            <View style={styles.cardHeaderText}>
                                <View style={styles.cardTitleRow}>
                                    <Text style={styles.cardTitle}>Tour Ẩm Thực Vĩnh Khánh</Text>
                                    <View style={styles.systemBadge}>
                                        <Text style={styles.systemBadgeText}>Hệ thống</Text>
                                    </View>
                                </View>
                                <Text style={styles.cardDescription}>Tour đề xuất bởi hệ thống với 4 điểm dừng nổi tiếng</Text>
                                <View style={styles.stopsInfoRow}>
                                    <Ionicons name="navigate-outline" size={14} color="#888" />
                                    <Text style={styles.stopsInfoText}>4 điểm dừng</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.stopList}>
                            {['Phở Lệ', 'Bánh Mì Huynh Hoa', 'Cà Phê Sài Gòn', 'Gỏi Cuốn Bà Năm'].map((stop, ind) => (
                                <View key={ind} style={styles.stopItemRow}>
                                    <View style={styles.stopNumberBox}>
                                        <Text style={styles.stopNumberText}>{ind + 1}</Text>
                                    </View>
                                    <Text style={styles.stopNameText}>{stop}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => navigation.navigate('RunTour')}
                        >
                            <Ionicons name="play" size={20} color="white" />
                            <Text style={styles.startButtonText}>Bắt đầu tour</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Personal Tours */}
                    <Text style={styles.sectionTitle}>Tour Cá Nhân</Text>
                    <View style={styles.emptyStateCard}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="location-outline" size={32} color="#aaa" />
                        </View>
                        <Text style={styles.emptyStateTitle}>Chưa có tour nào</Text>
                        <Text style={styles.emptyStateDesc}>Tạo tour cá nhân để khám phá theo cách của bạn!</Text>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ff3d00', // matches header
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        backgroundColor: '#ff3d00',
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#ffccbc',
        fontSize: 14,
        marginTop: 2,
    },
    contentContainer: {
        padding: 20,
    },
    createButton: {
        backgroundColor: '#ff3d00',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
        marginBottom: 25,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    tourCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    iconBox: {
        width: 50,
        height: 50,
        backgroundColor: '#4d88ff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 5,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginRight: 10,
    },
    systemBadge: {
        backgroundColor: '#2962ff',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    systemBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardDescription: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    stopsInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stopsInfoText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 5,
    },
    stopList: {
        marginBottom: 20,
    },
    stopItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stopNumberBox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#e5f0ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stopNumberText: {
        color: '#0066ff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stopNameText: {
        fontSize: 15,
        color: '#333',
    },
    startButton: {
        backgroundColor: '#2962ff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 8,
    },
    startButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    emptyStateCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        borderStyle: 'dashed',
    },
    emptyIconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    emptyStateTitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 5,
    },
    emptyStateDesc: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
    }
});

export default TourScreen;
