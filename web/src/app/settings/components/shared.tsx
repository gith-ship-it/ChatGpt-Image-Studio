"use client";

import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { ConfigPayload } from "@/lib/api";

export type SetConfigSection = <K extends keyof ConfigPayload>(
  section: K,
  nextValue: ConfigPayload[K],
) => void;

export type TooltipDetail = {
  title: string;
  body: ReactNode;
};

export function HintTooltip({ content }: { content: ReactNode }) {
  return (
    <span className="group relative inline-flex items-center align-middle">
      <span
        tabIndex={0}
        className="inline-flex size-4 cursor-help items-center justify-center rounded-full text-stone-400 transition-colors hover:text-stone-700 focus-visible:text-stone-700 focus-visible:outline-none"
        aria-label="查看配置说明"
      >
        <CircleHelp className="size-4" />
      </span>
      <span className="pointer-events-none absolute top-full left-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs font-normal leading-6 text-stone-600 opacity-0 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)] transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
        {content}
      </span>
    </span>
  );
}

export function LabelWithHint({
  label,
  tooltip,
}: {
  label: ReactNode;
  tooltip?: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      {tooltip ? <HintTooltip content={tooltip} /> : null}
    </span>
  );
}

export function TooltipDetails({ items }: { items: TooltipDetail[] }) {
  return (
    <>
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className={index === 0 ? "" : "mt-2"}>
          <span className="font-semibold text-stone-800">{item.title}：</span>
          {item.body}
        </div>
      ))}
    </>
  );
}

export function ConfigSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-stone-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
      <CardContent className="space-y-5 p-6">
        <div>
          <div className="text-base font-semibold tracking-tight text-stone-900">{title}</div>
          <p className="mt-1 text-sm leading-6 text-stone-500">{description}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">{children}</div>
      </CardContent>
    </Card>
  );
}

export function Field({
  label,
  hint,
  tooltip,
  children,
  fullWidth = false,
}: {
  label: ReactNode;
  hint: string;
  tooltip?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <label className={fullWidth ? "space-y-2 md:col-span-2" : "space-y-2"}>
      <div className="text-sm font-medium text-stone-700">
        <LabelWithHint label={label} tooltip={tooltip ?? hint} />
      </div>
      <div>{children}</div>
      <div className="text-xs leading-5 text-stone-400">{hint}</div>
    </label>
  );
}

export function ToggleField({
  label,
  hint,
  tooltip,
  checked,
  onCheckedChange,
}: {
  label: ReactNode;
  hint: string;
  tooltip?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 md:col-span-2">
      <div className="flex items-start gap-3">
        <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(Boolean(value))} />
        <div className="min-w-0">
          <div className="text-sm font-medium text-stone-700">
            <LabelWithHint label={label} tooltip={tooltip ?? hint} />
          </div>
          <div className="mt-1 text-xs leading-5 text-stone-400">{hint}</div>
        </div>
      </div>
    </div>
  );
}
