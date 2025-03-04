import { PropType } from "vue";
declare function __VLS_template(): {
    prepend?(_: {}): any;
    append?(_: {}): any;
};
declare const __VLS_component: import("vue").DefineComponent<{
    page: {
        type: NumberConstructor;
        default: number;
    };
    pages: {
        type: NumberConstructor;
        default: number;
    };
    scale: {
        type: NumberConstructor;
        default: number;
    };
    rotation: {
        type: NumberConstructor;
        default: number;
        validator: (val: number) => boolean;
    };
    mode: {
        type: PropType<"vertical" | "horizontal">;
        default: string;
    };
    sidebar: {
        type: BooleanConstructor;
        default: boolean;
    };
    loading: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}, {
    scales: import("vue").ComputedRef<any>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:page": (...args: any[]) => void;
    "update:scale": (...args: any[]) => void;
    fitPage: (...args: any[]) => void;
    "update:mode": (...args: any[]) => void;
    "update:sidebar": (...args: any[]) => void;
    "update:rotation": (...args: any[]) => void;
}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    page: {
        type: NumberConstructor;
        default: number;
    };
    pages: {
        type: NumberConstructor;
        default: number;
    };
    scale: {
        type: NumberConstructor;
        default: number;
    };
    rotation: {
        type: NumberConstructor;
        default: number;
        validator: (val: number) => boolean;
    };
    mode: {
        type: PropType<"vertical" | "horizontal">;
        default: string;
    };
    sidebar: {
        type: BooleanConstructor;
        default: boolean;
    };
    loading: {
        type: BooleanConstructor;
        default: boolean;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & {
    "onUpdate:page"?: ((...args: any[]) => any) | undefined;
    "onUpdate:scale"?: ((...args: any[]) => any) | undefined;
    onFitPage?: ((...args: any[]) => any) | undefined;
    "onUpdate:mode"?: ((...args: any[]) => any) | undefined;
    "onUpdate:sidebar"?: ((...args: any[]) => any) | undefined;
    "onUpdate:rotation"?: ((...args: any[]) => any) | undefined;
}, {
    page: number;
    scale: number;
    rotation: number;
    pages: number;
    disabled: boolean;
    mode: "vertical" | "horizontal";
    sidebar: boolean;
    loading: boolean;
}, {}>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, ReturnType<typeof __VLS_template>>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
