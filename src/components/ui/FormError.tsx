import React from "react";

export default function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
      {message}
    </div>
  );
}
