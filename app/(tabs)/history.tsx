import React, { useEffect, useState } from 'react';
import { FlatList, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // Correction de l'import du router
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { retro, serif } from '@/constants/retro';
import { MealCard } from '@/components/MealCard';
import { addHistory } from '@/features/historySlice';
import { addFavorite, removeFavorite } from '@/features/favoritesSlice';
import {Meal} from "@/interfaces/Meal";



export default function History() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const scheme = useColorScheme() ?? 'light';
    const c = retro[scheme];

    const historyItems = useAppSelector(state => state.history.items);
    const favorites = useAppSelector(state => state.favorites.items);

    const [results, setResults] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!historyItems || historyItems.length === 0) {
            setResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        const fetchPromises = historyItems.map((item: any) =>
            fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${item.idRecipes}`)
                .then(r => r.json())
                .then(d => d.meals ? d.meals[0] : null)
                .catch(() => null)
        );

        Promise.all(fetchPromises)
            .then(meals => {
                const validMeals = meals.filter((m): m is Meal => m !== null);
                setResults(validMeals);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));

    }, [historyItems]);

    const toggleFav = (meal: Meal) => {
        if (favorites.some(f => f.idMeal === meal.idMeal)) {
            dispatch(removeFavorite(meal.idMeal));
        } else {
            dispatch(addFavorite({ idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb }));
        }
    };

    if (loading && results.length === 0) {
        return (
            <View style={[styles.center, { backgroundColor: c.background }]}>
                <ActivityIndicator size="large" color={c.accent} />
            </View>
        );
    }
    if (error) {
        return (
            <View style={[styles.center, { backgroundColor: c.background }]}>
                <Text style={{ color: c.text, fontFamily: serif }}>Erreur : {error}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={results}
            keyExtractor={item => item.idMeal}
            contentContainerStyle={[styles.list, { backgroundColor: c.background }]}
            renderItem={({ item }) => (
                <MealCard
                    meal={item}
                    onPress={() => {
                        dispatch(addHistory({
                            idRecipes: item.idMeal,
                            strRecipes: item.strMeal,
                            strRecipesThumb: item.strMealThumb
                        }));
                        router.push(`/meal/${item.idMeal}`);
                    }}
                    isFavorite={favorites.some(f => f.idMeal === item.idMeal)}
                    onToggleFavorite={() => toggleFav(item)}
                />
            )}
            ListEmptyComponent={
                <View style={styles.center}>
                    <Text style={{ color: c.textMuted, fontFamily: serif }}>Aucun historique de recherche</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    list: { padding: 16, minHeight: '100%' }
});