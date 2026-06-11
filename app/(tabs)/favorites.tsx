import { FlatList, View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { retro, serif } from '@/constants/retro';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { removeFavorite } from '@/features/favoritesSlice';
import { MealCard } from '@/components/MealCard';

export default function FavoritesScreen() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const scheme = useColorScheme() ?? 'light';
    const c = retro[scheme];
    const favorites = useAppSelector(state => state.favorites.items);

    if (!favorites.length) {
        return (
            <View style={[styles.center, { backgroundColor: c.background }]}>
                <Text style={[styles.emptyIcon, { color: c.border }]}>♥</Text>
                <Text style={[styles.empty, { color: c.text }]}>Aucun favori pour l&#39;instant</Text>
                <Text style={[styles.hint, { color: c.textMuted }]}>
                    Appuyez sur ♥ dans une recette pour l&#39;ajouter
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={favorites}
            keyExtractor={item => item.idMeal}
            style={{ backgroundColor: c.background }}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <MealCard
                    meal={item}
                    onPress={() => router.push(`/meal/${item.idMeal}` as any)}
                    isFavorite
                    onToggleFavorite={() => dispatch(removeFavorite(item.idMeal))}
                />
            )}
        />
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
    list: { padding: 14, paddingTop: 16 },
    emptyIcon: { fontSize: 48 },
    empty: { fontSize: 16, fontFamily: serif, fontWeight: '700' },
    hint: { fontSize: 13, fontFamily: serif },
});
