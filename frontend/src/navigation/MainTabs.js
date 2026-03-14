import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ListScreen from '../screens/ListScreen';
import TourScreen from '../screens/TourScreen';
import MapScreen from '../screens/MapScreen';
import IntroScreen from '../screens/IntroScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Trang chủ') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Danh sách') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Tour') {
                        iconName = focused ? 'volume-high' : 'volume-high-outline';
                    } else if (route.name === 'Bản đồ') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'Giới thiệu') {
                        iconName = focused ? 'information-circle' : 'information-circle-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#f53d00',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Trang chủ" component={HomeScreen} />
            <Tab.Screen name="Danh sách" component={ListScreen} />
            <Tab.Screen name="Tour" component={TourScreen} />
            <Tab.Screen name="Bản đồ" component={MapScreen} />
            <Tab.Screen name="Giới thiệu" component={IntroScreen} />
        </Tab.Navigator>
    );
}
