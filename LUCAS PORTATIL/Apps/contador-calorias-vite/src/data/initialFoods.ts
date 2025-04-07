import type { FoodItem } from '../types/index';

export const initialFoods: FoodItem[] = [
    // Mi desayuno habitual
    {
        food_name: "Proteína Mercadona",
        serving_qty: 1,
        serving_unit: "porción",
        calories: 52,
        category: "Proteínas"
    },
    {
        food_name: "Yogur sin lactosa Mercadona",
        serving_qty: 125,
        serving_unit: "g",
        calories: 53,
        category: "Lácteos"
    },
    {
        food_name: "Proteína Consum Real Whey Chocolate",
        serving_qty: 30,
        serving_unit: "g",
        calories: 111,
        category: "Proteínas"
    },
    {
        food_name: "Café solo",
        serving_qty: 10,
        serving_unit: "ml",
        calories: 7,
        category: "Bebidas"
    },
    {
        food_name: "Panecillo Integral sin Sal Mercadona",
        serving_qty: 70,
        serving_unit: "g",
        calories: 202,
        category: "Pan"
    },
    {
        food_name: "Jamón York Cocido Extra",
        serving_qty: 22,
        serving_unit: "g",
        calories: 22,
        category: "Embutidos"
    },
    {
        food_name: "Naranja Navel",
        serving_qty: 140,
        serving_unit: "g",
        calories: 63,
        category: "Frutas"
    },
    
    // Otros alimentos comunes
    { food_name: "Manzana", serving_qty: 1, serving_unit: "unidad mediana", calories: 95, category: "Frutas" },
    { food_name: "Plátano", serving_qty: 1, serving_unit: "unidad mediana", calories: 105, category: "Frutas" },
    { food_name: "Pera", serving_qty: 1, serving_unit: "unidad mediana", calories: 98, category: "Frutas" },
    
    // Verduras
    { food_name: "Zanahoria", serving_qty: 100, serving_unit: "g", calories: 41, category: "Verduras" },
    { food_name: "Tomate", serving_qty: 100, serving_unit: "g", calories: 22, category: "Verduras" },
    { food_name: "Lechuga", serving_qty: 100, serving_unit: "g", calories: 15, category: "Verduras" },
    { food_name: "Brócoli", serving_qty: 100, serving_unit: "g", calories: 34, category: "Verduras" },
    
    // Carnes
    { food_name: "Pechuga de Pollo", serving_qty: 100, serving_unit: "g", calories: 165, category: "Carnes" },
    { food_name: "Lomo de Cerdo", serving_qty: 100, serving_unit: "g", calories: 242, category: "Carnes" },
    { food_name: "Filete de Ternera", serving_qty: 100, serving_unit: "g", calories: 250, category: "Carnes" },
    { food_name: "Salmón", serving_qty: 100, serving_unit: "g", calories: 208, category: "Pescados" },
    
    // Lácteos
    { food_name: "Leche Entera", serving_qty: 250, serving_unit: "ml", calories: 158, category: "Lácteos" },
    { food_name: "Yogur Natural", serving_qty: 125, serving_unit: "g", calories: 69, category: "Lácteos" },
    { food_name: "Queso Fresco", serving_qty: 100, serving_unit: "g", calories: 264, category: "Lácteos" },
    
    // Cereales y Pan
    { food_name: "Pan Blanco", serving_qty: 100, serving_unit: "g", calories: 255, category: "Pan" },
    { food_name: "Pan Integral", serving_qty: 100, serving_unit: "g", calories: 247, category: "Pan" },
    { food_name: "Arroz Blanco Cocido", serving_qty: 100, serving_unit: "g", calories: 130, category: "Cereales" },
    { food_name: "Pasta Cocida", serving_qty: 100, serving_unit: "g", calories: 158, category: "Cereales" },
    
    // Legumbres
    { food_name: "Lentejas Cocidas", serving_qty: 100, serving_unit: "g", calories: 116, category: "Legumbres" },
    { food_name: "Garbanzos Cocidos", serving_qty: 100, serving_unit: "g", calories: 164, category: "Legumbres" },
    { food_name: "Judías Blancas Cocidas", serving_qty: 100, serving_unit: "g", calories: 147, category: "Legumbres" },
    
    // Frutos Secos
    { food_name: "Almendras", serving_qty: 30, serving_unit: "g", calories: 173, category: "Frutos Secos" },
    { food_name: "Nueces", serving_qty: 30, serving_unit: "g", calories: 185, category: "Frutos Secos" },
    
    // Bebidas
    { food_name: "Coca-Cola", serving_qty: 330, serving_unit: "ml", calories: 139, category: "Bebidas" },
    { food_name: "Zumo de Naranja", serving_qty: 250, serving_unit: "ml", calories: 115, category: "Bebidas" },
    
    // Snacks
    { food_name: "Patatas Fritas", serving_qty: 30, serving_unit: "g", calories: 159, category: "Snacks" },
    { food_name: "Chocolate Negro", serving_qty: 30, serving_unit: "g", calories: 170, category: "Snacks" },
    
    // Salsas y Condimentos
    { food_name: "Aceite de Oliva", serving_qty: 10, serving_unit: "ml", calories: 90, category: "Condimentos" },
    { food_name: "Mayonesa", serving_qty: 30, serving_unit: "g", calories: 220, category: "Salsas" }
]; 