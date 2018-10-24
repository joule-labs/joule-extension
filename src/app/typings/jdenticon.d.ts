declare interface JdenticonConfig {
    hues?: string[];
    lightness?: {
        color?: number[];
        grayscale?: number[];
    };
    saturation?: {
        color?: number;
        grayscale?: number;
    };
    /* #rgb, #rgba, #rrggbb, #rrggbbaa */
    backColor?: string;
    replaceMode?: "once" | "never" | "observe";
}

declare module 'jdenticon' {
    export function toSvg(hashOrValue: string | any, size: number, padding?: number): string;

    export function toPng(hashOrValue: string | any, size: number, padding?: number): Buffer

    export let config: JdenticonConfig;

    export const version: string;
}