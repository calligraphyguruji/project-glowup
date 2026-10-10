import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectGlowUp AI — Engineering Audit for Student Codebases",
  description:
    "Auditing student repositories against target-company engineering standards (Razorpay, Swiggy, Zerodha, Amazon).",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-slate-100 antialiased selection:bg-primary-container selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
