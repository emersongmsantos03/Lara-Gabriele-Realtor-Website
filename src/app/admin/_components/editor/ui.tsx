"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

export function TbButton({
  label,
  shortcut,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="tb-btn"
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      aria-pressed={active}
      data-active={active ? "true" : undefined}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** Closes when clicking anywhere else or pressing Escape. */
export function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export function Dropdown({
  label,
  value,
  options,
  onChange,
  width = 180,
  renderOption,
  buttonLabel,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
  width?: number;
  renderOption?: (o: { label: string; value: string }) => React.ReactNode;
  buttonLabel?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const current = options.find((o) => o.value === value) ?? options[0];
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="tb-btn gap-1.5 font-medium"
        title={label}
        aria-label={`${label}: ${current.label}`}
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
      >
        {buttonLabel ?? current.label}
        <ChevronDown size={14} className="opacity-60" />
      </button>
      {open && (
        <div className="pop top-10 left-0" style={{ width }} role="listbox" aria-label={label}>
          {options.map((o) => (
            <button
              key={o.label}
              type="button"
              role="option"
              aria-selected={o.value === current.value}
              className="pop-item"
              data-active={o.value === current.value ? "true" : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <span className="flex-1">{renderOption ? renderOption(o) : o.label}</span>
              {o.value === current.value && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ColorPicker({
  label,
  icon,
  colors,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  colors: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="tb-btn flex-col gap-0.5"
        title={label}
        aria-label={label}
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
        <span className="block h-[3px] w-4 rounded-full -mt-0.5" style={{ background: value || "#c7cfd6" }} />
      </button>
      {open && (
        <div className="pop top-10 left-0 w-[212px] p-3">
          <p className="text-xs font-medium text-[var(--a-muted)] mb-2">{label}</p>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((c) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                aria-label={c.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(c.value);
                  setOpen(false);
                }}
                className={`h-10 rounded-lg border flex items-center justify-center ${
                  (value || "") === c.value ? "ring-2 ring-[#2a78d6] ring-offset-1" : ""
                }`}
                style={{ background: c.value || "#fff", borderColor: c.value ? "transparent" : "var(--a-line)" }}
              >
                {!c.value && <X size={16} className="text-[var(--a-muted)]" />}
              </button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-[var(--a-muted)] cursor-pointer hover:text-[var(--a-text)]">
            <span className="relative h-7 w-7 rounded-md border border-dashed border-[#b9c3cc] flex items-center justify-center">
              +
              <input
                type="color"
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={value && value.startsWith("#") ? value.slice(0, 7) : "#c9671f"}
                onChange={(e) => onChange(e.target.value)}
              />
            </span>
            Any color…
          </label>
        </div>
      )}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[rgba(14,25,35,0.45)] p-0 sm:p-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`a-toast w-full ${wide ? "sm:max-w-[560px]" : "sm:max-w-[440px]"} bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-auto`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="tb-btn -mr-2" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-6 pt-3">{children}</div>
      </div>
    </div>
  );
}

export type PromptConfig = {
  title: string;
  label: string;
  help?: string;
  placeholder?: string;
  initial?: string;
  submit: string;
  remove?: string;
  onSubmit: (value: string) => void;
  onRemove?: () => void;
};

export function PromptDialog({ cfg, onClose }: { cfg: PromptConfig; onClose: () => void }) {
  const [value, setValue] = useState(cfg.initial ?? "");
  return (
    <Modal title={cfg.title} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          cfg.onSubmit(value.trim());
          onClose();
        }}
      >
        <label className="block">
          <span className="text-sm font-medium">{cfg.label}</span>
          <input autoFocus className="a-input mt-1.5" placeholder={cfg.placeholder} value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        {cfg.help && <p className="mt-2 text-sm text-[var(--a-muted)]">{cfg.help}</p>}
        <div className="mt-5 flex gap-2 justify-end">
          {cfg.onRemove && (
            <button
              type="button"
              className="a-btn a-btn-danger mr-auto"
              onClick={() => {
                cfg.onRemove!();
                onClose();
              }}
            >
              {cfg.remove ?? "Remove"}
            </button>
          )}
          <button type="button" className="a-btn a-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="a-btn a-btn-primary">
            {cfg.submit}
          </button>
        </div>
      </form>
    </Modal>
  );
}
