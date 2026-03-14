import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabs from './MainTabs';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import CreateTourScreen from '../screens/CreateTourScreen';
import RunTourScreen from '../screens/RunTourScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
            <Stack.Screen name="CreateTour" component={CreateTourScreen} />
            <Stack.Screen name="RunTour" component={RunTourScreen} />
        </Stack.Navigator>
    );
}
