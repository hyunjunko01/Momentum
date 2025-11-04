import "../globals.css";
import { Providers } from "../(main)/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',  // CSS 변수로 설정
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Momentum",
    description: "A decentralized science platform",
};

// app/campaign/layout.tsx
export default function CampaignLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.variable} suppressHydrationWarning={true}>
                <Providers>
                    <Header />
                    {children}
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}