"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { FocusEvent, KeyboardEvent, MouseEvent } from "react";
import { Check, ChevronDown, Search, Tag, X } from "lucide-react";
import { matchTags } from "../services/post-groups.mjs";
import type { BlogTagCount } from "../types";
import { cn } from "@/lib/utils";

// Keys pressed while an input method (Zhuyin, Pinyin, Kana…) is composing belong to the IME:
// Enter confirms a candidate and arrows move between candidates. Safari reports the
// confirming keydown after compositionend, with isComposing false but keyCode 229.
function isImeKey(event: KeyboardEvent) {
    return event.nativeEvent.isComposing || event.keyCode === 229;
}

interface TagPickerProps {
    options: BlogTagCount[];
    selected: string | null;
    onSelect(tag: string | null): void;
}

// Tailwind's `sm` breakpoint: a popover from here up, a modal bottom sheet below it.
const DESKTOP_QUERY = "(min-width: 640px)";

function subscribeDesktop(onChange: () => void) {
    const media = window.matchMedia(DESKTOP_QUERY);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
}

export function TagPicker({ options, selected, onSelect }: TagPickerProps) {
    const isDesktop = useSyncExternalStore(
        subscribeDesktop,
        () => window.matchMedia(DESKTOP_QUERY).matches,
        () => true
    );
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const baseId = useId();
    const listboxId = `${baseId}-listbox`;
    const titleId = `${baseId}-title`;
    const panelId = `${baseId}-panel`;
    // Option ids follow each tag's position in the unfiltered list, so an id always names the same tag.
    const optionIndex = new Map(options.map((option, index) => [option.tag, index]));
    const optionId = (tag: string) => `${baseId}-option-${optionIndex.get(tag)}`;

    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);
    const openRef = useRef(open);

    const matches = matchTags(options, query);
    const active = matches.length > 0 ? Math.min(activeIndex, matches.length - 1) : -1;

    function openPanel() {
        const index = selected === null ? -1 : options.findIndex((option) => option.tag === selected);
        setQuery("");
        setActiveIndex(Math.max(index, 0));
        setOpen(true);
    }

    const closePanel = useCallback((returnFocus: boolean) => {
        setOpen(false);
        setQuery("");
        if (returnFocus) triggerRef.current?.focus();
    }, []);

    function choose(tag: string) {
        // Re-choosing the current tag adds no history entry.
        if (tag !== selected) onSelect(tag);
        closePanel(true);
    }

    // Focus moves into the search field whenever the panel opens.
    useEffect(() => {
        openRef.current = open;
        if (open) inputRef.current?.focus();
    }, [open]);

    // Crossing the breakpoint changes the panel's semantics, so close rather than morph. The previous
    // layout's panel has already unmounted, so focus that was inside it is now on <body>: return it
    // to the trigger.
    useEffect(() => {
        if (!openRef.current) return;
        const focused = document.activeElement;
        const focusWasInPanel =
            focused === null || focused === document.body || (panelRef.current?.contains(focused) ?? false);
        closePanel(focusWasInPanel);
    }, [isDesktop, closePanel]);

    // Desktop: a pointer press outside the picker closes it without changing the selection.
    useEffect(() => {
        if (!open || !isDesktop) return;
        function onPointerDown(event: PointerEvent) {
            if (!rootRef.current?.contains(event.target as Node)) closePanel(false);
        }
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open, isDesktop, closePanel]);

    // Mobile: the page behind the modal sheet does not scroll. `overflow: hidden` alone does not stop
    // touch scrolling in older iOS Safari, so pin the body in place and restore the exact scroll
    // position when the lock ends (close, unmount or a breakpoint change).
    useEffect(() => {
        if (!open || isDesktop) return;
        const { body } = document;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const previous = {
            position: body.style.position,
            top: body.style.top,
            width: body.style.width,
            overflow: body.style.overflow,
        };
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.width = "100%";
        body.style.overflow = "hidden";
        return () => {
            body.style.position = previous.position;
            body.style.top = previous.top;
            body.style.width = previous.width;
            body.style.overflow = previous.overflow;
            // The site sets `scroll-behavior: smooth`; the restore must be instant.
            window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
        };
    }, [open, isDesktop]);

    // Keep the active option visible while arrowing through a long list.
    useEffect(() => {
        if (!open || active < 0) return;
        listboxRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
    }, [open, active]);

    function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (isImeKey(event)) return;
        const last = matches.length - 1;
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                if (last >= 0) setActiveIndex(active >= last ? 0 : active + 1);
                break;
            case "ArrowUp":
                event.preventDefault();
                if (last >= 0) setActiveIndex(active <= 0 ? last : active - 1);
                break;
            case "Home":
                event.preventDefault();
                setActiveIndex(0);
                break;
            case "End":
                event.preventDefault();
                if (last >= 0) setActiveIndex(last);
                break;
            case "Enter":
                // Nothing to select when the search matches no tag.
                event.preventDefault();
                if (active >= 0) choose(matches[active].tag);
                break;
        }
    }

    function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (isImeKey(event)) return;
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            closePanel(true);
            return;
        }
        // Mobile sheet: Tab and Shift+Tab cycle between the search field and the close button.
        if (event.key === "Tab" && !isDesktop) {
            event.preventDefault();
            const next = document.activeElement === inputRef.current ? closeRef.current : inputRef.current;
            next?.focus();
        }
    }

    // Desktop: tabbing out of the panel closes it without changing the selection.
    function onPanelBlur(event: FocusEvent<HTMLDivElement>) {
        if (!isDesktop) return;
        if (panelRef.current?.contains(event.relatedTarget as Node | null)) return;
        closePanel(false);
    }

    // Presses on options or empty panel space must not pull focus out of the search field.
    function keepSearchFocus(event: MouseEvent) {
        if (event.target !== inputRef.current) event.preventDefault();
    }

    const search = (
        <div
            className={cn(
                "flex h-11 items-center gap-2 border-2 border-line bg-paper px-3 focus-within:border-accent",
                // A non-colour focus cue matching the site's outline, since the input itself has none.
                "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent",
                isDesktop ? "m-2" : "mx-4 mb-3 mt-2"
            )}
        >
            <Search aria-hidden className="h-4 w-4 shrink-0 text-mute" />
            <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-label="Search tags"
                aria-expanded="true"
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={active >= 0 ? optionId(matches[active].tag) : undefined}
                autoComplete="off"
                spellCheck={false}
                placeholder="Search tags"
                value={query}
                onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                }}
                onKeyDown={onInputKeyDown}
                className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-ink placeholder:text-mute focus-visible:outline-none"
            />
        </div>
    );

    const list = (
        <>
            <ul
                ref={listboxRef}
                id={listboxId}
                role="listbox"
                aria-label="Tags"
                // Options are reached through aria-activedescendant; without this, Chrome makes the
                // scrollable list a tab stop and Tab would not leave the popover.
                tabIndex={-1}
                className={cn(
                    "overflow-y-auto overscroll-contain border-t border-line",
                    isDesktop ? "max-h-72 py-1" : "flex-1 pb-4"
                )}
            >
                {matches.map((option, index) => {
                    const isSelected = option.tag === selected;
                    return (
                        <li
                            key={option.tag}
                            id={optionId(option.tag)}
                            data-index={index}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => choose(option.tag)}
                            onPointerMove={() => {
                                if (index !== active) setActiveIndex(index);
                            }}
                            className={cn(
                                "flex min-h-11 cursor-pointer items-center gap-3 px-4 text-[0.95rem]",
                                index === active && "bg-paper ring-1 ring-inset ring-ink",
                                isSelected && "font-semibold shadow-[inset_3px_0_0_rgb(var(--accent))]"
                            )}
                        >
                            <span className="grid w-4 shrink-0 place-items-center">
                                {isSelected && <Check aria-hidden className="h-4 w-4" strokeWidth={2.25} />}
                            </span>
                            <span className="flex-1">{option.tag}</span>
                            <span className="text-sm font-normal tabular-nums text-mute">{option.count}</span>
                        </li>
                    );
                })}
            </ul>
            {matches.length === 0 && <p className="px-4 py-3 text-sm text-mute">No matching tags.</p>}
        </>
    );

    if (options.length === 0) return null;

    return (
        <div ref={rootRef} className="relative">
            <div className={cn("flex items-stretch bg-surface", selected === null ? "border border-line" : "border border-ink")}>
                <button
                    ref={triggerRef}
                    type="button"
                    aria-haspopup={isDesktop ? "listbox" : "dialog"}
                    aria-expanded={open}
                    aria-controls={open ? panelId : undefined}
                    // While open, a press on the trigger must not blur the panel first and then reopen it.
                    onMouseDown={(event) => {
                        if (open) event.preventDefault();
                    }}
                    onClick={() => (open ? closePanel(true) : openPanel())}
                    className={cn(
                        "inline-flex min-h-11 items-center gap-2 text-sm text-ink",
                        selected === null ? "px-3.5" : "pl-3.5 pr-1 font-semibold"
                    )}
                >
                    {selected === null ? (
                        <>
                            Tags
                            <ChevronDown aria-hidden className="h-3.5 w-3.5 text-mute" />
                        </>
                    ) : (
                        <>
                            <Tag aria-hidden className="h-3.5 w-3.5" />
                            <span className="sr-only">Tag: </span>
                            {selected}
                        </>
                    )}
                </button>
                {selected !== null && (
                    <button
                        type="button"
                        aria-label="Clear tag filter"
                        onClick={() => {
                            onSelect(null);
                            closePanel(true);
                        }}
                        className="grid min-h-11 min-w-10 place-items-center text-mute hover:text-ink"
                    >
                        <X aria-hidden className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {open && isDesktop && (
                <div
                    ref={panelRef}
                    id={panelId}
                    onKeyDown={onPanelKeyDown}
                    onBlur={onPanelBlur}
                    onMouseDown={keepSearchFocus}
                    className="absolute left-0 top-full z-40 mt-2 w-72 border border-ink bg-surface"
                >
                    {search}
                    {list}
                </div>
            )}

            {open && !isDesktop && (
                <>
                    <div aria-hidden className="fixed inset-0 z-[60] bg-black/50" onClick={() => closePanel(true)} />
                    <div
                        ref={panelRef}
                        id={panelId}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        onKeyDown={onPanelKeyDown}
                        onMouseDown={keepSearchFocus}
                        className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[80vh] flex-col border-t border-ink bg-surface"
                    >
                        <div aria-hidden className="mx-auto mt-2.5 h-1 w-9 bg-line" />
                        <div className="flex items-center justify-between pl-4 pr-2 pt-2">
                            <h2 id={titleId} className="text-[1.0625rem] font-semibold">
                                Filter by tag
                            </h2>
                            <button
                                ref={closeRef}
                                type="button"
                                aria-label="Close"
                                onClick={() => closePanel(true)}
                                className="grid min-h-11 min-w-11 place-items-center text-ink"
                            >
                                <X aria-hidden className="h-4 w-4" />
                            </button>
                        </div>
                        {search}
                        {list}
                    </div>
                </>
            )}
        </div>
    );
}
