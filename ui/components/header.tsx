import Image from "next/image"
import { WalletButton } from "./wallet-button"

export function Header() {
  return (
    <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mina-mina1696.jpg-yM1I4uOyfI1rFrFwomiJiZekpTpnVd.jpeg"
          alt="Mina Protocol Logo"
          width={120}
          height={40}
          className="dark:invert"
        />
        <span className="text-xl font-light ml-2 hidden sm:inline">| ZkApp</span>
      </div>
      <WalletButton />
    </header>
  )
}

