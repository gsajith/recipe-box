"use client";

import { Search, X } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  /** Controlled by the panel that owns the filter state. Without this the box
   *  kept its own copy of the query, so "Clear filters" could empty the list
   *  and leave a dead query on screen with its × still showing. */
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onSearch,
  placeholder = "Search recipes...",
}: SearchBarProps) {
  return (
    <div className={styles.container}>
      <div className={styles.searchIcon} aria-hidden="true">
        <Search size={18} />
      </div>
      {/* Not type="search": WebKit adds its own cancel button and the row
          would then carry two clear affordances. */}
      <input
        type="text"
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={styles.input}
      />
      {value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => onSearch("")}
          aria-label="Clear search"
          title="Clear search">
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
