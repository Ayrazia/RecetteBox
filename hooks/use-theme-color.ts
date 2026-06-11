import { useColorScheme } from '@/hooks/use-color-scheme';
import { retro } from '@/constants/retro';

export type ColorName = keyof typeof retro.light;

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: ColorName
): string {
    const theme = useColorScheme() ?? 'light';
    return props[theme] ?? retro[theme][colorName];
}
