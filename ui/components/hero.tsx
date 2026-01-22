"use client";

import { ChevronDown } from "lucide-react";
import { AboutUs } from "./about-us";
import { PetitionList } from "./petition-list";
import { Navigation } from "./navigation";

export function Hero() {
  return (
    <div className="flex min-h-screen w-full">
      <Navigation />
      <main className="flex-1 ml-12 transition-all duration-300">
        <section className="relative flex flex-col items-center justify-center min-h-screen w-screen text-center">
          <div
            className="absolute inset-0 w-full h-full -z-10"
            style={{
              backgroundImage: "url('/images/mina.jpg.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/30 -z-10" />

          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-5xl font-light mb-6 leading-tight text-white">
              Decentralized <span className="font-normal text-cyan-400">Petition Platform</span>
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-100 font-light">
              Create and sign petitions with complete privacy using zero-knowledge proofs on
              the Mina Protocol blockchain.
            </p>

            <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-12 mx-auto" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto text-center mb-16">
              <div className="p-6">
                <h3 className="text-xl font-medium text-cyan-400 mb-2">Private</h3>
                <p className="text-gray-300">Your identity remains hidden through zk-SNARKs</p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-medium text-cyan-400 mb-2">Verifiable</h3>
                <p className="text-gray-300">Every signature is cryptographically proven</p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-medium text-cyan-400 mb-2">Decentralized</h3>
                <p className="text-gray-300">No central authority controls the petitions</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 animate-bounce">
            <ChevronDown size={32} className="text-cyan-400" />
          </div>
        </section>

        <PetitionList />
        <AboutUs />
      </main>
    </div>
  );
}
