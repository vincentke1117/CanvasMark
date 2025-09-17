import { RefObject, useEffect } from 'react';

type Orientation = 'horizontal' | 'vertical' | 'both';

type Options = {
  orientation?: Orientation;
  loop?: boolean;
};

const FOCUSABLE_SELECTOR = '[data-roving-item]';

const isElementVisible = (element: HTMLElement) => {
  if (element.hidden) return false;
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  return true;
};

const getFocusableItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (item) =>
      !item.hasAttribute('disabled') &&
      item.getAttribute('aria-disabled') !== 'true' &&
      isElementVisible(item),
  );

const updateTabOrder = (items: HTMLElement[], activeIndex: number) => {
  items.forEach((item, index) => {
    item.tabIndex = index === activeIndex ? 0 : -1;
  });
};

const shouldSkipKeyHandling = (target: HTMLElement) => {
  const tagName = target.tagName;
  if (target.isContentEditable) return true;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }
  return false;
};

const isModifierKey = (event: KeyboardEvent) => event.altKey || event.ctrlKey || event.metaKey;

export const useRovingFocus = (
  containerRef: RefObject<HTMLElement>,
  options: Options = {},
) => {
  const { orientation = 'horizontal', loop = true } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let activeIndex = -1;

    const syncItems = (target?: HTMLElement | null) => {
      const items = getFocusableItems(container);
      if (!items.length) {
        activeIndex = -1;
        return items;
      }

      if (target) {
        const targetIndex = items.indexOf(target);
        if (targetIndex >= 0) {
          activeIndex = targetIndex;
        }
      }

      if (activeIndex < 0 || activeIndex >= items.length) {
        activeIndex = 0;
      }

      updateTabOrder(items, activeIndex);
      return items;
    };

    const moveFocus = (items: HTMLElement[], nextIndex: number) => {
      if (!items.length) return;
      const boundedIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
      activeIndex = boundedIndex;
      updateTabOrder(items, activeIndex);
      items[activeIndex].focus();
    };

    const stepFocus = (items: HTMLElement[], delta: number) => {
      if (items.length <= 1) return;

      let nextIndex = activeIndex;
      const total = items.length;

      do {
        nextIndex += delta;
        if (loop) {
          nextIndex = (nextIndex + total) % total;
        } else if (nextIndex < 0 || nextIndex >= total) {
          return;
        }
      } while (nextIndex === activeIndex);

      moveFocus(items, nextIndex);
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!(event.target instanceof HTMLElement)) return;
      syncItems(event.target);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModifierKey(event)) return;

      const target = event.target as HTMLElement | null;
      if (!target || !container.contains(target)) return;

      if (shouldSkipKeyHandling(target)) return;

      const items = syncItems(target);
      if (!items.length) return;

      const horizontal = orientation === 'horizontal' || orientation === 'both';
      const vertical = orientation === 'vertical' || orientation === 'both';

      switch (event.key) {
        case 'ArrowRight':
          if (horizontal) {
            event.preventDefault();
            stepFocus(items, 1);
          }
          break;
        case 'ArrowLeft':
          if (horizontal) {
            event.preventDefault();
            stepFocus(items, -1);
          }
          break;
        case 'ArrowDown':
          if (vertical) {
            event.preventDefault();
            stepFocus(items, 1);
          }
          break;
        case 'ArrowUp':
          if (vertical) {
            event.preventDefault();
            stepFocus(items, -1);
          }
          break;
        case 'Home':
          event.preventDefault();
          moveFocus(items, 0);
          break;
        case 'End':
          event.preventDefault();
          moveFocus(items, items.length - 1);
          break;
        default:
          break;
      }
    };

    const initialItems = syncItems();
    if (initialItems.length > 0) {
      updateTabOrder(initialItems, activeIndex);
    }

    container.addEventListener('focusin', handleFocusIn);
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('focusin', handleFocusIn);
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, loop, orientation]);
};
