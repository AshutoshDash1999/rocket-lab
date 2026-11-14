"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { BlueprintPreview } from "@/components/common/blueprint-preview";
import { RelativeTime } from "@/components/common/relative-time";
import type { Blueprint } from "@/lib/blueprints";
import { copyShareLink } from "@/lib/share-link";
import {
  type ActionResult,
  deleteBlueprint,
  duplicateBlueprint,
  renameBlueprint,
} from "../actions";

const NAME_MAX = 60;

const menuItem =
  "flex w-full items-center rounded-[6px] px-3 py-2 text-left font-display text-base font-semibold text-pen outline-none hover:bg-toon-yellow/60 focus-visible:bg-toon-yellow/60 disabled:opacity-50";

export function BlueprintCard({ blueprint }: { blueprint: Blueprint }) {
  const { id, name, parts, updated_at } = blueprint;
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = (focusTrigger = false) => {
    setMenuOpen(false);
    setConfirmDelete(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  // Click outside or Escape closes the menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu(true);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  });

  const run = (action: () => Promise<ActionResult>) => {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (!res.ok) setError(res.error);
      closeMenu();
    });
  };

  const copyLink = async () => {
    if (!(await copyShareLink(id))) return closeMenu();
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      closeMenu();
    }, 900);
  };

  return (
    <div
      ref={rootRef}
      className={`group relative flex flex-col rounded-[12px] border-[3px] border-pen bg-paper-light shadow-[5px_5px_0_var(--pen)] transition-[transform,box-shadow] duration-100 focus-within:-translate-y-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--pen)] motion-reduce:transition-none ${pending ? "opacity-60" : ""}`}
    >
      <Link
        href={`/build/${id}`}
        aria-label={`Open ${name}`}
        className="block overflow-hidden rounded-t-[9px] border-b-[3px] border-pen outline-none focus-visible:ring-4 focus-visible:ring-toon-yellow"
      >
        <BlueprintPreview parts={parts} className="h-44" />
      </Link>

      <div className="flex items-start gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          {renaming ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const next = String(
                  new FormData(e.currentTarget).get("name") ?? "",
                );
                setRenaming(false);
                if (next.trim() && next.trim() !== name) {
                  run(() => renameBlueprint(id, next));
                }
              }}
            >
              <input
                name="name"
                defaultValue={name}
                maxLength={NAME_MAX}
                // biome-ignore lint/a11y/noAutofocus: opened on purpose from the menu
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
                onBlur={(e) => e.currentTarget.form?.requestSubmit()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    setRenaming(false);
                  }
                }}
                aria-label="Blueprint name"
                className="h-8 w-full rounded-[6px] border-2 border-pen bg-white px-2 font-display text-lg font-semibold text-pen outline-none"
              />
            </form>
          ) : (
            <h2 className="truncate font-display text-lg font-semibold leading-tight text-pen">
              {name}
            </h2>
          )}
          <p className="mt-0.5 text-xs text-pen/60">
            Updated <RelativeTime iso={updated_at} />
          </p>
          {error && (
            <p
              role="alert"
              className="mt-1 text-xs font-semibold text-toon-red"
            >
              {error}
            </p>
          )}
        </div>

        <button
          ref={triggerRef}
          type="button"
          aria-label={`More options for ${name}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
          className="-mr-1 grid size-9 shrink-0 place-items-center rounded-[8px] border-2 border-transparent text-pen outline-none hover:border-pen hover:bg-paper focus-visible:border-pen aria-expanded:border-pen aria-expanded:bg-paper"
        >
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <circle cx="5" cy="12" r="2.2" fill="currentColor" />
            <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            <circle cx="19" cy="12" r="2.2" fill="currentColor" />
          </svg>
        </button>

        {menuOpen && (
          <div
            role="menu"
            aria-label={`${name} options`}
            className="absolute right-2 bottom-12 z-30 w-48 origin-bottom-right animate-[rl-menu-in_140ms_cubic-bezier(0.2,0.9,0.3,1.2)] rounded-[10px] border-[2.5px] border-pen bg-paper-light p-1.5 shadow-[4px_4px_0_var(--pen)] motion-reduce:animate-none"
          >
            <button
              type="button"
              role="menuitem"
              className={menuItem}
              // biome-ignore lint/a11y/noAutofocus: first item takes focus when the menu opens
              autoFocus
              onClick={() => {
                closeMenu();
                setRenaming(true);
              }}
            >
              Rename
            </button>
            <button
              type="button"
              role="menuitem"
              className={menuItem}
              disabled={pending}
              onClick={() => run(() => duplicateBlueprint(id))}
            >
              Duplicate
            </button>
            <button
              type="button"
              role="menuitem"
              className={menuItem}
              onClick={copyLink}
            >
              {copied ? "Link copied!" : "Share (copy link)"}
            </button>
            <div className="my-1 border-t-2 border-dashed border-pen/25" />
            {confirmDelete ? (
              <button
                type="button"
                role="menuitem"
                className={`${menuItem} bg-toon-red/15 text-toon-red hover:bg-toon-red hover:text-white focus-visible:bg-toon-red focus-visible:text-white`}
                disabled={pending}
                // biome-ignore lint/a11y/noAutofocus: focus moves to the confirm step
                autoFocus
                onClick={() => run(() => deleteBlueprint(id))}
              >
                {pending ? "Deleting…" : "Really delete?"}
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                className={`${menuItem} text-toon-red`}
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
