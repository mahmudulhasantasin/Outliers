'use client';

import React, {
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode
} from 'react';
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  Attachment01Icon,
  Cancel01Icon,
  File02Icon,
  Globe02Icon,
  Mic01Icon,
  PlusSignIcon,
  Tick02Icon
} from '@hugeicons/core-free-icons';

export interface PromptBarSource {
  key: string;
  name: string;
  description?: string;
  icon?: ReactNode | IconSvgElement;
  attach?: boolean;
}

export interface PromptBarCommand {
  key: string;
  name: string;
  description?: string;
}

export interface PromptBarSendDetail {
  attachments: string[];
}

export interface PromptBarProps {
  placeholder?: string;
  sources?: PromptBarSource[];
  commands?: PromptBarCommand[];
  busy?: boolean;
  onSend?: (text: string, detail: PromptBarSendDetail) => void;
  onStop?: () => void;
  onAttach?: () => string | string[] | void | Promise<string | string[] | void>;
  onDictate?: () => string | void | Promise<string | void>;
  background?: string;
  color?: string;
  menuBackground?: string;
  width?: number;
  radius?: number;
  maxRows?: number;
  morphDuration?: number;
  squash?: number;
  tilt?: number;
  pressScale?: number;
  className?: string;
}

type Row = {
  key: string;
  name: string;
  description?: string;
  tag?: string;
  icon?: ReactNode | IconSvgElement;
  attach?: boolean;
};
type Token = { kind: 'at' | 'slash'; query: string; start: number };
type Latest = Pick<PromptBarProps, 'onSend' | 'onStop' | 'onAttach' | 'onDictate'>;

interface SendGlyphProps {
  busy: boolean;
  morphDuration: number;
  squash: number;
  tilt: number;
}

const ARROW_UP = [12, 4.5, 18.5, 11, 14.25, 11, 14.25, 19.5, 9.75, 19.5, 9.75, 11, 5.5, 11];
const SQUARE = [12, 6, 18, 6, 18, 12, 18, 18, 6, 18, 6, 12, 6, 6];
const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];
const LINE = 22;

const DEFAULT_SOURCES: PromptBarSource[] = [
  {
    key: 'files',
    name: 'Attach Contract',
    description: 'Upload PDF or text',
    icon: Attachment01Icon,
    attach: true
  },
  { key: 'bdlaws', name: 'bdlaws Repository', description: 'Statutory provisions', icon: Globe02Icon }
];

const DEFAULT_COMMANDS: PromptBarCommand[] = [
  { key: 'audit', name: '/audit', description: 'Run complete compliance check' },
  { key: 'memo', name: '/memo', description: 'Generate verified legal memorandum' },
  { key: 'redline', name: '/redline', description: 'Propose balanced clause edits' }
];

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const pathAt = (a: number[], b: number[], t: number) => {
  let d = '';
  for (let i = 0; i < a.length; i += 2) {
    d += `${i ? 'L' : 'M'}${mix(a[i], b[i], t).toFixed(2)} ${mix(a[i + 1], b[i + 1], t).toFixed(2)}`;
  }
  return `${d}Z`;
};

const parseToken = (draft: string): Token | null => {
  const m = /(^|\s)([@/])([\w-]*)$/.exec(draft);
  if (!m) return null;
  return { kind: m[2] === '@' ? 'at' : 'slash', query: m[3].toLowerCase(), start: m.index + m[1].length };
};

const renderIcon = (icon: ReactNode | IconSvgElement, size: number) =>
  isValidElement(icon) ? icon : <HugeiconsIcon icon={icon as IconSvgElement} size={size} strokeWidth={1.8} />;

function SendGlyph({ busy, morphDuration, squash, tilt }: SendGlyphProps) {
  const reduce = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dir = useRef(busy ? 1 : -1);
  const t = useMotionValue(busy ? 1 : 0);

  useEffect(() => {
    const target = busy ? 1 : 0;
    dir.current = busy ? 1 : -1;
    if (t.get() === target) return undefined;
    const controls = animate(
      t,
      target,
      reduce ? { duration: 0 } : { duration: morphDuration / 1000, ease: EASE_IN_OUT }
    );
    return () => controls.stop();
  }, [busy, morphDuration, reduce, t]);

  useMotionValueEvent(t, 'change', v => {
    pathRef.current?.setAttribute('d', pathAt(ARROW_UP, SQUARE, v));
    const goo = reduce ? 0 : Math.sin(v * Math.PI);
    const sx = 1 - squash * goo;
    if (svgRef.current) {
      svgRef.current.style.transform = goo ? `rotate(${dir.current * tilt * goo}deg) scale(${sx}, ${1 / sx})` : '';
    }
  });

  return (
    <svg
      ref={svgRef}
      className="block h-4 w-4 origin-center"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path ref={pathRef} d={pathAt(ARROW_UP, SQUARE, t.get())} />
    </svg>
  );
}

const STYLE = `
@keyframes prompt-bar-pop { from { opacity: 0; transform: translateY(4px) scale(0.98); } }
@keyframes prompt-bar-eq { 0%, 100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
`;

export default function PromptBar({
  placeholder = 'Ask anything',
  sources = DEFAULT_SOURCES,
  commands = DEFAULT_COMMANDS,
  busy = false,
  onSend,
  onStop,
  onAttach,
  onDictate,
  background = '#FFFFFF',
  color = '#111111',
  menuBackground = '#FFFFFF',
  width = 640,
  radius = 20,
  maxRows = 5,
  morphDuration = 240,
  squash = 0.12,
  tilt = 8,
  pressScale = 0.96,
  className = ''
}: PromptBarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastOpen = useRef<string | null>(null);
  const dictation = useRef(0);
  const latest = useRef<Latest>({});
  latest.current = { onSend, onStop, onAttach, onDictate };

  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [plusOpen, setPlusOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const [listening, setListening] = useState(false);
  const [pressed, setPressed] = useState(false);

  const token = dismissed ? null : parseToken(draft);
  const open = plusOpen ? 'at' : (token?.kind ?? null);
  const query = plusOpen ? '' : (token?.query ?? '');

  const list = useMemo<Row[]>(() => {
    if (open === 'at') return sources.filter(s => s.name.toLowerCase().includes(query));
    if (open === 'slash') return commands.filter(c => c.name.replace(/^\//, '').toLowerCase().startsWith(query));
    return [];
  }, [open, query, sources, commands]);

  const cursor = Math.min(active, Math.max(0, list.length - 1));
  const canSend = draft.trim().length > 0 || attachments.length > 0;
  const armed = busy || canSend;

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });
  const closeMenus = useCallback(() => {
    setPlusOpen(false);
  }, []);

  useLayoutEffect(() => {
    const glow = glowRef.current;
    if (!glow || !open) return;
    const row = rowRefs.current[cursor];
    if (!row) {
      glow.style.opacity = '0';
      return;
    }
    const fresh = lastOpen.current !== open;
    lastOpen.current = open;
    if (fresh) glow.style.transition = 'none';
    glow.style.top = `${row.offsetTop}px`;
    glow.style.height = `${row.offsetHeight}px`;
    glow.style.opacity = '1';
    if (fresh) {
      void glow.offsetHeight;
      glow.style.transition = '';
    }
  }, [open, cursor, list]);

  useEffect(() => {
    if (!open) lastOpen.current = null;
  }, [open]);

  useEffect(() => {
    if (!plusOpen) return undefined;
    const onDown = (e: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeMenus();
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [plusOpen, closeMenus]);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = '0px';
    const max = LINE * maxRows;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }, [draft, maxRows]);

  useEffect(
    () => () => {
      dictation.current += 1;
    },
    []
  );

  const pick = (row: Row) => {
    const head = token ? draft.slice(0, token.start) : draft;
    if (row.attach) {
      setDraft(head);
      Promise.resolve(latest.current.onAttach?.()).then(files => {
        if (!files) return;
        setAttachments(a => [...a, ...(Array.isArray(files) ? files : [files])]);
      });
    } else if (open === 'at') {
      setDraft(`${head}@${row.name} `);
    } else {
      setDraft(`${head}${row.name} `);
    }
    setPlusOpen(false);
    setDismissed(false);
    focusInput();
  };

  const send = () => {
    if (!canSend || busy) return;
    latest.current.onSend?.(draft.trim(), { attachments });
    setDraft('');
    setAttachments([]);
    setDismissed(false);
    closeMenus();
    focusInput();
  };

  const toggleListen = () => {
    if (listening) {
      dictation.current += 1;
      setListening(false);
      return;
    }
    const seq = ++dictation.current;
    setListening(true);
    Promise.resolve(latest.current.onDictate?.()).then(
      text => {
        if (seq !== dictation.current) return;
        setListening(false);
        if (text) setDraft(d => (d.trim() ? `${d.trimEnd()} ${text}` : text));
        focusInput();
      },
      () => {
        if (seq === dictation.current) setListening(false);
      }
    );
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (open && list.length) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((cursor + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length);
        return;
      }
      if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') {
        e.preventDefault();
        pick(list[cursor]);
        return;
      }
    }
    if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setDismissed(true);
        closeMenus();
      }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || !armed) return;
    setPressed(true);
  };
  const up = () => setPressed(false);

  return (
    <div
      ref={rootRef}
      className={`group relative text-[14px] leading-[22px] w-full [color:var(--pb-ink)]${className ? ` ${className}` : ''}`}
      data-busy={busy ? '' : undefined}
      style={
        {
          '--pb-bg': background,
          '--pb-ink': color,
          '--pb-menu': menuBackground,
          width: `${width}px`,
          maxWidth: '100%',
          '--pb-radius': `${radius}px`,
          '--pb-press': pressScale
        } as CSSProperties
      }
    >
      <style>{STYLE}</style>
      {open ? (
        <div
          className="absolute inset-x-0 bottom-[calc(100%+8px)] z-20 origin-bottom rounded-2xl p-1.5 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.18)] [animation:prompt-bar-pop_180ms_cubic-bezier(0.23,1,0.32,1)_both] [background:var(--pb-menu)] motion-reduce:[animation:none] border-0"
          role="listbox"
          aria-label={open === 'at' ? 'Sources' : 'Commands'}
        >
          <span
            ref={glowRef}
            className="pointer-events-none absolute inset-x-1.5 rounded-xl opacity-0 [background:rgba(0,0,0,0.05)] [transition:top_220ms_cubic-bezier(0.23,1,0.32,1),height_220ms_cubic-bezier(0.23,1,0.32,1),opacity_150ms_ease] motion-reduce:[transition:opacity_150ms_ease]"
            aria-hidden="true"
          />
          {list.map((row, i) => (
            <button
              key={row.key}
              ref={el => {
                rowRefs.current[i] = el;
              }}
              type="button"
              role="option"
              aria-selected={i === cursor}
              className="relative z-[1] flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-xl border-0 bg-transparent px-3 text-left text-inherit outline-none font-sans"
              onMouseDown={e => e.preventDefault()}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(row)}
            >
              {open === 'at' ? (
                <span className="inline-flex w-5 flex-none justify-center opacity-60">
                  {renderIcon(row.icon, 15)}
                </span>
              ) : null}
              <span className="flex-none text-[13px] font-semibold">{row.name}</span>
              {row.description ? (
                <span className="min-w-0 flex-auto truncate text-[12px] opacity-60">
                  {row.description}
                </span>
              ) : null}
            </button>
          ))}
          {list.length === 0 ? (
            <div className="flex h-9 items-center px-3 text-[12px] opacity-60 font-sans">
              No matches for “{query}”
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className="relative isolate flex cursor-text flex-col gap-2 p-3.5 [background:var(--pb-bg)] [border-radius:var(--pb-radius)] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-0"
        role="presentation"
        onPointerDown={e => {
          if (e.target === e.currentTarget || e.target === inputRef.current) closeMenus();
        }}
        onClick={focusInput}
      >
        {attachments.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {attachments.map((file, i) => (
              <span
                key={`${file}-${i}`}
                className="inline-flex h-[26px] items-center gap-1.5 rounded-lg pr-1.5 pl-2 text-[12px] bg-neutral-100 text-neutral-800"
              >
                <HugeiconsIcon icon={File02Icon} size={12} strokeWidth={2} />
                <span className="max-w-[160px] truncate font-medium">{file}</span>
                <button
                  type="button"
                  className="inline-grid h-[18px] w-[18px] cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 text-inherit opacity-60 hover:opacity-100 hover:bg-neutral-200"
                  aria-label={`Remove ${file}`}
                  onClick={() => setAttachments(a => a.filter((_, j) => j !== i))}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={10} strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <textarea
          ref={inputRef}
          className="block w-full resize-none border-0 bg-transparent p-1 text-[15px] leading-[22px] text-neutral-900 outline-none font-sans placeholder:text-neutral-400"
          rows={1}
          value={draft}
          placeholder={listening ? 'Listening…' : placeholder}
          aria-label="Prompt"
          onChange={e => {
            setDraft(e.target.value);
            setDismissed(false);
            closeMenus();
            setActive(0);
          }}
          onFocus={closeMenus}
          onKeyDown={onKeyDown}
        />

        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            className="inline-grid h-8 w-8 flex-none cursor-pointer place-items-center rounded-xl border-0 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 outline-none transition-colors"
            aria-label="Add files and sources"
            aria-expanded={plusOpen}
            onMouseDown={e => e.preventDefault()}
            onClick={() => {
              setActive(0);
              setPlusOpen(v => !v);
              focusInput();
            }}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.2} />
          </button>

          <span className="flex-auto" />

          {onDictate ? (
            <button
              type="button"
              className="inline-grid h-8 w-8 flex-none cursor-pointer place-items-center rounded-xl border-0 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 outline-none transition-colors"
              aria-label={listening ? 'Stop dictation' : 'Dictate'}
              aria-pressed={listening}
              onMouseDown={e => e.preventDefault()}
              onClick={toggleListen}
            >
              {listening ? (
                <span className="flex h-3.5 items-center gap-[2.5px] [&>i]:block [&>i]:h-full [&>i]:w-[2.5px] [&>i]:rounded-full [&>i]:bg-red-500 [&>i]:animate-pulse">
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                <HugeiconsIcon icon={Mic01Icon} size={15} strokeWidth={2} />
              )}
            </button>
          ) : null}

          <button
            type="button"
            className="relative inline-grid h-8 w-8 flex-none cursor-pointer place-items-center rounded-xl border-0 bg-black text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-black transition-colors shadow-sm outline-none"
            disabled={!armed}
            aria-label={busy ? 'Stop' : 'Send'}
            onMouseDown={e => e.preventDefault()}
            onPointerDown={down}
            onPointerUp={up}
            onPointerCancel={up}
            onPointerLeave={up}
            onClick={() => {
              if (busy) latest.current.onStop?.();
              else send();
            }}
          >
            <SendGlyph busy={busy} morphDuration={morphDuration} squash={squash} tilt={tilt} />
          </button>
        </div>
      </div>
    </div>
  );
}
