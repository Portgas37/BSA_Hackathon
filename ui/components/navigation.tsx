"use client";

import { ChevronDown, Menu } from "lucide-react";
import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="group fixed left-0 top-0 h-screen">
      <div className="w-12 group-hover:w-48 bg-gray-800 h-full transition-all duration-300">
        <div className="flex flex-col space-y-4 p-4">
        <div className="flex justify-center items-center">
            <Menu className="w-6 h-6 text-white transition-opacity duration-300" />
          </div>
        <div className="text-white text-sm font-medium mb-4 text-center whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Navigation Menu
          </div>
          {/* Menu items */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-white hover:text-cyan-400 transition-colors whitespace-nowrap">Home</Link>
              <div className="relative group/dropdown">
                <div className="text-white hover:text-cyan-400 transition-colors w-full text-left whitespace-nowrap">
                  Petitions <ChevronDown className="inline-block ml-1" size={16} />
                </div>
                <div className="absolute left-full top-0 mt-0 w-48 bg-gray-800 rounded-md shadow-lg z-20 hidden group-hover/dropdown:block border border-cyan-500/20">
              
                  <Link 
                    href="/create-petition"
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                  >
                    Create Petition
                  </Link>
                </div>
              </div>
              <Link href="/#about" className="text-white hover:text-cyan-400 transition-colors whitespace-nowrap">About us</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}