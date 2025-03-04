export declare function useSizeObserver(cb?: (elements: Array<ResizeObserverEntry>) => void, delay?: number): {
    observe: (el: HTMLElement, options?: ResizeObserverOptions) => void;
    unobserve: () => void;
};
