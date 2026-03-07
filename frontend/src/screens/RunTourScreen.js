import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');

// Mock Data
const TOUR_DATA = {
    name: "Tour Ẩm Thực Vĩnh Khánh",
    stops: [
        {
            id: '1',
            name: 'Phở Lệ',
            badge: 'Phở',
            image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            distance: '0m từ điểm trước',
            time: '4:30 phút',
            status: 'Current', // Past, Current, Future
            ttsContent: 'Phở Lệ là một trong những quán phở truyền thống lâu đời. Nước dùng được hầm từ xương bò nhiều giờ liền tạo nên vị ngọt thanh tự nhiên.',
            history: 'Quán được bà Lệ sáng lập sau khi di cư từ Bắc vào Nam năm 1954.',
            specialties: ['Phở bò tái', 'Phở bò chín', 'Phở gà'],
            tip: 'Nên đến vào buổi sáng sớm để thưởng thức nước dùng tươi nhất.'
        },
        {
            id: '2',
            name: 'Bánh Mì Huynh Hoa',
            badge: 'Bánh Mì',
            image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            distance: '150m từ điểm trước',
            time: '2:15 phút',
            status: 'Future',
            ttsContent: 'Bánh mì Huynh Hoa nức tiếng Sài Gòn với ổ bánh mì đặc ruột đầy ắp nhân thịt nguội và pate.',
            history: 'Hoạt động từ những năm 1980, là biểu tượng ẩm thực đường phố.',
            specialties: ['Bánh mì thập cẩm', 'Bá mì chả lụa'],
            tip: 'Hãy chuẩn bị sẵn tinh thần xếp hàng vì quán luôn đông khách.'
        },
        {
            id: '3',
            name: 'Cà Phê Sài Gòn',
            badge: 'Cà Phê',
            image: 'https://images.unsplash.com/photo-1579560875955-e51c22bc756c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            status: 'Future'
        },
        {
            id: '4',
            name: 'Gỏi Cuốn Bà Năm',
            badge: 'Ăn vặt',
            image: 'https://images.unsplash.com/photo-1606550993096-7b447614d115?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            status: 'Future'
        }
    ]
};

const RunTourScreen = ({ navigation }) => {
    const [activeStopIndex, setActiveStopIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const currentStop = TOUR_DATA.stops[activeStopIndex];
    const progressPercent = ((activeStopIndex + 1) / TOUR_DATA.stops.length) * 100;

    const handleSpeech = () => {
        if (isPlaying) {
            Speech.stop();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            Speech.speak(currentStop.ttsContent || "Nội dung đang cập nhật", {
                language: 'vi-VN',
                onDone: () => setIsPlaying(false),
                onStopped: () => setIsPlaying(false),
            });
        }
    };

    const goNext = () => {
        if (isPlaying) {
            Speech.stop();
            setIsPlaying(false);
        }
        if (activeStopIndex < TOUR_DATA.stops.length - 1) {
            setActiveStopIndex(activeStopIndex + 1);
        }
    };

    const goPrev = () => {
        if (isPlaying) {
            Speech.stop();
            setIsPlaying(false);
        }
        if (activeStopIndex > 0) {
            setActiveStopIndex(activeStopIndex - 1);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header and Progress */}
            <View style={styles.headerCont}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleCont}>
                        <Text style={styles.headerTitle} numberOfLines={1}>{TOUR_DATA.name}</Text>
                        <Text style={styles.headerSubtitle}>Điểm {activeStopIndex + 1} / {TOUR_DATA.stops.length}</Text>
                    </View>
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Đang hoạt động</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>

                {/* Minimal Tabs Row */}
                <View style={styles.tabsRow}>
                    {TOUR_DATA.stops.map((stop, i) => (
                        <Text key={stop.id} style={[styles.tabText, i === activeStopIndex && styles.tabTextActive]}>
                            {stop.badge}
                        </Text>
                    ))}
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Active POI Card Detail */}
                <View style={styles.cardDetailBox}>
                    <Image source={{ uri: currentStop.image }} style={styles.mainImage} />
                    <View style={styles.poiBadgeOverlay}>
                        <Text style={styles.poiBadgeText}>{currentStop.badge}</Text>
                    </View>

                    <View style={styles.poiInfoBody}>
                        <Text style={styles.poiName}>{currentStop.name}</Text>
                        {currentStop.distance && (
                            <View style={styles.distanceRow}>
                                <Ionicons name="navigate-outline" size={14} color="#666" />
                                <Text style={styles.distanceText}>{currentStop.distance}  •  {currentStop.time}</Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.directionBtn}>
                            <Ionicons name="location-outline" size={18} color="#333" />
                            <Text style={styles.directionBtnText}>Chỉ đường</Text>
                        </TouchableOpacity>

                        {/* TTS Player */}
                        <View style={styles.ttsContainer}>
                            <View style={styles.ttsHeader}>
                                <View style={styles.ttsIconHolder}>
                                    <Ionicons name="volume-medium" size={20} color="white" />
                                </View>
                                <View style={styles.ttsInfo}>
                                    <Text style={styles.ttsTitle}>Thuyết minh tự động</Text>
                                    <Text style={styles.ttsSubtitle}>Thời lượng: {currentStop.time || "Trống"}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.ttsPlayBtn, isPlaying && styles.ttsStopBtn]}
                                onPress={handleSpeech}
                            >
                                <Ionicons name={isPlaying ? "stop-circle-outline" : "play-circle-outline"} size={20} color="white" />
                                <Text style={styles.ttsPlayBtnText}>{isPlaying ? "Dừng thuyết minh" : "Nghe thuyết minh"}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* History Section */}
                        {currentStop.history && (
                            <View style={styles.sectionBlock}>
                                <Text style={styles.sectionTitle}>Lịch sử</Text>
                                <Text style={styles.sectionBodyText}>{currentStop.history}</Text>
                            </View>
                        )}

                        {/* Specialties Section */}
                        {currentStop.specialties && (
                            <View style={styles.sectionBlock}>
                                <Text style={styles.sectionTitle}>Món đặc sản</Text>
                                <View style={styles.tagsContainer}>
                                    {currentStop.specialties.map((item, idx) => (
                                        <View key={idx} style={styles.tagPill}>
                                            <Text style={styles.tagText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Tip Section */}
                        {currentStop.tip && (
                            <View style={styles.tipBox}>
                                <View style={styles.tipHeader}>
                                    <Ionicons name="bulb-outline" size={16} color="#d97706" />
                                    <Text style={styles.tipTitle}>Mẹo hay</Text>
                                </View>
                                <Text style={styles.tipText}>{currentStop.tip}</Text>
                            </View>
                        )}

                    </View>
                </View>

                {/* Navigation Controls */}
                <View style={styles.navControlsRow}>
                    <TouchableOpacity
                        style={[styles.navBtnPrev, activeStopIndex === 0 && styles.navBtnDisabled]}
                        onPress={goPrev}
                        disabled={activeStopIndex === 0}
                    >
                        <Text style={[styles.navBtnPrevText, activeStopIndex === 0 && styles.navBtnTextDisabled]}>Điểm trước</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navBtnNext, activeStopIndex === TOUR_DATA.stops.length - 1 && styles.navBtnDisabled]}
                        onPress={goNext}
                        disabled={activeStopIndex === TOUR_DATA.stops.length - 1}
                    >
                        <Text style={styles.navBtnNextText}>{activeStopIndex === TOUR_DATA.stops.length - 1 ? "Hoàn thành" : "Điểm tiếp theo"}</Text>
                        {activeStopIndex < TOUR_DATA.stops.length - 1 && <Ionicons name="play-skip-forward" size={16} color="white" style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>
                </View>

                {/* Overview Grid Summary */}
                <View style={styles.overviewSection}>
                    <Text style={styles.overviewTitle}>Tổng quan tour</Text>
                    <View style={styles.overviewGrid}>
                        {TOUR_DATA.stops.map((stop, i) => {
                            const isActive = i === activeStopIndex;
                            return (
                                <TouchableOpacity key={stop.id} style={[styles.gridCard, isActive && styles.gridCardActive]} onPress={() => setActiveStopIndex(i)}>
                                    <Image source={{ uri: stop.image }} style={styles.gridImg} />
                                    <View style={styles.gridInfo}>
                                        <Text style={styles.gridName} numberOfLines={1}>{stop.name}</Text>
                                        <Text style={styles.gridBadgeText}>{stop.badge}</Text>
                                        {isActive && (
                                            <View style={styles.gridLiveIndicator}>
                                                <Text style={styles.gridLiveText}>Hiện tại</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>

                <View style={{ height: 40 }} />
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
    headerCont: {
        backgroundColor: '#fff',
        paddingTop: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    headerBackBtn: {
        marginRight: 15,
    },
    headerTitleCont: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    activeBadge: {
        backgroundColor: '#00c853',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    activeBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 20,
        borderRadius: 2,
        marginBottom: 12,
    },
    progressBarFill: {
        height: 4,
        backgroundColor: '#111',
        borderRadius: 2,
    },
    tabsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    tabText: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#ff3d00',
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#f9f9fb',
    },
    cardDetailBox: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    mainImage: {
        width: width,
        height: 220,
    },
    poiBadgeOverlay: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    poiBadgeText: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: 12,
    },
    poiInfoBody: {
        padding: 20,
    },
    poiName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 8,
    },
    distanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    distanceText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
    },
    directionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingVertical: 12,
        marginBottom: 20,
    },
    directionBtnText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    ttsContainer: {
        backgroundColor: '#f4f6ff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8ff',
    },
    ttsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    ttsIconHolder: {
        width: 40,
        height: 40,
        backgroundColor: '#9333ea',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    ttsTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111',
    },
    ttsSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    ttsPlayBtn: {
        backgroundColor: '#9333ea',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    ttsStopBtn: {
        backgroundColor: '#dc2626',
    },
    ttsPlayBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    sectionBlock: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    sectionBodyText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tagPill: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    tipBox: {
        backgroundColor: '#fffbeb',
        borderWidth: 1,
        borderColor: '#fde68a',
        borderRadius: 8,
        padding: 15,
        marginBottom: 5,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b45309',
        marginLeft: 6,
    },
    tipText: {
        fontSize: 13,
        color: '#92400e',
        lineHeight: 20,
    },
    navControlsRow: {
        flexDirection: 'row',
        padding: 20,
        justifyContent: 'space-between',
    },
    navBtnPrev: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#dfdfdf',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginRight: 10,
    },
    navBtnPrevText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#555',
    },
    navBtnNext: {
        flex: 1.2,
        backgroundColor: '#f95300',
        borderRadius: 8,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navBtnNextText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
    },
    navBtnDisabled: {
        opacity: 0.5,
    },
    navBtnTextDisabled: {
        color: '#aaa',
    },
    overviewSection: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        borderRadius: 16,
        marginHorizontal: 15,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    overviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridCard: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    gridCardActive: {
        borderColor: '#ff3d00',
        borderWidth: 1.5,
    },
    gridImg: {
        width: '100%',
        height: 90,
        backgroundColor: '#f0f0f0',
    },
    gridInfo: {
        padding: 10,
        backgroundColor: '#fffaf8',
    },
    gridName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    gridBadgeText: {
        fontSize: 11,
        color: '#888',
    },
    gridLiveIndicator: {
        backgroundColor: '#ff3d00',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 6,
    },
    gridLiveText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    }
});

export default RunTourScreen;
