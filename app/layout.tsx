import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectGlowUp AI — Engineering Audit for Student Codebases",
  description:
    "Auditing student repositories against target-company engineering standards (Razorpay, Swiggy, Zerodha, Amazon).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas-primary text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        {children}
      </body>
    </html>
  );
}
