import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, ActivityIndicator, View, Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { retro, serif } from '@/constants/retro';
import { ThemedText } from '@/components/themed-text';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addFavorite, removeFavorite } from '@/features/favoritesSlice';
import {Meal} from "@/interfaces/Meal";

export default function CategoryScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const scheme = useColorScheme() ?? 'light';
    const c = retro[scheme];
    const dispatch = useAppDispatch();
    const favorites = useAppSelector(state => state.favorites.items);

    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${id}`)
            .then(res => res.json())
            .then(data => setMeals(data.meals ?? []))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    const isFav = (mealId: string) => favorites.some(f => f.idMeal === mealId);

    const toggleFav = (meal: Meal) => {
        if (isFav(meal.idMeal)) {
            dispatch(removeFavorite(meal.idMeal));
        } else {
            dispatch(addFavorite({ idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb }));
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: id as string }} />
            {loading ? (
                <View style={[styles.center, { backgroundColor: c.background }]}>
                    <ActivityIndicator size="large" color={c.accent} />
                </View>
            ) : error ? (
                <View style={[styles.center, { backgroundColor: c.background }]}>
                    <ThemedText>Erreur : {error}</ThemedText>
                </View>
            ) : meals.length === 0 ? (
                <View style={[styles.center, { backgroundColor: c.background }]}>
                    <ThemedText>Aucun plat trouvé</ThemedText>
                </View>
            ) : (
                <FlatList
                    data={meals}
                    keyExtractor={item => item.idMeal}
                    numColumns={2}
                    style={{ backgroundColor: c.background }}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <Pressable
                            style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
                            onPress={() => router.push(`/meal/${item.idMeal}` as any)}>
                            <Image source={{ uri: item.strMealThumb }} style={styles.image} contentFit="cover" />
                            <Text
                                style={[styles.name, { color: c.text }]}
                                numberOfLines={2}>
                                {item.strMeal}
                            </Text>
                            <Pressable
                                onPress={() => toggleFav(item)}
                                style={[styles.heart, { backgroundColor: 'rgba(30,15,5,0.45)' }]}
                                hitSlop={8}>
                                <Ionicons
                                    name={isFav(item.idMeal) ? 'heart' : 'heart-outline'}
                                    size={18}
                                    color={isFav(item.idMeal) ? '#E8855A' : '#F4E4C1'}
                                />
                            </Pressable>
                        </Pressable>
                    )}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 10 },
    card: {
        flex: 1,
        margin: 6,
        borderRadius: 4,
        borderWidth: 2,
        overflow: 'hidden',
        shadowColor: '#2C1A0E',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 0,
        elevation: 4,
    },
    image: { width: '100%', aspectRatio: 1 },
    name: {
        padding: 8,
        fontSize: 13,
        fontFamily: serif,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 18,
    },
    heart: {
        position: 'absolute',
        top: 6,
        right: 6,
        borderRadius: 14,
        padding: 4,
    },
});
