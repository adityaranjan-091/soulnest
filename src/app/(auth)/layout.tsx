import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Sanctuary | SoulNest",
  description:
    "Where deep stories find a home. Step into your quiet sanctuary for slow reading and mindful writing.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col justify-center min-h-[calc(100vh-4rem)]">
      {children}
    </div>
  );
}

