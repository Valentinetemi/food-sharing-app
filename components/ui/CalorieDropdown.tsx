"use client";

import { useState, useEffect } from "react";
import { foods, Food } from "../data/foods";

interface CalorieDropdownProps {
  onCalorieChange?: (calories: number) => void;
}

export default function CalorieDropdown({
  onCalorieChange,
}: CalorieDropdownProps) {
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState("");

  const handleAddFood = (food: Food) => {
    if (!selectedFoods.find((f) => f.name === food.name)) {
      setSelectedFoods([...selectedFoods, food]);
    }
  };

  const handleRemove = (index: number) => {
    const updated = [...selectedFoods];
    updated.splice(index, 1);
    setSelectedFoods(updated);
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCalories = selectedFoods.reduce(
    (acc, item) => acc + item.calories,
    0
  );

  // Notify parent component when total calories change
  useEffect(() => {
    if (onCalorieChange) {
      onCalorieChange(totalCalories);
    }
  }, [totalCalories, onCalorieChange]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-6 text-white space-y-4">
      <h2 className="text-xl font-semibold mb-4">Calorie Information</h2>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search for a food to check calories"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 bg-gray-800 rounded-lg text-white placeholder:text-gray-500"
        />
      </div>

      <p className="mb-2 text-gray-300">Quick suggestions:</p>
      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {filteredFoods.map((food, index) => (
          <li
            key={index}
            onClick={() => handleAddFood(food)}
            className="flex justify-between items-center bg-gray-800 hover:bg-gray-700 cursor-pointer px-4 py-2 rounded-lg"
          >
            <span>{food.name}</span>
            <span className="bg-green-800 text-green-300 px-2 py-1 rounded-full text-sm">
              {food.calories} cal
            </span>
          </li>
        ))}
      </ul>

      {selectedFoods.length > 0 && (
        <>
          <div className="mt-6 text-gray-200">Selected:</div>
          <ul className="space-y-2 mt-2">
            {selectedFoods.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded"
              >
                <span>
                  {item.name} — {item.calories} cal
                </span>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-6 border-t border-zinc-700 pt-4 text-lg font-bold">
        Total: {totalCalories} cal
      </div>
    </div>
  );
}
