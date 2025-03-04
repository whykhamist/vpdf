declare const _default: import("vue").DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<{
    scale: number;
    scales?: Array<{
        value?: number | string;
        show: boolean;
        label?: string;
    }>;
    disabled?: boolean;
}>, {
    scale: number;
    scales: () => ({
        value: number;
        show: boolean;
        label?: undefined;
    } | {
        show: boolean;
        value?: undefined;
        label?: undefined;
    } | {
        label: string;
        value: string;
        show: boolean;
    })[];
}>, {
    scales: import("vue").ComputedRef<{
        value?: number | string;
        show: boolean;
        label?: string;
    }[]>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:scale": (...args: any[]) => void;
    fitPage: (...args: any[]) => void;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<{
    scale: number;
    scales?: Array<{
        value?: number | string;
        show: boolean;
        label?: string;
    }>;
    disabled?: boolean;
}>, {
    scale: number;
    scales: () => ({
        value: number;
        show: boolean;
        label?: undefined;
    } | {
        show: boolean;
        value?: undefined;
        label?: undefined;
    } | {
        label: string;
        value: string;
        show: boolean;
    })[];
}>>> & {
    "onUpdate:scale"?: ((...args: any[]) => any) | undefined;
    onFitPage?: ((...args: any[]) => any) | undefined;
}, {
    scale: number;
    scales: Array<{
        value?: number | string;
        show: boolean;
        label?: string;
    }>;
}, {}>;
export default _default;
type __VLS_WithDefaults<P, D> = {
    [K in keyof Pick<P, keyof P>]: K extends keyof D ? __VLS_Prettify<P[K] & {
        default: D[K];
    }> : P[K];
};
type __VLS_Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
type __VLS_TypePropsToOption<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
