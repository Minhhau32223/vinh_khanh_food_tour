import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const POIS = [
    { id: '1', title: 'Phở Lệ', type: 'Phở', desc: '123 Vĩnh Khánh, P.10, Q.4', status: 'Đang mở cửa', lat: 10.7600, lng: 106.7000 },
    { id: '2', title: 'Bánh Mì Huynh Hoa', type: 'Bánh Mì', desc: '187 Vĩnh Khánh, P.10, Q.4', status: 'Sắp mở cửa', lat: 10.7620, lng: 106.7020 },
    { id: '3', title: 'Cà Phê Sài Gòn', type: 'Cà Phê', desc: '256 Vĩnh Khánh, P.10, Q.4', status: 'Đang mở cửa', lat: 10.7580, lng: 106.6980 },
];

const MapScreen = () => {
    const [selectedPoi, setSelectedPoi] = useState(null);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Bản đồ</Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Ionicons name="filter-outline" size={20} color="#333" />
                        <Text style={styles.filterText}>Lọc</Text>
                    </TouchableOpacity>
                </View>

                {/* Map Area */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 10.7600,
                            longitude: 106.7000,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        {POIS.map((poi) => (
                            <Marker
                                key={poi.id}
                                coordinate={{ latitude: poi.lat, longitude: poi.lng }}
                                onPress={() => setSelectedPoi(poi)}
                            >
                                <View style={[styles.marker, selectedPoi?.id === poi.id && styles.markerSelected]}>
                                    <View style={styles.markerInner} />
                                </View>
                            </Marker>
                        ))}
                    </MapView>

                    {/* Map Controls */}
                    <View style={styles.mapControls}>
                        <TouchableOpacity style={styles.controlButton}>
                            <Ionicons name="navigate" size={20} color="#333" />
                        </TouchableOpacity>
                        <View style={styles.zoomControls}>
                            <TouchableOpacity style={styles.zoomButton}>
                                <Ionicons name="add" size={20} color="#333" />
                            </TouchableOpacity>
                            <View style={styles.zoomDivider} />
                            <TouchableOpacity style={styles.zoomButton}>
                                <Ionicons name="remove" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Legend */}
                    <View style={styles.legend}>
                        <Text style={styles.legendTitle}>Chú thích</Text>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#e60000' }]} />
                            <Text style={styles.legendText}>Địa điểm</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#f53d00' }]} />
                            <Text style={styles.legendText}>Đang chọn</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Panel */}
                <View style={styles.bottomPanel}>
                    <View style={styles.panelHandle} />

                    <TouchableOpacity style={styles.selectionPlaceholder}>
                        <Ionicons name="location-outline" size={24} color="#888" />
                        <Text style={styles.selectionText}>Chọn một địa điểm trên bản đồ</Text>
                    </TouchableOpacity>

                    <Text style={styles.panelTitle}>Tất cả địa điểm (6)</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {POIS.map((poi) => (
                            <TouchableOpacity
                                key={poi.id}
                                style={[styles.poiCard, selectedPoi?.id === poi.id && styles.poiCardActive]}
                                onPress={() => setSelectedPoi(poi)}
                            >
                                <View style={styles.poiIconBox}>
                                    <Ionicons name="location-outline" size={20} color="#f53d00" />
                                </View>
                                <View style={styles.poiInfo}>
                                    <Text style={styles.poiTitle}>{poi.title}</Text>
                                    <Text style={styles.poiDesc}>{poi.desc}</Text>
                                    <View style={styles.poiTags}>
                                        <View style={styles.tagBase}>
                                            <Text style={styles.tagText}>{poi.type}</Text>
                                        </View>
                                        <Text style={styles.statusText}>{poi.status}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        zIndex: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    filterText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#333',
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    marker: {
        width: 24,
        height: 32,
        backgroundColor: '#e60000',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerSelected: {
        backgroundColor: '#f53d00',
        transform: [{ scale: 1.2 }],
    },
    markerInner: {
        width: 8,
        height: 8,
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    mapControls: {
        position: 'absolute',
        top: 20,
        right: 15,
    },
    controlButton: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    zoomControls: {
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    zoomButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomDivider: {
        height: 1,
        backgroundColor: '#eee',
        marginHorizontal: 10,
    },
    legend: {
        position: 'absolute',
        bottom: 20,
        left: 15,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        color: '#555',
    },
    bottomPanel: {
        height: '40%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    panelHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 15,
    },
    selectionPlaceholder: {
        backgroundColor: '#f9f9f9',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    selectionText: {
        color: '#666',
        marginLeft: 10,
        fontSize: 14,
    },
    panelTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    poiCard: {
        flexDirection: 'row',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 10,
    },
    poiCardActive: {
        borderColor: '#f53d00',
        backgroundColor: '#fff5f2',
    },
    poiIconBox: {
        marginRight: 15,
        marginTop: 2,
    },
    poiInfo: {
        flex: 1,
    },
    poiTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    poiDesc: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    poiTags: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagBase: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        marginRight: 10,
    },
    tagText: {
        fontSize: 10,
        color: '#555',
    },
    statusText: {
        fontSize: 11,
        color: '#00cc00',
        fontWeight: '500',
    }
});

export default MapScreen;
