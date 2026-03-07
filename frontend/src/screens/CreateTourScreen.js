import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Mock data
const POI_DATA = [
    {
        id: '1',
        name: 'Phở Lệ',
        badge: 'Phở',
        address: '123 Vĩnh Khánh, P.10, Q.4',
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
        id: '2',
        name: 'Bánh Mì Huynh Hoa',
        badge: 'Bánh Mì',
        address: '187 Vĩnh Khánh, P.10, Q.4',
        image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e6b587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
        id: '3',
        name: 'Cà Phê Sài Gòn',
        badge: 'Cà Phê',
        address: '256 Vĩnh Khánh, P.10, Q.4',
        image: 'https://images.unsplash.com/photo-1579560875955-e51c22bc756c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
        id: '4',
        name: 'Gỏi Cuốn Bà Năm',
        badge: 'Ăn vặt',
        address: '320 Vĩnh Khánh, P.10, Q.4',
        image: 'https://images.unsplash.com/photo-1606550993096-7b447614d115?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    }
];

const CreateTourScreen = ({ navigation }) => {
    const [tourName, setTourName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPois, setSelectedPois] = useState([]);

    const toggleSelectPoi = (id) => {
        if (selectedPois.includes(id)) {
            setSelectedPois(selectedPois.filter(poiId => poiId !== id));
        } else {
            if (selectedPois.length < 6) {
                setSelectedPois([...selectedPois, id]);
            }
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Tạo Tour Mới</Text>
                    <Text style={styles.headerSubtitle}>Chọn và sắp xếp điểm dừng</Text>
                </View>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.contentBody}>

                    {/* Form Section */}
                    <View style={styles.formCard}>
                        <Text style={styles.inputLabel}>Tên tour <Text style={{ color: '#ff3d00' }}>*</Text></Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="VD: Tour Sáng Thơm Ngon"
                            placeholderTextColor="#999"
                            value={tourName}
                            onChangeText={setTourName}
                        />

                        <Text style={styles.inputLabel}>Mô tả (tùy chọn)</Text>
                        <TextInput
                            style={[styles.textInput, styles.textArea]}
                            placeholder="Mô tả ngắn về tour của bạn..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    {/* List POIs Section */}
                    <Text style={styles.sectionHeading}>Chọn điểm dừng ({selectedPois.length}/6)</Text>

                    {POI_DATA.map((poi) => {
                        const isSelected = selectedPois.includes(poi.id);
                        return (
                            <TouchableOpacity
                                key={poi.id}
                                style={[styles.poiCard, isSelected && styles.poiCardSelected]}
                                onPress={() => toggleSelectPoi(poi.id)}
                                activeOpacity={0.8}
                            >
                                <Image source={{ uri: poi.image }} style={styles.poiImage} />
                                <View style={styles.poiInfo}>
                                    <Text style={styles.poiName}>{poi.name}</Text>
                                    <View style={styles.badgeContainer}>
                                        <Text style={styles.badgeText}>{poi.badge}</Text>
                                    </View>
                                    <Text style={styles.poiAddress}>{poi.address}</Text>
                                </View>
                                <View style={styles.radioContainer}>
                                    {isSelected ? (
                                        <Ionicons name="checkmark-circle" size={28} color="#ff3d00" />
                                    ) : (
                                        <View style={styles.radioEmpty} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        )
                    })}

                    <View style={{ height: 80 }} />
                </View>
            </ScrollView>

            {/* Floating Save Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.saveButton, selectedPois.length === 0 && styles.saveButtonDisabled]}
                    disabled={selectedPois.length === 0}
                >
                    {selectedPois.length > 0 && <Ionicons name="checkmark" size={20} color="white" style={{ marginRight: 8 }} />}
                    <Text style={styles.saveButtonText}>Lưu Tour ({selectedPois.length} điểm)</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ff512f', // gradient-like base color
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        backgroundColor: '#ff512f', // matching top
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 25,
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
        color: '#ffdfd4',
        fontSize: 14,
        marginTop: 3,
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    contentBody: {
        padding: 20,
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#eaeaea',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#f2f4f7',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 15,
        color: '#333',
        marginBottom: 15,
    },
    textArea: {
        height: 80,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    poiCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eaeaea',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    poiCardSelected: {
        borderColor: '#ff3d00',
        borderWidth: 1.5,
    },
    poiImage: {
        width: 65,
        height: 65,
        borderRadius: 8,
    },
    poiInfo: {
        flex: 1,
        marginLeft: 15,
    },
    poiName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    badgeContainer: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#333',
    },
    poiAddress: {
        fontSize: 13,
        color: '#777',
    },
    radioContainer: {
        marginLeft: 10,
    },
    radioEmpty: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ccc',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(245, 247, 250, 0.9)',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'transparent',
    },
    saveButton: {
        backgroundColor: '#ff8a66',
        borderRadius: 8,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ff3d00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    saveButtonDisabled: {
        backgroundColor: '#ffbca6',
        shadowOpacity: 0,
        elevation: 0,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default CreateTourScreen;
