"use client"

import { useState } from "react"
import { Navigation } from "./navigation"

export function CreatePetition() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    category: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating petition:", formData)
  }

  return (
    <div className="fixed inset-0 flex bg-gradient-to-b from-sky-50 to-white">
      <Navigation />
      <main className="flex-1 ml-12 overflow-auto">
        <div className="flex min-h-full items-center justify-center p-8">
          <div className="w-full max-w-3xl">
            <h1 className="text-4xl font-light text-center text-gray-800 mb-12">
              Create New Petition
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-lg">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Petition Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                  placeholder="Enter a clear, specific title for your petition"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                  placeholder="Describe your petition's purpose, goals, and why people should support it"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Number of Signatures
                  </label>
                  <input
                    type="number"
                    id="target"
                    name="target"
                    value={formData.target}
                    onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="e.g., 1000"
                    min="1"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="environment">Environment</option>
                    <option value="social">Social Justice</option>
                    <option value="education">Education</option>
                    <option value="health">Healthcare</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  className="px-8 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Create Petition
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}