"use client";

export function AboutUs() {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-900"
      id="about"
    >
      <h2 className="text-5xl font-light mb-12 text-white">
        About <span className="text-cyan-500">Us</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="space-y-6">
          <h3 className="text-2xl font-light text-cyan-400">Our Mission</h3>
          <p className="text-gray-300 leading-relaxed">
            We are dedicated to revolutionizing the way people engage in democratic
            processes through blockchain technology. Our platform combines privacy,
            security, and accessibility to create a new standard for digital petitions.
          </p>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-light text-cyan-400">Our Vision</h3>
          <p className="text-gray-300 leading-relaxed">
            We envision a world where everyone can participate in social change while
            maintaining their privacy. Through zero-knowledge proofs and blockchain
            technology, we're making this vision a reality.
          </p>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="p-6 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
          <h4 className="text-xl font-medium mb-4 text-cyan-400">Privacy Focused</h4>
          <p className="text-gray-400">
            Protecting user identity while ensuring petition authenticity
          </p>
        </div>

        <div className="p-6 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
          <h4 className="text-xl font-medium mb-4 text-cyan-400">Transparent</h4>
          <p className="text-gray-400">
            Open and verifiable petition process on the blockchain
          </p>
        </div>

        <div className="p-6 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
          <h4 className="text-xl font-medium mb-4 text-cyan-400">Community Driven</h4>
          <p className="text-gray-400">Built for and powered by the community</p>
        </div>
      </div>
    </section>
  );
}
