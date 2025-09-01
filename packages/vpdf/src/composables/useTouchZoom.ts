import { ref } from "vue";

type ZoomCB = (zoomin: boolean, zoomout: boolean, distance: number) => void;

export const useTouchZoom = (callback: ZoomCB) => {
  const start = ref({
    x: 0,
    y: 0,
    distance: 0,
  });

  const touching = ref(false);

  const getDistance = (e: TouchEvent) => {
    return Math.hypot(
      e.touches[0]!.pageX - e.touches[1]!.pageX,
      e.touches[0]!.pageY - e.touches[1]!.pageY,
    );
  };

  const touchStart = (e: TouchEvent) => {
    if (e.touches.length == 2) {
      touching.value = true;
      e.preventDefault();
      e.stopPropagation();

      start.value.x = (e.touches[0]!.pageX + e.touches[1]!.pageX) / 2;
      start.value.y = (e.touches[0]!.pageY + e.touches[1]!.pageY) / 2;
      start.value.distance = getDistance(e);
    }
  };

  const touchMove = (e: TouchEvent) => {
    if (e.touches.length == 2) {
      touching.value = true;
      e.preventDefault();
      e.stopPropagation();
      const distance = getDistance(e);
      const zoomin = distance > start.value.distance;
      const zoomout = distance < start.value.distance;

      if (Math.abs(distance) % 10 < 1) {
        start.value.x = (e.touches[0]!.pageX + e.touches[1]!.pageX) / 2;
        start.value.y = (e.touches[0]!.pageY + e.touches[1]!.pageY) / 2;
        start.value.distance = distance;
        requestAnimationFrame(() => {
          callback(zoomin, zoomout, distance);
        });
      }
    }
  };

  const touchEnd = (e: TouchEvent) => {
    if (e.touches.length == 2) {
      e.preventDefault();
      e.stopPropagation();
      touching.value = true;
    }
  };

  return { touching, touchStart, touchMove, touchEnd };
};
