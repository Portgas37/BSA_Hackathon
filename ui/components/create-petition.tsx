"use client"

import { useState } from "react"

export function CreatePetition() {
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating petition:", formData)
  }

  return (
    <div className="max-w-2xl mx-auto pt-20 px-4">
      <h1 className="text-4xl font-light mb-8 text-center">Create New Petition</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Petition Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Create Petition
          </button>
        </div>
      </form>
    </div>
  )
}