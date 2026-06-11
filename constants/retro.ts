import { Platform } from 'react-native';

export const retro = {
    light: {
        background: '#F4ECD8',
        surface: '#FFFAF2',
        text: '#2C1A0E',
        textMuted: '#7A5C3A',
        accent: '#C4622D',
        border: '#C4A875',
    },
    dark: {
        background: '#1E150A',
        surface: '#2A1E12',
        text: '#F4E4C1',
        textMuted: '#C4A882',
        accent: '#E8855A',
        border: '#6B4E2A',
    },
    nav: {
        bg: '#3D2B1F',
        text: '#F4E4C1',
        muted: '#C4A882',
        accent: '#E8855A',
        border: '#C4A875',
    },
} as const;

export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
