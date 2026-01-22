import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "zkPetition - Private Petition Platform",
  description:
    "Create and sign petitions anonymously using zero-knowledge proofs on Mina Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
