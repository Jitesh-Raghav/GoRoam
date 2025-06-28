"use client";

import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

function Header1() {
    const { data: session, status } = useSession();

    const [isOpen, setOpen] = useState(false);
    return (
        <header className="w-full z-40 fixed top-0 left-0 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-white/20 dark:border-white/10">
            <div className="container relative mx-auto min-h-16 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
                {/* Logo Section */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt="GoRoam Logo"
                            width={40}
                            height={40}
                            className="w-12 h-12"
                        />
                        <span className="text-2xl font-bold text-orange-600/90">GoRoam</span>
                    </Link>
                </div>

                {/* Center - Empty for spacing */}
                <div className="flex lg:justify-center">
                </div>

                {/* Right Side Buttons */}
                <div className="flex justify-end w-full gap-4">
                    {session ? (
                        <>
                            <Button 
                                variant="outline"
                                className="hidden md:inline bg-white/20 hover:bg-white/30 text-orange-500 hover:text-orange-600 backdrop-blur-sm border-orange-500 hover:border-orange-600 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                                asChild
                            >
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <div className="border-r border-orange-500/30 hidden md:inline"></div>
                            <div className="flex items-center gap-2">
                                <img 
                                    src={session.user?.image || ""} 
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full border-2 border-orange-500/30 shadow-lg"
                                />
                                {/* <span className="text-orange-600/90 text-sm hidden md:inline">
                                    {session.user?.name}
                                </span> */}
                            </div>
                            <Button 
                                variant="outline" 
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="bg-white/20 hover:bg-orange-50/30 border-orange-500 hover:shadow-lg hover:shadow-orange-500/25 text-orange-500 hover:text-orange-600 backdrop-blur-sm hover:border-orange-600 transition-all duration-300"
                            >
                                Sign out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                variant="outline"
                                className="hidden md:inline bg-white/20 hover:bg-white/30 text-orange-500 hover:text-orange-600 backdrop-blur-sm border-orange-500 hover:border-orange-600 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                                asChild
                            >
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <div className="border-r border-orange-500/30 hidden md:inline"></div>
                            <Button 
                                variant="outline" 
                                className="bg-white/20 hover:bg-orange-50/30 border-orange-500 hover:shadow-lg hover:shadow-orange-500/25 text-orange-500 hover:text-orange-600 backdrop-blur-sm hover:border-orange-600 transition-all duration-300"
                                asChild
                            >
                                <Link href="/auth">Sign in</Link>
                            </Button>
                            <Button 
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 border-0 backdrop-blur-sm transition-all duration-300"
                                asChild
                            >
                                <Link href="/auth">Get started</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex w-12 shrink lg:hidden items-end justify-end">
                    <Button 
                        variant="ghost" 
                        onClick={() => setOpen(!isOpen)}
                        className="bg-orange-500/10 hover:bg-orange-500/20 text-white/90 hover:text-white backdrop-blur-sm border border-orange-500/20 hover:border-orange-500/30 transition-all duration-300"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                    {isOpen && (
                        <div className="absolute top-16 border-t border-orange-500/30 flex flex-col w-full right-0 bg-white/95 backdrop-blur-md shadow-lg py-4 container gap-4">
                            <Link
                                href="/dashboard"
                                className="flex justify-between items-center p-3 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                                onClick={() => setOpen(false)}
                            >
                                <span className="text-lg text-gray-900">Dashboard</span>
                            </Link>
                            {!session && (
                                <>
                                    <Link
                                        href="/auth"
                                        className="flex justify-between items-center p-3 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                                        onClick={() => setOpen(false)}
                                    >
                                        <span className="text-lg text-gray-900">Sign in</span>
                                    </Link>
                                    <Link
                                        href="/auth"
                                        className="flex justify-between items-center p-3 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200"
                                        onClick={() => setOpen(false)}
                                    >
                                        <span className="text-lg font-medium">Get started</span>
                                    </Link>
                                </>
                            )}
                            {session && (
                                <Button
                                    onClick={() => {
                                        signOut({ callbackUrl: "/" });
                                        setOpen(false);
                                    }}
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                    Sign out
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export { Header1 }; 