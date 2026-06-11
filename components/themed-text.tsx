import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { serif } from '@/constants/retro';

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    type = 'default',
    ...rest
}: ThemedTextProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

    return (
        <Text
            style={[
                { color },
                type === 'default' ? styles.default : undefined,
                type === 'title' ? styles.title : undefined,
                type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
                type === 'subtitle' ? styles.subtitle : undefined,
                type === 'link' ? styles.link : undefined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: serif,
    },
    defaultSemiBold: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: serif,
        fontWeight: '700',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        fontFamily: serif,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 17,
        fontWeight: '700',
        fontFamily: serif,
        letterSpacing: 0.5,
    },
    link: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: serif,
        color: '#C4622D',
        textDecorationLine: 'underline',
    },
});
