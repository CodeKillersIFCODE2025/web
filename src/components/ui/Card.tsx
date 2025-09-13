import React from "react";
export default function Card({ className="", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`} {...props} />;
}
