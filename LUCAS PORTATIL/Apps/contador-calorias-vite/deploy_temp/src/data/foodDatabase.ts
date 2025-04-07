import type { FoodItem } from '../types/index';

export const foodDatabase: FoodItem[] = [
    // Carnes y embutidos
    { food_name: "Jamón Serrano", serving_qty: 100, serving_unit: "g", calories: 195, category: "Embutidos" },
    { food_name: "Jamón York", serving_qty: 100, serving_unit: "g", calories: 145, category: "Embutidos" },
    { food_name: "Chorizo", serving_qty: 100, serving_unit: "g", calories: 455, category: "Embutidos" },
    { food_name: "Pechuga de Pollo", serving_qty: 100, serving_unit: "g", calories: 165, category: "Carnes" },
    
    // Pan y cereales
    { food_name: "Pan Blanco", serving_qty: 100, serving_unit: "g", calories: 255, category: "Pan" },
    { food_name: "Pan Integral", serving_qty: 100, serving_unit: "g", calories: 240, category: "Pan" },
    { food_name: "Arroz Blanco", serving_qty: 100, serving_unit: "g", calories: 130, category: "Cereales" },
    
    // Frutas
    { food_name: "Plátano", serving_qty: 1, serving_unit: "unidad mediana", calories: 105, category: "Frutas" },
    { food_name: "Manzana", serving_qty: 1, serving_unit: "unidad mediana", calories: 95, category: "Frutas" },
    { food_name: "Naranja", serving_qty: 1, serving_unit: "unidad mediana", calories: 62, category: "Frutas" },
    
    // Lácteos
    { food_name: "Leche Entera", serving_qty: 250, serving_unit: "ml", calories: 158, category: "Lácteos" },
    { food_name: "Yogur Natural", serving_qty: 125, serving_unit: "g", calories: 69, category: "Lácteos" },
    { food_name: "Queso Manchego", serving_qty: 100, serving_unit: "g", calories: 376, category: "Lácteos" },
    
    // Verduras
    { food_name: "Tomate", serving_qty: 100, serving_unit: "g", calories: 22, category: "Verduras" },
    { food_name: "Lechuga", serving_qty: 100, serving_unit: "g", calories: 15, category: "Verduras" },
    { food_name: "Zanahoria", serving_qty: 100, serving_unit: "g", calories: 41, category: "Verduras" }
];

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
export function normalizeText(text: string): string {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// Función de búsqueda
export function searchFoodDatabase(query: string): FoodItem[] {
    const normalizedQuery = query.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    
    return foodDatabase.filter(food => 
        food.food_name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .includes(normalizedQuery)
    );
}

export type { FoodItem }; 