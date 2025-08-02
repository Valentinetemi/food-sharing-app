"use client"

import { useState } from "react"
import { foods, Food } from "@/components/data/foods"

export default function CalorieSelector() {
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([])
  const [search, setSearch] = useState("")

  const handleAddFood = (food: Food) => {
    if (!selectedFoods.find(f => f.name === food.name)) {
      setSelectedFoods([...selectedFoods, food])
    }
  }

  const handleRemove = (index: number) => {
    const updated = [...selectedFoods]
    updated.splice(index, 1)
    setSelectedFoods(updated)
  }

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalCalories = selectedFoods.reduce((acc, item) => acc + item.calories, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 mobile-content-padding bg-gray-900 border-gray-800 rounded text-white space-y-4">
      <h2 className="text-xl font-semibold mb-4">🔎 Calorie Information</h2>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search for a food"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 rounded bg-zinc-800 text-white placeholder:text-gray-400"
        />
        
        <select
        onChange={(e) => {
          const selectedValue = e.target.value
          const food = foods.find(f => f.name === selectedValue)
          if (food) handleAddFood(food)
        }}
        className="w-full p-2 mb-4 rounded bg-zinc-800 text-white"
      >
        <option value="">-- Add a food --</option>
        {foods.map((food, index) => (
          <option key={index} value={food.name}>
            {food.name} — {food.calories} cal
          </option>
        ))}
      </select>
       </div>

      

      {/* Selected Food List */}
      <ul className="space-y-2">
        {selectedFoods.map((item, index) => (
          <li key={index} className="flex justify-between items-center bg-zinc-800 px-3 py-2 rounded">
            <span>{item.name} — {item.calories} cal</span>
            <button onClick={() => handleRemove(index)} className="text-red-400 hover:text-red-600">✖</button>
          </li>
        ))}
      </ul>

      {selectedFoods.length > 0 && (
        <>
          <div className="mt-6 text-gray-300">Selected:</div>
          <ul className="space-y-2 mt-2">
            {selectedFoods.map((item, index) => (
              <li key={index} className="flex justify-between items-center bg-zinc-800 px-3 py-2 rounded">
                <span>{item.name} — {item.calories} cal</span>
                <button onClick={() => handleRemove(index)} className="text-red-400 hover:text-red-600 text-sm">✖</button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-6 border-t border-zinc-700 pt-4 text-lg font-bold">
        Total: {totalCalories} cal
      </div>
    </div>
  )
}
