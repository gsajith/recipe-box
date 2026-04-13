"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Search recipes...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchIcon}>
        <Search size={18} />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.input}
      />
      {query && (
        <button
          className={styles.clearBtn}
          onClick={handleClear}
          title="Clear search">
          <X size={18} />
        </button>
      )}
    </div>
  );
}
