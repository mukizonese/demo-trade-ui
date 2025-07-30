'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitch } from '@/components/ui/theme-switch';
import { AuthNav } from '@/components/ui/auth-nav';
import Image from 'next/image';

interface NavigationItem {
  name: string;
  href: string;
}

interface MobileNavProps {
  navigation: NavigationItem[];
}

export function MobileNav({ navigation }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 bg-background border-b">
        {/* Logo */}
        <div className="flex items-center">
          <a
            href="/mukizone"
            target="_self"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Image
              className="dark:invert"
              src="/icons/mukizone-com.svg"
              alt="MukiZone"
              width={80}
              height={60}
              priority
            />
          </a>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <AuthNav />
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMenu}
            className="ml-2"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMenu}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6">
              <ul className="space-y-4">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block text-lg font-medium py-3 px-4 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={toggleMenu}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t">
              <div className="text-sm text-muted-foreground text-center">
                Trade Demo - Educational Purposes Only
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 