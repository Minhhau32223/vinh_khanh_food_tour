import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import ListScreen from './src/screens/ListScreen';
import TourScreen from './src/screens/TourScreen';
import MapScreen from './src/screens/MapScreen';
import IntroScreen from './src/screens/IntroScreen';
import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';
import CreateTourScreen from './src/screens/CreateTourScreen';
import RunTourScreen from './src/screens/RunTourScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
        <Stack.Screen name="CreateTour" component={CreateTourScreen} />
        <Stack.Screen name="RunTour" component={RunTourScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
