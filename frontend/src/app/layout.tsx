import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payroll Configuration System",
  description: "Payroll configuration and management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <div className="min-h-screen bg-background text-foreground">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
