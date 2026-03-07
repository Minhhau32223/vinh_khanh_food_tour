import React from 'react';
import { StyleSheet, ScrollView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import HomeHeader from '../components/home/HomeHeader';
import HomeBanner from '../components/home/HomeBanner';
import HomeMenu from '../components/home/HomeMenu';
import HomeHighlight from '../components/home/HomeHighlight';
import HomeAbout from '../components/home/HomeAbout';

const HomeScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <HomeHeader />
                <HomeBanner />

                <HomeMenu />

                <HomeHighlight />

                <HomeAbout />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#e60000', // Matches the red header to cover top notch
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: '#faf8f5',
    },
});

export default HomeScreen;
