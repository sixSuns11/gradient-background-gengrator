import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function colorToParam(color: string): string {
    if (color.startsWith('#')) {
        return 'hex_' + color.slice(1);
    }
    return color;
}

export function paramToColor(param: string): string {
    if (param.startsWith('hex_')) {
        return '#' + param.slice(4);
    }
    return param;
}

export interface HSL {
    h: number;
    s: number;
    l: number;
}

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export function hexToRgb(hex: string): RGB {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
}

export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max === min) {
        h = 0;
        s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

export function hexToHsl(hex: string): HSL {
    const rgb = hexToRgb(hex);
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

export function hslToHex(h: number, s: number, l: number): string {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export function getComplementaryColor(hex: string): string {
    const hsl = hexToHsl(hex);
    const complementaryH = (hsl.h + 180) % 360;
    return hslToHex(complementaryH, hsl.s, hsl.l);
}

export function getAnalogousColors(hex: string): string[] {
    const hsl = hexToHsl(hex);
    const colors: string[] = [];
    for (let i = -30; i <= 30; i += 30) {
        if (i !== 0) {
            const newH = (hsl.h + i + 360) % 360;
            colors.push(hslToHex(newH, hsl.s, hsl.l));
        }
    }
    return colors;
}

export function getTriadicColors(hex: string): string[] {
    const hsl = hexToHsl(hex);
    return [
        hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
    ];
}

export function getSplitComplementaryColors(hex: string): string[] {
    const hsl = hexToHsl(hex);
    return [
        hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l)
    ];
}

export function getMonochromaticColors(hex: string): string[] {
    const hsl = hexToHsl(hex);
    const colors: string[] = [];
    for (let i = 20; i <= 80; i += 20) {
        if (Math.abs(i - hsl.l) > 10) {
            colors.push(hslToHex(hsl.h, hsl.s, i));
        }
    }
    return colors;
}

export type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'monochromatic';

export function getRecommendedColors(hex: string, type: HarmonyType = 'complementary'): string[] {
    switch (type) {
        case 'complementary':
            return [getComplementaryColor(hex)];
        case 'analogous':
            return getAnalogousColors(hex);
        case 'triadic':
            return getTriadicColors(hex);
        case 'split-complementary':
            return getSplitComplementaryColors(hex);
        case 'monochromatic':
            return getMonochromaticColors(hex);
        default:
            return [getComplementaryColor(hex)];
    }
}