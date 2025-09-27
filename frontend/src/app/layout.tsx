import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { headers } from 'next/headers'
import WagmiContextProvider from "@/context/wagmi-context";
import { AuthProvider } from "@/context/authContext";
import { AlertProvider } from "@/context/alertContext";
import NavBar from "@/components/navbar";

const poppins = Poppins({
  variable: '--font-poppins',
  weight: '100',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Mintellect - Convert your IP into tokenized assests",
  description: "Convert your IP into tokenized assests",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie')
  return (
    <html lang="en">
      <body
        className={`${poppins.variable}`}
      >

        <AlertProvider>
          <AuthProvider>
            <NavBar />
            {children}
          </AuthProvider>
        </AlertProvider>

      </body>
    </html>
  );
}
