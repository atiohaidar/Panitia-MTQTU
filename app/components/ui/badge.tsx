// app/components/ui/badge.tsx
// Status Badge Terpusat MTQ Tel-U 2026

import React from "react";

export type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  withDot?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "badge-neutral",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  info: "badge-info",
};

export function Badge({
  variant = "neutral",
  children,
  withDot = true,
  className = "",
  ...props
}: BadgeProps) {
  const variantClass = VARIANT_CLASSES[variant];
  return (
    <span
      className={`badge ${variantClass} ${!withDot ? "[&::before]:hidden" : ""} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
