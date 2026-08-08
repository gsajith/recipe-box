"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";
import styles from "./FilterDropdown.module.css";

interface FilterDropdownProps {
  /** Shown when nothing is selected — the selected value replaces it. */
  label: string;
  /** Options excluding "All", which is prepended. */
  options: readonly string[];
  inverted?: boolean;
  /** Single-select mode. */
  value?: string;
  onChange?: (value: string) => void;
  /**
   * Multi-select mode: pass the selected values and a toggle handler instead
   * of value/onChange. The menu stays open while picking, and "All" clears.
   */
  values?: string[];
  onToggle?: (value: string) => void;
  onClear?: () => void;
  /** Shown in their own group above the full list — e.g. your most-used tags. */
  pinnedOptions?: readonly string[];
  pinnedLabel?: string;
  /** Adds a type-to-filter field. Worth it past ~15 options. */
  searchable?: boolean;
}

export const ALL = "All";

const GAP = 6;
const EDGE = 8;
const MAX_HEIGHT = 360;

export function FilterDropdown({
  label,
  value = ALL,
  options,
  onChange,
  values,
  onToggle,
  onClear,
  pinnedOptions,
  pinnedLabel = "Most used",
  searchable,
  inverted,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const isMulti = values !== undefined;
  const selected = values ?? [];
  const isActive = isMulti ? selected.length > 0 : value !== ALL;
  const triggerText = !isActive
    ? label
    : isMulti
      ? selected.length === 1
        ? selected[0]
        : `${selected.length} ${label.toLowerCase()}`
      : value;

  // The filter row scrolls horizontally, and a scroll container clips its
  // children on both axes — so the menu is portalled out and positioned to the
  // trigger instead of being laid out inside the row.
  const position = useCallback(() => {
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
  }, []);

  useLayoutEffect(() => {
    if (open) position();
  }, [open, position]);

  // Reset the filter each time the menu opens, and put the caret in it.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    if (searchable) searchRef.current?.focus();
  }, [open, searchable]);

  // The list shrinks as you type, so the menu has to re-measure its height.
  useLayoutEffect(() => {
    if (open) position();
  }, [query, open, position]);

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
    // The menu is anchored to the trigger's rect, so a scroll moves it out of
    // alignment. Follow the trigger instead of closing — closing on every wheel
    // tick makes a long list (all your tags) unusable — and only give up once
    // the trigger has actually left the viewport.
    let frame = 0;
    function handleScroll(event: Event) {
      // Scrolling *within* the menu is not a page scroll; leave it alone.
      if (event.target instanceof Node && menuRef.current?.contains(event.target))
        return;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = triggerRef.current?.getBoundingClientRect();
        if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) {
          setOpen(false);
          return;
        }
        position();
      });
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", position);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", position);
    };
  }, [open, position]);

  const q = query.trim().toLowerCase();
  const matches = (o: string) => !q || o.toLowerCase().includes(q);
  // While filtering, the pinned group would just repeat entries that are
  // already in the list below it — one flat set of results reads cleaner.
  const visiblePinned = q ? [] : (pinnedOptions ?? []);
  const visibleOptions = options.filter(matches);

  const renderOption = (option: string, keyPrefix = "") => {
    const isAll = option === ALL;
        const isSelected = isMulti
      ? isAll
        ? selected.length === 0
        : selected.includes(option)
      : option === value;
    return (
      <button
        key={keyPrefix + option}
        type="button"
        role="option"
        aria-selected={isSelected}
        className={styles.option}
        onClick={(event) => {
          event.stopPropagation();
          if (isMulti) {
            // Picking several tags in a row shouldn't mean reopening the
            // menu each time; only "All" (clear) dismisses it.
            if (isAll) {
              onClear?.();
              setOpen(false);
            } else {
              onToggle?.(option);
            }
            return;
          }
          onChange?.(option);
          setOpen(false);
        }}>
        <span className={styles.checkSlot}>
          {isSelected && <Check size={14} aria-hidden />}
        </span>
        {option}
      </button>
    );
  };

  const menu = (
    <div
      ref={menuRef}
      className={`${styles.menu} ${inverted ? styles.inverted : ""}`}
      style={menuStyle}
      role="listbox"
      aria-multiselectable={isMulti || undefined}
      aria-label={label}>
      {searchable && (
        <div className={styles.searchRow}>
          <Search size={14} aria-hidden className={styles.searchIcon} />
          <input
            ref={searchRef}
            type="text"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder={`Filter ${label.toLowerCase()}…`}
            aria-label={`Filter ${label.toLowerCase()}`}
          />
        </div>
      )}

      {!q && renderOption(ALL)}

      {visiblePinned.length > 0 && (
        <>
          <p className={styles.groupLabel}>{pinnedLabel}</p>
          {visiblePinned.map((o) => renderOption(o, "pinned-"))}
          <p className={styles.groupLabel}>All {label.toLowerCase()}</p>
        </>
      )}

      {visibleOptions.map((o) => renderOption(o))}

      {visibleOptions.length === 0 && (
        <p className={styles.noMatch}>No {label.toLowerCase()} match “{query}”</p>
      )}
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
        <span className={styles.triggerLabel}>{triggerText}</span>
        <ChevronDown size={14} aria-hidden />
      </button>

      {open && createPortal(menu, document.body)}
    </div>
  );
}
