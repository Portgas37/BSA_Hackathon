import { ChevronDown } from "lucide-react"

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center px-4 max-w-5xl mx-auto relative">
      <h2 className="text-5xl font-light mb-6 leading-tight">
        Build on <span className="font-normal">Mina Protocol</span>
      </h2>
      <p className="text-xl mb-8 max-w-2xl text-gray-600 dark:text-gray-300 font-light">
        Experience the world's lightest blockchain with zero-knowledge proofs, enabling powerful decentralized
        applications with complete privacy.
      </p>
      <div className="h-px w-16 bg-gray-200 dark:bg-gray-700 my-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl mx-auto text-center mb-16">
        <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-medium mb-2">Private</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Built with zero-knowledge proofs for complete privacy
          </p>
        </div>
        <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-medium mb-2">Scalable</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">22kb blockchain that anyone can verify in seconds</p>
        </div>
        <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-medium mb-2">Secure</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Powered by participants and zero-knowledge technology
          </p>
        </div>
      </div>
      <div className="absolute bottom-8 animate-bounce">
        <ChevronDown size={32} className="text-gray-400 dark:text-gray-600" />
      </div>
    </section>
  )
}

