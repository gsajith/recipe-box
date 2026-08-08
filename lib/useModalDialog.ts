"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * The dialog behaviour every modal in the app needs and none of them had:
 * Escape closes, focus moves in and stays in, the page behind is scroll-locked
 * and hidden from assistive tech, and focus returns to whatever opened it.
 *
 * Attach the returned ref to the dialog element and give it `tabIndex={-1}` so
 * it can receive focus when it contains nothing focusable yet.
 */
export function useModalDialog<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);

  // Callers pass an inline arrow, so the callback identity changes every
  // render. Reading it from a ref keeps the effect from re-running (and
  // re-locking scroll, and stealing focus back) on each one.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Visible, not merely present. The modal's chrome swaps by breakpoint —
    // Back shows on a phone, Close on a desktop — so the first FOCUSABLE match
    // in DOM order can be `display: none`. Focusing it silently does nothing
    // and the dialog opens with focus still on <body>. The Tab handler below
    // already filtered this way; the way in did not.
    const visible = (el: HTMLElement) =>
      el.offsetWidth > 0 || el.offsetHeight > 0;
    if (!node.contains(document.activeElement)) {
      const first = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).find(visible);
      (first ?? node).focus();
    }

    // Lock the real scroller. globals.css puts the scroll on <html>, so
    // locking only <body> left the page scrolling behind the modal.
    const scroller =
      (document.scrollingElement as HTMLElement | null) ??
      document.documentElement;
    const previousScrollerOverflow = scroller.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    scroller.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Hide everything that isn't on the path from the dialog to <body>, so a
    // screen reader can't wander into the 84 recipe cards behind the modal.
    const inerted: HTMLElement[] = [];
    for (let el: HTMLElement | null = node; el && el !== document.body; ) {
      const parent: HTMLElement | null = el.parentElement;
      if (!parent) break;
      for (const sibling of Array.from(parent.children)) {
        if (
          sibling !== el &&
          sibling instanceof HTMLElement &&
          !sibling.hasAttribute("inert")
        ) {
          sibling.setAttribute("inert", "");
          inerted.push(sibling);
        }
      }
      el = parent;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetWidth > 0 || el.offsetHeight > 0);
      if (focusable.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!node.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      scroller.style.overflow = previousScrollerOverflow;
      document.body.style.overflow = previousBodyOverflow;
      for (const el of inerted) el.removeAttribute("inert");

      // Only take focus back if this dialog still had it. When one overlay
      // hands off to another — the feed sheet opening a recipe — the new one
      // has already focused itself by now, and restoring here would yank focus
      // to an element the new dialog has just marked inert, landing it on
      // <body>. Nothing to restore means nothing was taken.
      const active = document.activeElement;
      const stillOurs =
        active === document.body || active === null || node.contains(active);
      if (stillOurs) previouslyFocused?.focus?.();
    };
  }, []);

  return ref;
}
