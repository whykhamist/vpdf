import { ref } from "vue";

export function useSizeObserver(
  cb: (elements: Array<ResizeObserverEntry>) => void,
  delay: number = 100,
) {
  const timer = ref();
  const observed = ref<HTMLElement>();
  const observer = new ResizeObserver(
    (elements: Array<ResizeObserverEntry>) => {
      requestAnimationFrame(() => {
        clearTimeout(timer.value);

        timer.value = setTimeout(() => {
          cb(elements);
        }, delay);
      });
    },
  );

  const observe = (el: HTMLElement, options?: ResizeObserverOptions) => {
    observed.value = el;
    observer.observe(el, options);
  };

  const unobserve = () => {
    clearTimeout(timer.value);
    observer.unobserve(observed.value as Element);
    observer.disconnect();
  };

  return {
    observe,
    unobserve,
  };
}
