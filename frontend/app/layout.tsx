import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(defaultUrl),
    title: "Congruency",
    description: "Agreement Lifecycle Management Made Easy",
};

const geistSans = Geist({
    display: "swap",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={geistSans.className}
            suppressHydrationWarning
        >
            <body className="bg-background text-foreground">
                <main className="min-h-screen flex flex-col items-center">
                    <div className="flex-1 w-full flex flex-col gap-3 items-center">
                        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                            <div className="w-full max-w-full flex justify-between items-center p-3 px-5 text-sm">
                                <div className="flex gap-5 items-center">
                                    <Link
                                        href={"/"}
                                        className="text-2xl hover:font-bold hover:text-teal-400 duration-500"
                                    >
                                        Congruency
                                    </Link>
                                    <Link
                                        href={"/about"}
                                        className="text-2xl hover:font-bold hover:text-teal-400 duration-500"
                                    >
                                        About
                                    </Link>
                                </div>
                                {!hasEnvVars ? (
                                    <EnvVarWarning />
                                ) : (
                                    <HeaderAuth />
                                )}
                            </div>
                        </nav>
                        <div>{children}</div>
                    </div>
                </main>
            </body>
        </html>
    );
}
