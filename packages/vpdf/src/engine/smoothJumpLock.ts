const SETTLE_IDLE_MS = 120;
const SETTLE_MAX_MS = 2000;

export function bindSmoothJumpCompletion(
  scroll: HTMLElement,
  handlers: {
    onComplete: () => void;
    onInterrupt: () => void;
  },
): () => void {
  let done = false;
  let idle: ReturnType<typeof setTimeout> | undefined;

  const finish = (handler: () => void) => {
    if (done) return;
    done = true;
    cleanup();
    handler();
  };

  const onScroll = () => {
    clearTimeout(idle);
    idle = setTimeout(() => finish(handlers.onComplete), SETTLE_IDLE_MS);
  };
  const onScrollEnd = () => finish(handlers.onComplete);
  const onInterrupt = () => finish(handlers.onInterrupt);

  scroll.addEventListener("scroll", onScroll);
  scroll.addEventListener("scrollend", onScrollEnd);
  scroll.addEventListener("wheel", onInterrupt, { passive: true });
  scroll.addEventListener("pointerdown", onInterrupt);

  // ponytail: 2s cap if scrollend never fires; drop when scrollend is universal
  const maxWait = setTimeout(() => finish(handlers.onComplete), SETTLE_MAX_MS);

  function cleanup() {
    clearTimeout(idle);
    clearTimeout(maxWait);
    scroll.removeEventListener("scroll", onScroll);
    scroll.removeEventListener("scrollend", onScrollEnd);
    scroll.removeEventListener("wheel", onInterrupt);
    scroll.removeEventListener("pointerdown", onInterrupt);
  }

  return () => finish(() => {});
}

export class SmoothJumpLock {
  private target?: number;
  private dispose?: () => void;

  get page(): number | undefined {
    return this.target;
  }

  start(page: number, scroll: HTMLElement, onRelease: () => void): void {
    this.stop();
    this.target = page;
    this.dispose = bindSmoothJumpCompletion(scroll, {
      onComplete: () => {
        this.stop();
        onRelease();
      },
      onInterrupt: () => {
        this.stop();
        onRelease();
      },
    });
  }

  stop(): void {
    const dispose = this.dispose;
    this.dispose = undefined;
    this.target = undefined;
    dispose?.();
  }
}
