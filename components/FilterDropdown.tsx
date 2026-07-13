"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import styles from "./FilterDropdown.module.css";

interface FilterDropdownProps {
  /** Shown when nothing is selected — the selected value replaces it. */
  label: string;
  value: string;
  /** Options excluding "All", which is prepended. */
  options: readonly string[];
  onChange: (value: string) => void;
  inverted?: boolean;
}

export const ALL = "All";

const GAP = 6;
const EDGE = 8;
const MAX_HEIGHT = 360;

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
  inverted,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isActive = value !== ALL;

  // The filter row scrolls horizontally, and a scroll container clips its
  // children on both axes — so the menu is portalled out and positioned to the
  // trigger instead of being laid out inside the row.
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const rect = trigger.getBoundingClientRect();
    const left = Math.min(
      Math.max(EDGE, rect.left),
      window.innerWidth - menu.offsetWidth - EDGE,
    );

    // Size to the space actually available rather than a fixed cap, so the last
    // option is never half-cut; drop upward when the trigger is low on screen.
    const spaceBelow = window.innerHeight - rect.bottom - GAP - EDGE;
    const spaceAbove = rect.top - GAP - EDGE;
    const wanted = menu.scrollHeight;

    if (spaceBelow >= Math.min(wanted, MAX_HEIGHT) || spaceBelow >= spaceAbove) {
      setMenuStyle({
        top: rect.bottom + GAP,
        left,
        maxHeight: Math.min(MAX_HEIGHT, spaceBelow),
      });
    } else {
      setMenuStyle({
        bottom: window.innerHeight - rect.top + GAP,
        left,
        maxHeight: Math.min(MAX_HEIGHT, spaceAbove),
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    // The menu is anchored to a rect, so any scroll or resize invalidates it.
    function close() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const menu = (
    <div
      ref={menuRef}
      className={`${styles.menu} ${inverted ? styles.inverted : ""}`}
      style={menuStyle}
      role="listbox"
      aria-label={label}>
      {[ALL, ...options].map((option) => {
        const isSelected = option === value;
        return (
          <button
            key={option}
            type="button"
            role="option"
            aria-selected={isSelected}
            className={styles.option}
            onClick={(event) => {
              event.stopPropagation();
              onChange(option);
              setOpen(false);
            }}>
            <span className={styles.checkSlot}>
              {isSelected && <Check size={14} aria-hidden />}
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`${styles.root} ${inverted ? styles.inverted : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${isActive ? styles.triggerActive : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((wasOpen) => !wasOpen);
        }}>
        <span className={styles.triggerLabel}>{isActive ? value : label}</span>
        <ChevronDown size={14} aria-hidden />
      </button>

      {open && createPortal(menu, document.body)}
    </div>
  );
}
