"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

const VALID = /^[A-Z0-9]$/;

export function CodeInput({ value, onChange, autoFocus = false }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const update = (next: string[]) => onChange(next.join("").toUpperCase());

  const handleInput = (i: number, raw: string) => {
    const char = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-1);
    if (!char) return;
    const next = [...chars];
    next[i] = char;
    update(next);
    refs.current[Math.min(i + 1, 5)]?.focus();
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (chars[i]) {
        const next = [...chars];
        next[i] = "";
        update(next);
      } else {
        refs.current[Math.max(i - 1, 0)]?.focus();
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      refs.current[Math.max(i - 1, 0)]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      refs.current[Math.min(i + 1, 5)]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? "");
    update(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {chars.map((char, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="text"
          value={char}
          autoFocus={autoFocus && i === 0}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={2}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={[
            "h-12 w-10 rounded-xl border bg-white/10 text-center text-lg font-bold uppercase tracking-wider text-white",
            "transition-all duration-150 focus:outline-none",
            char
              ? "border-orange-400/80 bg-orange-500/10 shadow-[0_0_12px_-2px_theme(colors.orange.500/40%)]"
              : "border-white/20",
            "focus:border-orange-400 focus:bg-orange-500/10 focus:shadow-[0_0_14px_-2px_theme(colors.orange.500/50%)]",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
