import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { retro, serif } from '@/constants/retro';
import { ThemedText } from './themed-text';
import {MealCardProps} from "@/interfaces/Meal";



export const MealCard = ({ meal, onPress, isFavorite, onToggleFavorite }: MealCardProps) => {
    const scheme = useColorScheme() ?? 'light';
    const c = retro[scheme];

    return (
        <Pressable onPress={onPress}>
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Image source={{ uri: meal.strMealThumb }} style={styles.image} contentFit="cover" />
                <View style={styles.info}>
                    <ThemedText style={styles.title} numberOfLines={2}>
                        {meal.strMeal}
                    </ThemedText>
                </View>
                {onToggleFavorite && (
                    <Pressable onPress={onToggleFavorite} hitSlop={8}>
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={24}
                            color={isFavorite ? c.accent : c.border}
                        />
                    </Pressable>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderRadius: 4,
        padding: 12,
        marginBottom: 14,
        borderWidth: 2,
        alignItems: 'center',
        shadowColor: '#2C1A0E',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 0,
        elevation: 4,
    },
    image: {
        width: 76,
        height: 76,
        borderRadius: 2,
        backgroundColor: '#E8DCC4',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 16,
        fontFamily: serif,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
