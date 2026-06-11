import { useEffect, useState } from 'react';
import {
    FlatList, ActivityIndicator, View, StyleSheet,
    Text, ScrollView, TextInput, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { retro, serif } from '@/constants/retro';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {fetchCategories} from '@/features/recipesSlice';
import { addFavorite, removeFavorite } from '@/features/favoritesSlice';
import { MealCard } from '@/components/MealCard';
import {addHistory} from "@/features/historySlice";
import {Meal} from "@/interfaces/Meal";

type FilterType = 'category' | 'name' | 'area' | 'ingredient'| 'random';

const FILTERS: { key: FilterType; label: string; icon: string }[] = [
    { key: 'category', label: 'Catégorie', icon: 'grid-outline' },
    { key: 'name',     label: 'Nom',       icon: 'search-outline' },
    { key: 'area',     label: 'Pays',      icon: 'earth-outline' },
    { key: 'ingredient', label: 'Ingrédient', icon: 'leaf-outline' },
    { key: 'random', label: 'Recette Aléatoire', icon: 'shuffle-outline' },
];

export default function HomeScreen() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const scheme = useColorScheme() ?? 'light';
    const c = retro[scheme];

    const { categories, loading: categoriesLoading } = useAppSelector(state => state.recipes);
    const favorites = useAppSelector(state => state.favorites.items);

    const [filterType, setFilterType] = useState<FilterType>('category');
    const [selectedChip, setSelectedChip] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [areas, setAreas] = useState<{ strArea: string; strCountry: string }[]>([]);
    const [areasLoading, setAreasLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchCategories());
        setAreasLoading(true);
        fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list')
            .then(r => r.json())
            .then(d => {
                const seen = new Set<string>();
                const unique = (d.meals ?? []).filter((m: any) => {
                    if (seen.has(m.strCountry)) return false;
                    seen.add(m.strCountry);
                    return true;
                });
                setAreas(unique.map((m: any) => ({ strArea: m.strArea, strCountry: m.strCountry })));
            })
            .finally(() => setAreasLoading(false));
    }, []);

    useEffect(() => {
        setSelectedChip(null);
        setQuery('');
        setResults([]);
        setError(null);
    }, [filterType]);

    const fetchByChip = (value: string) => {
        setSelectedChip(value);
        setLoading(true);
        setError(null);
        const param = filterType === 'category'
            ? `c=${encodeURIComponent(value)}`
            : `a=${encodeURIComponent(value)}`;
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?${param}`)
            .then(r => r.json())
            .then(d => setResults(d.meals ?? []))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (filterType !== 'random') return;
        setLoading(true);
        setError(null);
        const url = `https://www.themealdb.com/api/json/v1/1/random.php`;
        fetch(url)
            .then(r => r.json())
            .then(d => setResults(d.meals ?? []))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [filterType]);

    useEffect(() => {
        if (filterType !== 'name' && filterType !== 'ingredient') return;
        if (!query.trim()) { setResults([]); return; }
        const timer = setTimeout(() => {
            setLoading(true);
            setError(null);
            const url = filterType === 'name'
                ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
                : `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`;
            fetch(url)
                .then(r => r.json())
                .then(d => setResults(d.meals ?? []))
                .catch(e => setError(e.message))
                .finally(() => setLoading(false));
        }, 500);
        return () => clearTimeout(timer);
    }, [query, filterType]);

    const toggleFav = (meal: Meal) => {
        if (favorites.some(f => f.idMeal === meal.idMeal)) {
            dispatch(removeFavorite(meal.idMeal));
        } else {
            dispatch(addFavorite({ idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb }));
        }
    };

    const categoryChips = [...new Set(categories.map(cat => cat.strCategory))];
    const chipsLoading = filterType === 'category' ? categoriesLoading : areasLoading;

    const emptyHint =
        filterType === 'category'   ? 'Sélectionnez une catégorie' :
        filterType === 'area'       ? 'Sélectionnez un pays' :
        filterType === 'name'       ? 'Entrez un nom de recette' :
        filterType === 'ingredient' ? 'Entrez un ingrédient' :
        filterType === 'random'     ? 'Appuyez sur le champ et entrez du texte pour générer des recettes aléatoires' :
        'Aucun résultat trouvé';

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[styles.filterBar, { borderBottomColor: c.border }]}
                contentContainerStyle={styles.filterBarContent}>
                {FILTERS.map(f => {
                    const active = filterType === f.key;
                    return (
                        <Pressable
                            key={f.key}
                            onPress={() => setFilterType(f.key)}
                            style={[
                                styles.filterTab,
                                { borderColor: c.border },
                                active && { backgroundColor: c.accent, borderColor: c.accent },
                            ]}>
                            <Ionicons
                                name={f.icon as any}
                                size={14}
                                color={active ? '#FFFAF2' : c.textMuted}
                            />
                            <Text style={[styles.filterTabText, { color: active ? '#FFFAF2' : c.text }]}>
                                {f.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            {filterType === 'category' && (
                <View style={[styles.chipRow, { borderBottomColor: c.border }]}>
                    {chipsLoading ? (
                        <ActivityIndicator color={c.accent} style={{ padding: 10 }} />
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chipRowContent}>
                            {categoryChips.map(chip => {
                                const active = selectedChip === chip;
                                return (
                                    <Pressable
                                        key={chip}
                                        onPress={() => fetchByChip(chip)}
                                        style={[
                                            styles.chip,
                                            { borderColor: c.border },
                                            active && { backgroundColor: c.accent, borderColor: c.accent },
                                        ]}>
                                        <Text style={[styles.chipText, { color: active ? '#FFFAF2' : c.text }]}>
                                            {chip}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>
            )}

            {filterType === 'area' && (
                <View style={[styles.chipRow, { borderBottomColor: c.border }]}>
                    {chipsLoading ? (
                        <ActivityIndicator color={c.accent} style={{ padding: 10 }} />
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chipRowContent}>
                            {areas.map(area => {
                                const active = selectedChip === area.strCountry;
                                return (
                                    <Pressable
                                        key={area.strCountry}
                                        onPress={() => fetchByChip(area.strCountry)}
                                        style={[
                                            styles.chip,
                                            { borderColor: c.border },
                                            active && { backgroundColor: c.accent, borderColor: c.accent },
                                        ]}>
                                        <Text style={[styles.chipText, { color: active ? '#FFFAF2' : c.text }]}>
                                            {area.strCountry}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>
            )}

            {(filterType === 'name' || filterType === 'ingredient') && (
                <View style={[styles.searchRow, { borderBottomColor: c.border }]}>
                    <View style={[styles.searchBox, { borderColor: c.border, backgroundColor: c.surface }]}>
                        <Ionicons name="search" size={16} color={c.textMuted} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder={
                                filterType === 'name'
                                    ? 'Rechercher une recette…'
                                    : 'Nom d\'un ingrédient…'
                            }
                            placeholderTextColor={c.textMuted}
                            style={[styles.searchInput, { color: c.text }]}
                            autoCorrect={false}
                            autoCapitalize="none"
                        />
                        {query.length > 0 && (
                            <Pressable onPress={() => setQuery('')} hitSlop={8}>
                                <Ionicons name="close-circle" size={16} color={c.textMuted} />
                            </Pressable>
                        )}
                    </View>
                </View>
            )}

            {(filterType === 'random' ) && (
                <View>
                    <Pressable onPress={() => setQuery('')} hitSlop={8}>
                        <Text style={styles.filterTabText}></Text>
                    </Pressable>
                </View>
            )}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={c.accent} />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={[styles.hint, { color: c.text }]}>Erreur : {error}</Text>
                </View>
            ) : results.length > 0 ? (
                <FlatList
                    data={results}
                    keyExtractor={item => item.idMeal}
                    contentContainerStyle={styles.list}
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
                />
            ) : (
                <View style={styles.center}>
                    <Text style={[styles.hint, { color: c.textMuted }]}>{emptyHint}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    filterBar: { borderBottomWidth: 2, maxHeight: 58 },
    filterBarContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 2,
        borderWidth: 1.5,
    },
    filterTabText: { fontFamily: serif, fontSize: 13, fontWeight: '700' },

    chipRow: { borderBottomWidth: 1.5, minHeight: 50, justifyContent: 'center' },
    chipRowContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
    chip: {
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderRadius: 2,
        borderWidth: 1.5,
    },
    chipText: { fontFamily: serif, fontSize: 13, fontWeight: '600' },

    searchRow: { padding: 12, borderBottomWidth: 1.5 },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: 2,
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 8,
    },
    searchInput: { flex: 1, fontFamily: serif, fontSize: 14, padding: 0 },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    list: { padding: 14 },
    hint: { fontFamily: serif, fontSize: 14, textAlign: 'center' },
});
