"use client";
import Link from "next/link";

import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function Footer() {
  return (
    <footer className="py-12 px-4 md:px-6 bg-white border-t border-gray-100">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <Link href="/" className="flex items-center gap-2">
            <Image
                            src="/logo.png"
                            alt="GoRoam Logo"
                            width={40}
                            height={40}
                            className="w-12 h-12"
                        />
              <h2 className="text-lg font-bold text-gray-900">GoRoam</h2>
            </Link>

            <h1 className="text-gray-600 mt-4">
              Built by{" "}
              <span className="text-orange-500">
                <Link href="https://github.com/goroam">@GoRoamTeam</Link>
              </span>
            </h1>
            <div className="mt-2">
              <Link href="https://x.com/compose/tweet?text=I%27ve%20been%20using%20%23GoRoam%20for%20travel%20planning%20-%20check%20it%20out!%20%40goroamapp">
                <Button variant='outline' className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  Share Your Journey On
                  <Icons.twitter className="icon-class ml-1 w-3.5" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-5">
              © {new Date().getFullYear()} GoRoam. All rights reserved.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/auth" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/#features" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/#testimonials" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Reviews
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="https://github.com/goroam" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Github
                  </Link>
                </li>
                <li>
                  <Link href="https://www.linkedin.com/company/goroam" className="text-gray-600 hover:text-orange-500 transition-colors">
                    LinkedIn
                  </Link>
                </li>
                <li>
                  <Link href="https://x.com/goroamapp" className="text-gray-600 hover:text-orange-500 transition-colors">
                    X (Twitter)
                  </Link>
                </li>
                <li>
                  <Link href="https://instagram.com/goroamapp" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Instagram
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs" className="text-gray-600 hover:text-orange-500 transition-colors">
                    API Docs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-600 hover:text-orange-500 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="w-full flex mt-4 items-center justify-center">
          <h1 className="text-center text-5xl md:text-5xl lg:text-[15rem] font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent select-none">
            GoRoam
          </h1>
        </div>
      </div>
    </footer>
  );
}

export { Footer }; 