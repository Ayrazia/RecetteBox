import { useLocalSearchParams, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    Image,
    StyleSheet,
    ActivityIndicator,
    View,
    Text,
    TouchableOpacity,
    Modal,
    Platform,
    Pressable, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { retro, serif } from '@/constants/retro';
import { ThemedText } from '@/components/themed-text';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addFavorite, removeFavorite } from '@/features/favoritesSlice';
import YoutubePlayer from "react-native-youtube-iframe";
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { MealDetail } from "@/interfaces/Meal";
import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useAudioPlayer } from 'expo-audio';

const alarmSource = require('@/assets/audio/SonnerieAlarme.mp3');

export default function MealScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const scheme = useColorScheme() ?? 'light';
    const c = retro[scheme];
    const dispatch = useAppDispatch();
    const favorites = useAppSelector(state => state.favorites.items);
    const isFav = favorites.some(f => f.idMeal === id);

    const [meal, setMeal] = useState<MealDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [playing, setPlaying] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [infoVisible, setInfoVisible] = useState(false);

    const [showPicker, setShowPicker] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState<number>(0);
    const [timerActive, setTimerActive] = useState(false);


    const formatSecondsToTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const parts = [];
        if (hours > 0) {
            parts.push(hours.toString().padStart(2, "0"));
        }
        parts.push(minutes.toString().padStart(2, "0"));
        parts.push(seconds.toString().padStart(2, "0"));

        return parts.join(":");
    };

    const onStateChange = useCallback((s: string) => {
        if (s === "ended") {
            setPlaying(false);
        }
    }, []);

    const getYoutubeId = (url?: string) => {
        if (!url || typeof url !== 'string' || !url.trim()) return "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : "";
    };

    useEffect(() => {
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
            .then(res => res.json())
            .then(data => setMeal(data.meals?.[0] ?? null))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (Platform.OS !== 'web') {
            if (isLocked) {
                activateKeepAwakeAsync();
            } else {
                deactivateKeepAwake();
            }
        }
        return () => {
            deactivateKeepAwake();
        };
    }, [isLocked]);

    const player = useAudioPlayer(alarmSource);

    useEffect(() => {
        let interval: number ;

        if (timerActive && secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft((prev) => prev - 1);
            }, 1000);
        } else if (secondsLeft === 0 && timerActive) {
            setTimerActive(false);

            if (player) {
                player.replace(alarmSource);
                player.play();
            }

            Alert.alert("Minuteur terminé !", "Le temps est écoulé.",
                [{ text: "OK",
                onPress: () => {
                player.replace("")
            }
            }]);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timerActive, secondsLeft, player]);

    const toggleFav = () => {
        if (!meal || isLocked) return;
        if (isFav) {
            dispatch(removeFavorite(meal.idMeal));
        } else {
            dispatch(addFavorite({ idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb }));
        }
    };

    const ingredients: string[] = [];
    if (meal) {
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient?.trim()) {
                const m = measure?.trim() ? `${measure.trim()}  ` : '';
                ingredients.push(`${m}${ingredient.trim()}`);
            }
        }
    }

    const youtubeId = meal ? getYoutubeId(meal.strYoutube) : "";

    return (
        <View style={styles.mainContainer}>
            <Stack.Screen
                options={{
                    title: meal?.strMeal ?? 'Recette',
                    headerRight: () => (
                        <Pressable
                            onPress={toggleFav}
                            style={{ marginRight: 4, opacity: isLocked ? 0.4 : 1 }}
                            disabled={isLocked}
                        >
                            <Ionicons
                                name={isFav ? 'heart' : 'heart-outline'}
                                size={24}
                                color={isFav ? retro.nav.accent : retro.nav.muted}
                            />
                        </Pressable>
                    ),
                }}
            />

            {loading ? (
                <View style={[styles.center, { backgroundColor: c.background }]}>
                    <ActivityIndicator size="large" color={c.accent} />
                </View>
            ) : error || !meal ? (
                <View style={[styles.center, { backgroundColor: c.background }]}>
                    <ThemedText>Recette introuvable</ThemedText>
                </View>
            ) : (
                <>
                    <ScrollView style={{ backgroundColor: c.background }}>
                        <Image source={{ uri: meal.strMealThumb }} style={styles.headerImage} />

                        <View style={[styles.content, { borderTopColor: c.border }]}>
                            <ThemedText type="title">{meal.strMeal}</ThemedText>

                            <View style={styles.badges}>
                                {!!meal.strCategory && (
                                    <View style={[styles.badge, { borderColor: c.border }]}>
                                        <Text style={[styles.badgeText, { color: c.accent }]}>
                                            {meal.strCategory}
                                        </Text>
                                    </View>
                                )}
                                {!!meal.strArea && (
                                    <View style={[styles.badge, { borderColor: c.border }]}>
                                        <Text style={[styles.badgeText, { color: c.textMuted }]}>
                                            {meal.strArea}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={[styles.divider, { borderColor: c.border }]} />

                            <Text style={[styles.sectionTitle, { color: c.accent }]}>— Ingrédients —</Text>
                            <View style={styles.ingredientsList}>
                                {ingredients.map((ing, i) => (
                                    <Text key={i} style={[styles.ingredient, { color: c.text }]}>
                                        ◆  {ing}
                                    </Text>
                                ))}
                            </View>

                            <View style={[styles.divider, { borderColor: c.border }]} />

                            <Text style={[styles.sectionTitle, { color: c.accent }]}>— Instructions —</Text>
                            <Text style={[styles.instructions, { color: c.text }]}>
                                {meal.strInstructions}
                            </Text>

                            {!!youtubeId && (
                                <View style={styles.videoContainer}>
                                    <YoutubePlayer
                                        height={200}
                                        play={playing}
                                        videoId={youtubeId}
                                        onChangeState={onStateChange}
                                    />
                                </View>
                            )}

                            <View style={[styles.divider, { borderColor: c.border }]} />

                            {/* Section Minuteur */}
                            <View style={{ alignItems: "center", marginVertical: 15 }}>
                                {secondsLeft > 0 ? (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setTimerActive(!timerActive)}
                                        style={{ alignItems: 'center', marginBottom: 15 }}
                                    >
                                        <Text style={{ color: c.text, fontSize: 48, fontWeight: '700', fontFamily: serif }}>
                                            {formatSecondsToTime(secondsLeft)}
                                        </Text>
                                        <Text style={{ color: c.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                                            {timerActive ? "⏸ Cliquer pour pauser" : "▶ Cliquer pour relancer"}
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => setShowPicker(true)}
                                >
                                    <Text
                                        style={{
                                            paddingVertical: 10,
                                            paddingHorizontal: 18,
                                            borderWidth: 1.5,
                                            borderRadius: 4,
                                            fontSize: 14,
                                            fontWeight: '700',
                                            fontFamily: serif,
                                            borderColor: c.border,
                                            color: c.accent,
                                            textTransform: 'uppercase',
                                            letterSpacing: 1
                                        }}>
                                        {secondsLeft > 0 ? "Modifier le minuteur 🔔" : "Régler un minuteur 🔔"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TimerPickerModal
                                closeOnOverlayPress
                                LinearGradient={LinearGradient}
                                modalProps={{
                                    overlayOpacity: 0.4,
                                }}
                                modalTitle="Régler le minuteur"
                                onCancel={() => setShowPicker(false)}
                                onConfirm={(pickedDuration) => {
                                    const h = pickedDuration.hours ?? 0;
                                    const m = pickedDuration.minutes ?? 0;
                                    const s = pickedDuration.seconds ?? 0;

                                    const totalSeconds = (h * 3600) + (m * 60) + s;

                                    if (totalSeconds > 0) {
                                        setSecondsLeft(totalSeconds);
                                        setTimerActive(true);
                                    }
                                    setShowPicker(false);
                                }}
                                setIsVisible={setShowPicker}
                                styles={{
                                    theme: "dark",
                                }}
                                visible={showPicker}
                            />
                        </View>
                    </ScrollView>

                    {isLocked && <View style={styles.overlay} />}

                    <View style={styles.floatingButtonContainer}>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[
                                    styles.lockButton,
                                    { backgroundColor: isLocked ? '#e63946' : c.accent, borderColor: c.border }
                                ]}
                                onPress={() => setIsLocked(!isLocked)}
                            >
                                <Ionicons
                                    name={isLocked ? "lock-closed" : "lock-open-outline"}
                                    size={18}
                                    color="#fff"
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.lockButtonText}>
                                    {isLocked ? "MODE CUISINE VERROUILLÉ" : "VERROUILLER L'ÉCRAN"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.infoButton, { backgroundColor: c.background, borderColor: c.border }]}
                                onPress={() => setInfoVisible(true)}
                            >
                                <Ionicons name="information-circle-outline" size={24} color={c.accent} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={infoVisible}
                        onRequestClose={() => setInfoVisible(false)}
                    >
                        <Pressable style={styles.modalOverlay} onPress={() => setInfoVisible(false)}>
                            <View style={[styles.modalContent, { backgroundColor: c.background, borderColor: c.border }]}>
                                <Text style={[styles.modalTitle, { color: c.accent }]}> Mode Cuisine </Text>
                                <Text style={[styles.modalText, { color: c.text }]}>
                                    En activant ce mode :{"\n\n"}
                                    <Text style={{ fontWeight: '700' }}>Écran toujours allumé :</Text> Votre téléphone ne se mettra pas en veille pendant que vous cuisinez.{"\n\n"}
                                    <Text style={{ fontWeight: '700' }}>Anti-fausses touches :</Text> Toutes les interactions sur la recette sont bloquées pour éviter les clics accidentels avec des mains mouillées ou pleines de farine.
                                </Text>

                                <TouchableOpacity
                                    style={[styles.closeModalButton, { backgroundColor: c.accent }]}
                                    onPress={() => setInfoVisible(false)}
                                >
                                    <Text style={styles.closeModalText}>COMPRIS !</Text>
                                </TouchableOpacity>
                            </View>
                        </Pressable>
                    </Modal>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerImage: { width: '100%', aspectRatio: 4 / 3 },
    content: {
        padding: 20,
        gap: 10,
        borderTopWidth: 3,
        paddingBottom: 130,
    },
    badges: { flexDirection: 'row', gap: 8, marginTop: 4 },
    badge: { paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1.5, borderRadius: 2 },
    badgeText: { fontSize: 12, fontFamily: serif, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    divider: { borderTopWidth: 1.5, borderStyle: 'dashed', marginVertical: 8 },
    sectionTitle: { fontSize: 15, fontFamily: serif, fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginBottom: 8 },
    ingredientsList: { gap: 5 },
    ingredient: { fontSize: 14, fontFamily: serif, lineHeight: 20 },
    instructions: { fontSize: 14, fontFamily: serif, lineHeight: 24, marginBottom: 15 },
    videoContainer: { marginTop: 10 },
    playButton: { padding: 12, borderRadius: 2, alignItems: 'center', marginTop: 8 },
    playButtonText: { color: '#fff', fontWeight: '700', fontFamily: serif, letterSpacing: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.08)', zIndex: 10 },

    floatingButtonContainer: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        zIndex: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    lockButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 14,
        borderWidth: 2,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    lockButtonText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 1 },
    infoButton: {
        padding: 11,
        borderWidth: 2,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 320,
        borderWidth: 3,
        borderRadius: 4,
        padding: 20,
        gap: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: serif,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 1,
    },
    modalText: {
        fontSize: 13,
        fontFamily: serif,
        lineHeight: 18,
    },
    closeModalButton: {
        paddingVertical: 12,
        borderRadius: 2,
        alignItems: 'center',
        marginTop: 5,
    },
    closeModalText: {
        color: '#fff',
        fontWeight: '700',
        letterSpacing: 1,
    }
});