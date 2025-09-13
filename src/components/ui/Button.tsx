import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
};

export default function Button({ className="", variant="default", ...props }: Props) {
  const base = "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[.98]";
  const map = {
    default: "bg-blue-600 text-white hover:bg-blue-500 disabled:bg-blue-300",
    ghost:   "bg-white hover:bg-gray-100 text-gray-800 disabled:text-gray-400",
    outline: "border border-gray-300 bg-white hover:bg-gray-100 text-gray-800",
  } as const;
  return <button className={`${base} ${map[variant]} ${className}`} {...props} />;
}
