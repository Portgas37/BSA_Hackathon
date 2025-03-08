import { CreatePetition } from "@/components/create-petition"
import { Navigation } from "@/components/navigation"

export default function Page() {
  return (
    <div className="flex">
      <Navigation />
      <main className="flex-1 ml-48 min-h-screen bg-gray-50 dark:bg-gray-900">
        <CreatePetition />
      </main>
    </div>
  )
}