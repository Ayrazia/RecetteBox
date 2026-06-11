import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { retro, serif } from '@/constants/retro';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: retro.nav.bg,
                    borderTopColor: retro.nav.border,
                    borderTopWidth: 2,
                },
                tabBarActiveTintColor: retro.nav.accent,
                tabBarInactiveTintColor: retro.nav.muted,
                headerStyle: { backgroundColor: retro.nav.bg },
                headerTintColor: retro.nav.text,
                headerTitleStyle: {
                    fontFamily: serif,
                    letterSpacing: 1.5,
                    fontSize: 18,
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Recettes',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="restaurant-outline" size={26} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Favoris',
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="heart" size={26} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
            name="history"
            options={{
                title: 'Historique',
                tabBarIcon: ({ color }) => (
                    <Ionicons name="time-outline" size={26} color={color} />
                ),
            }}
            />
        </Tabs>
    );
}
