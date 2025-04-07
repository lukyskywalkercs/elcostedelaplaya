export interface FoodItem {
    id?: string;
    food_name: string;
    serving_qty: number;
    serving_unit: string;
    calories: number;
    category?: string;
    warningTime?: boolean;
    isAlcohol?: boolean;
    timestamp?: Date;
}

export interface SearchResult {
    food_name: string;
    serving_qty: number;
    serving_unit: string;
    calories: number;
}

export interface DailyLog {
    id?: string;
    userId: string;
    date: string;
    totalCalories: number;
    foods: {
        food_name: string;
        serving_qty: number;
        serving_unit: string;
        calories: number;
        timestamp: Date;
    }[];
}

export interface FamilyMember {
    id: string;
    name: string;
    relationship: string;
}

export interface UserProfile {
    id?: string;
    name: string;
    weight: number;
    height: number;
    age: number;
    gender: 'male' | 'female';
    activityLevel: number;
}

export interface MealGroup {
    id?: string;
    userId: string;
    name: string;
    description?: string;
    foods: {
        food_name: string;
        serving_qty: number;
        serving_unit: string;
        calories: number;
    }[];
    totalCalories: number;
    type: 'desayuno' | 'almuerzo' | 'comida' | 'merienda' | 'cena' | 'otro';
} 