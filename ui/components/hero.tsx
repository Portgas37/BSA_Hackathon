"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { AboutUs } from './AboutUs';
import { SecondPanel } from './second-panel';

export function Hero() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex">
      {/* Navigation Sidebar */}
      <nav className="bg-gray-800 p-4 h-screen fixed left-0 top-0 w-48">
        <div className="flex flex-col space-y-4">
          <div className="text-white text-lg mb-4 text-center">Petition Platform</div>
          <a href="#" className="text-white hover:text-cyan-400 transition-colors">Home</a>
          <div className="relative group">
            <button className="text-white hover:text-cyan-400 transition-colors w-full text-left">
              Petitions <ChevronDown className="inline-block ml-1" size={16} />
            </button>
            <div className="absolute left-full top-0 mt-0 w-48 bg-gray-800 rounded-md shadow-lg z-20 hidden group-hover:block border border-cyan-500/20">
              <a href="#active-petitions" className="block px-4 py-2 text-white hover:bg-gray-700">Active Petitions</a>
              <a href="#create-petition" className="block px-4 py-2 text-white hover:bg-gray-700">Create Petition</a>
              <a href="#my-signatures" className="block px-4 py-2 text-white hover:bg-gray-700">My Signatures</a>
            </div>
          </div>
          <a href="#wallet" className="text-white hover:text-cyan-400 transition-colors">Wallet</a>
          <a href="#about" className="text-white hover:text-cyan-400 transition-colors">About us</a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-48">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen text-center px-4 max-w-5xl mx-auto">
          <h2 className="text-5xl font-light mb-6 leading-tight">
            Decentralized <span className="font-normal text-cyan-500">Petition Platform</span>
          </h2>
          <p className="text-xl mb-8 max-w-2xl text-gray-600 dark:text-gray-300 font-light">
            Create and sign petitions with complete privacy using zero-knowledge proofs on the Mina Protocol blockchain.
          </p>
          
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-12" />
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto text-center mb-16">
            <div className="p-6 rounded-xl border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
              <h3 className="text-lg font-medium mb-2 text-cyan-400">Privacy First</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Sign petitions while keeping your identity protected through zero-knowledge proofs
              </p>
            </div>
            <div className="p-6 rounded-xl border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
              <h3 className="text-lg font-medium mb-2 text-cyan-400">Blockchain Powered</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Built on Mina Protocol for transparency, security, and decentralization
              </p>
            </div>
            <div className="p-6 rounded-xl border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
              <h3 className="text-lg font-medium mb-2 text-cyan-400">Easy to Use</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Simple interface to create, browse, and sign petitions securely
              </p>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 animate-bounce">
            <ChevronDown size={32} className="text-cyan-500/50" />
          </div>
        </section>

        {/* Additional Panels */}
        <SecondPanel />
        <AboutUs />
      </main>
    </div>
  );
}