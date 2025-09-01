import { ref, computed, toValue, type ComputedRef, watch } from "vue";
import type { ScaleOption, ScaleOptions } from "../types/scales";

type Options = {
  scales?: ScaleOptions;
};

type NearestOptionIndices = {
  next: number;
  prev: number;
};

export const useScales = (
  deafultScale: number | ComputedRef<number> = 1,
  options?: Options | ComputedRef<Options>,
) => {
  const scale = ref(toValue(deafultScale));

  const _scales = computed(() =>
    sortScales(
      toValue(options)?.scales ?? [
        { value: 0.25, show: true },
        { value: 0.333, show: false },
        { value: 0.5, show: true },
        { value: 0.584, show: false },
        { value: 0.667, show: false },
        { value: 0.75, show: true },
        { value: 1, show: true },
        { value: 1.25, show: true },
        { value: 1.5, show: true },
        { value: 2, show: true },
        { value: 3, show: false },
        { value: 4, show: true },
        { value: 5, show: false },
        { value: 6, show: false },
        { value: 7, show: false },
        { value: 8, show: true },
      ],
    ),
  );

  const canNext = computed(
    () => findNearest(_scales.value, scale.value).next > -1,
  );
  const canPrev = computed(
    () => findNearest(_scales.value, scale.value).prev > -1,
  );

  const sortScales = (s: ScaleOptions) => {
    let sorted: ScaleOptions = [];
    let index = 0;
    const withValues = s.filter((s) => s.value !== undefined);
    const sortedWithValues = withValues.sort(
      (a, b) => (a.value ?? 0) - (b.value ?? 0),
    );

    s.forEach((option) => {
      if (option.value === undefined) {
        sorted.push(option);
      } else {
        sorted.push(sortedWithValues[index]!);
        index++;
      }
    });

    return sorted;
  };

  const appendFitters = (s: ScaleOptions) => {
    return [
      ...s,
      { show: true },
      { label: "Fit Page", value: -1, show: true },
      { label: "Fit Width", value: -2, show: true },
      { label: "Fit Height", value: -3, show: true },
    ];
  };

  const findNearest = (
    options: ScaleOptions,
    num: number,
  ): NearestOptionIndices => {
    let prev = -1;
    let next = -1;
    let prevDistance = Infinity;
    let nextDistance = Infinity;

    options.forEach((item, index) => {
      if (item.value !== undefined) {
        const distance = Math.abs(item.value - num);

        // If the current distance is smaller than the previous distance, update prevIndex
        if (item.value < num && distance < prevDistance) {
          prev = index;
          prevDistance = distance;
        }

        // If the current distance is smaller than the next distance, update nextIndex
        if (item.value > num && distance < nextDistance) {
          next = index;
          nextDistance = distance;
        }
      }
    });

    return { prev, next };
  };

  const next = (): ScaleOption => {
    const nextIndex = findNearest(_scales.value, scale.value).next;
    if (nextIndex > -1) scale.value = _scales.value[nextIndex]?.value ?? 1;
    return _scales.value[
      nextIndex == -1 ? _scales.value.length - 1 : nextIndex
    ]!;
  };

  const prev = (): ScaleOption => {
    const prevIndex = findNearest(_scales.value, scale.value).prev;
    if (prevIndex > -1) scale.value = _scales.value[prevIndex]?.value ?? 1;
    return _scales.value[prevIndex == -1 ? 0 : prevIndex]!;
  };

  watch(
    () => toValue(deafultScale),
    (val) => {
      scale.value = val;
    },
  );

  return {
    scale,
    scales: _scales.value,
    canNext,
    canPrev,
    next,
    prev,
    findNearest,
    appendFitters,
  };
};
