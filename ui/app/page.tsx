// app/page.tsx
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { SecondPanel } from "@/components/second-panel"

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <SecondPanel />
    </main>
  )
}