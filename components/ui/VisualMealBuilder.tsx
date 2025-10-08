import React, { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  FireIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Import your foods array
import { foods, Food } from "@/components/data/foods";

interface FoodItem extends Food {
  servings: number;
}

interface VisualMealBuilderProps {
  onCalorieChange: (calories: number) => void;
}

const VisualMealBuilder: React.FC<VisualMealBuilderProps> = ({
  onCalorieChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Calculate total calories
  const totalCalories = useMemo(() => {
    const total = selectedFoods.reduce(
      (sum, food) => sum + food.calories * food.servings,
      0
    );
    onCalorieChange(total);
    return total;
  }, [selectedFoods, onCalorieChange]);

  // Filter foods based on search
  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return foods.slice(0, 20);
    const query = searchQuery.toLowerCase();
    return foods
      .filter((food) => food.name.toLowerCase().includes(query))
      .slice(0, 20);
  }, [searchQuery]);

  const addFood = (food: Food) => {
    const existing = selectedFoods.find((f) => f.name === food.name);
    if (existing) {
      setSelectedFoods(
        selectedFoods.map((f) =>
          f.name === food.name ? { ...f, servings: f.servings + 1 } : f
        )
      );
    } else {
      setSelectedFoods([...selectedFoods, { ...food, servings: 1 }]);
    }
    setSearchQuery("");
  };

  const updateServings = (foodName: string, delta: number) => {
    setSelectedFoods(
      selectedFoods
        .map((f) => {
          if (f.name === foodName) {
            const newServings = Math.max(0, f.servings + delta);
            return newServings === 0 ? null : { ...f, servings: newServings };
          }
          return f;
        })
        .filter(Boolean) as FoodItem[]
    );
  };

  const removeFood = (foodName: string) => {
    setSelectedFoods(selectedFoods.filter((f) => f.name !== foodName));
  };

  const getCalorieColor = (cal: number) => {
    if (cal < 100) return "text-green-400";
    if (cal < 300) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 border-gray-800 shadow-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border-b border-gray-800">
        <CardTitle className="text-gray-100 flex items-center gap-2">
          <FireIcon className="h-5 w-5 text-orange-500" />
          Build Your Meal
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Total Calories Display */}
        <div className="relative">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm font-medium">
                Total Calories
              </span>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                {selectedFoods.length}{" "}
                {selectedFoods.length === 1 ? "item" : "items"}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">
                {totalCalories}
              </span>
              <span className="text-gray-400 text-lg">kcal</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min((totalCalories / 2000) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0</span>
              <span>2000 kcal daily goal</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search foods (e.g., rice, chicken, plantain)..."
              className="pl-10 bg-gray-800 border-gray-700 text-gray-100 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery && (
            <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
              {filteredFoods.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredFoods.map((food) => (
                    <button
                      key={food.name}
                      onClick={() => {
                        addFood(food);
                        setIsSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition-colors text-left group"
                    >
                      <div className="flex-1">
                        <p className="text-gray-100 font-medium group-hover:text-white">
                          {food.name}
                        </p>
                        <p
                          className={`text-sm ${getCalorieColor(
                            food.calories
                          )}`}
                        >
                          {food.calories} kcal per serving
                        </p>
                      </div>
                      <PlusIcon className="h-5 w-5 text-gray-500 group-hover:text-orange-500" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No foods found</p>
                  <p className="text-sm mt-1">Try different keywords</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Foods */}
        {selectedFoods.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-green-500" />
              Your Meal
            </h3>
            <div className="space-y-2">
              {selectedFoods.map((food) => (
                <div
                  key={food.name}
                  className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-100 font-medium truncate">
                        {food.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {food.calories} kcal × {food.servings} ={" "}
                        <span
                          className={`font-semibold ${getCalorieColor(
                            food.calories * food.servings
                          )}`}
                        >
                          {food.calories * food.servings} kcal
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Servings Control */}
                      <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => updateServings(food.name, -1)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <MinusIcon
                            className="h-4 w-4 text-gray-400"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Decrease servings</span>
                        </button>
                        <span className="px-3 text-gray-100 font-medium min-w-[2rem] text-center">
                          {food.servings}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateServings(food.name, 1)}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <PlusIcon
                            className="h-4 w-4 text-gray-400"
                            aria-hidden="true"
                          />
                          <span className="sr-only">Increase servings</span>
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFood(food.name)}
                        className="p-1 hover:bg-red-900/30 rounded transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={`Remove ${food.name}`}
                      >
                        <XMarkIcon
                          className="h-4 w-4 text-red-400"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <Button
              onClick={() => setSelectedFoods([])}
              variant="ghost"
              className="w-full text-gray-400 hover:text-gray-300 hover:bg-gray-800"
            >
              Clear All
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-gray-400 mb-1">No foods added yet</p>
            <p className="text-sm text-gray-600">
              Search and add foods to build your meal
            </p>
          </div>
        )}

        {/* Popular Foods Quick Add */}
        {selectedFoods.length === 0 && !searchQuery && (
          <div className="space-y-3 pt-4 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400">Popular Foods</h3>
            <div className="grid grid-cols-2 gap-2">
              {foods.slice(0, 6).map((food) => (
                <button
                  key={food.name}
                  onClick={() => addFood(food)}
                  className="p-3 bg-gray-800/30 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-lg transition-all text-left group"
                >
                  <p className="text-sm text-gray-300 group-hover:text-white font-medium truncate">
                    {food.name}
                  </p>
                  <p className={`text-xs ${getCalorieColor(food.calories)}`}>
                    {food.calories} kcal
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualMealBuilder;
