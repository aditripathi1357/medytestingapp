import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Medmin",
  description: "Health Care management Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AuthProvider>{children}</AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
