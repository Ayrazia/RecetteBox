import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import {ActivityIndicator, LogBox, Platform} from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { retro, serif } from '@/constants/retro';

export const unstable_settings = {
    anchor: '(tabs)',
};

if (Platform.OS === 'web') {
    LogBox.ignoreAllLogs(true);
}

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <Provider store={store}>
            <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack
                        screenOptions={{
                            headerStyle: { backgroundColor: retro.nav.bg },
                            headerTintColor: retro.nav.text,
                            headerTitleStyle: { fontFamily: serif, fontSize: 18 },
                        }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Retour'}} />
                    </Stack>
                    <StatusBar style="light" />
                </ThemeProvider>
            </PersistGate>
        </Provider>
    );
}
