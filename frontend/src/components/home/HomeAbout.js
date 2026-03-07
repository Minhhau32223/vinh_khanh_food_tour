import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeAbout = () => {
    return (
        <View style={styles.container}>
            <View style={styles.aboutCard}>
                <View style={styles.iconRow}>
                    <Ionicons name="information-circle-outline" size={24} color="#f53d00" />
                    <Text style={styles.title}>Về Phố Vĩnh Khánh</Text>
                </View>
                <Text style={styles.description}>
                    Phố Vĩnh Khánh Quận 4 là một trong những con phố ẩm thực nổi tiếng nhất Sài Gòn. Nơi đây hội tụ đầy đủ các món ăn đặc sản từ Bắc chí Nam, từ phở, bún bò, bánh mì đến cà phê và chè. Được biết đến với không khí sôi động, thân thiện và giá cả phải chăng, đây là điểm đến lý tưởng cho những ai muốn trải nghiệm văn hóa ẩm thực đường phố Sài Gòn.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        paddingBottom: 40,
    },
    aboutCard: {
        backgroundColor: '#fffcf9',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ffebd6',
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    description: {
        fontSize: 13,
        color: '#555',
        lineHeight: 20,
    }
});

export default HomeAbout;
