import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - Simple",
  description: "Page description",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}