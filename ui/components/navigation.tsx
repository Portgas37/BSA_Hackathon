"use client";

import { Menu } from "lucide-react";
import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="group fixed left-0 top-0 h-screen">
      <div className="w-12 group-hover:w-48 bg-gray-800 h-full transition-all duration-300">
        <div className="flex flex-col h-full p-4">
          {/* Top section with menu icon */}
          <div className="flex justify-center items-center mb-8">
            <Menu className="w-6 h-6 text-white transition-opacity duration-300" />
          </div>

          {/* Menu title */}
          <div className="text-white text-sm font-medium mb-8 text-center whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Navigation Menu
          </div>

          {/* Menu items - with flex-1 to push content down */}
          <div className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
            <div className="flex flex-col items-center space-y-8">
              <Link 
                href="/" 
                className="w-full text-white hover:text-cyan-400 transition-colors whitespace-nowrap text-center py-2"
              >
                Home
              </Link>
              
              <Link 
                href="/create-petition"
                className="w-full text-white hover:text-cyan-400 transition-colors whitespace-nowrap text-center py-2"
              >
                Create Petition
              </Link>
              
              <Link 
                href="/#about" 
                className="w-full text-white hover:text-cyan-400 transition-colors whitespace-nowrap text-center py-2"
              >
                About us
              </Link>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-24"></div>
        </div>
      </div>
    </nav>
  );
}