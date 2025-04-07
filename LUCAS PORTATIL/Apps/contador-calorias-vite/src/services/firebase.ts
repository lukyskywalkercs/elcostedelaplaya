import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc, getDoc } from 'firebase/firestore';
import type { FoodItem, UserProfile, DailyLog, MealGroup } from '../types/index';

const firebaseConfig = {
    apiKey: "AIzaSyCWPnBUU_Az9xF9wcGZTxUIMSLyso2RHNM",
    authDomain: "contador-calories.firebaseapp.com",
    projectId: "contador-calories",
    storageBucket: "contador-calories.appspot.com",
    messagingSenderId: "833054718107",
    appId: "1:833054718107:web:93c98e0a39c46631e46e3e",
    measurementId: "G-07LZKC2MNY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Función para guardar un alimento
export async function saveFoodToFirebase(food: FoodItem): Promise<void> {
    try {
        const foodsRef = collection(db, 'foods');
        await addDoc(foodsRef, {
            ...food,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error al guardar el alimento:', error);
        throw error;
    }
}

// Función para obtener alimentos
export async function getFoodsFromFirebase(): Promise<FoodItem[]> {
    try {
        const foodsRef = collection(db, 'foods');
        const querySnapshot = await getDocs(foodsRef);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FoodItem));
    } catch (error) {
        console.error('Error al obtener alimentos:', error);
        return [];
    }
}

// Función para eliminar un alimento
export async function deleteFoodFromFirebase(foodId: string): Promise<void> {
    try {
        if (!foodId) {
            console.error('No se puede eliminar un alimento sin ID');
            throw new Error('ID de alimento no proporcionado');
        }
        
        const foodRef = doc(db, 'foods', foodId);
        await deleteDoc(foodRef);
    } catch (error) {
        console.error('Error al eliminar el alimento:', error);
        throw error;
    }
}

// Función para añadir alimentos sin duplicar
async function addFoodIfNotExists(food: FoodItem) {
    try {
        const foodsRef = collection(db, 'foods');
        const q = query(foodsRef, where("food_name", "==", food.food_name));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            await addDoc(foodsRef, food);
            console.log(`Añadido: ${food.food_name}`);
        }
    } catch (error) {
        console.error(`Error al añadir ${food.food_name}:`, error);
    }
}

// Añadir todos los alimentos nuevos
async function addNewFoods() {
    const newFoods: FoodItem[] = [
        // Verduras
        { food_name: "Ajo", serving_qty: 100, serving_unit: "g", calories: 149, category: "Verduras" },
        { food_name: "Guisantes", serving_qty: 100, serving_unit: "g", calories: 81, category: "Verduras" },
        { food_name: "Patata", serving_qty: 100, serving_unit: "g", calories: 77, category: "Verduras" },
        { food_name: "Alcachofa", serving_qty: 100, serving_unit: "g", calories: 47, category: "Verduras" },
        { food_name: "Remolacha", serving_qty: 100, serving_unit: "g", calories: 43, category: "Verduras" },
        { food_name: "Cebolla", serving_qty: 100, serving_unit: "g", calories: 40, category: "Verduras" },
        { food_name: "Hinojo", serving_qty: 100, serving_unit: "g", calories: 31, category: "Verduras" },
        { food_name: "Berenjena", serving_qty: 100, serving_unit: "g", calories: 25, category: "Verduras" },
        { food_name: "Col", serving_qty: 100, serving_unit: "g", calories: 25, category: "Verduras" },
        { food_name: "Coliflor", serving_qty: 100, serving_unit: "g", calories: 25, category: "Verduras" },
        { food_name: "Setas", serving_qty: 100, serving_unit: "g", calories: 22, category: "Verduras" },
        { food_name: "Espárragos", serving_qty: 100, serving_unit: "g", calories: 20, category: "Verduras" },
        { food_name: "Acelgas", serving_qty: 100, serving_unit: "g", calories: 19, category: "Verduras" },
        { food_name: "Calabacín", serving_qty: 100, serving_unit: "g", calories: 17, category: "Verduras" },

        // Frutas
        { food_name: "Aguacate", serving_qty: 100, serving_unit: "g", calories: 160, category: "Frutas" },
        { food_name: "Higo", serving_qty: 100, serving_unit: "g", calories: 107, category: "Frutas" },
        { food_name: "Granada", serving_qty: 100, serving_unit: "g", calories: 83, category: "Frutas" },
        { food_name: "Cereza", serving_qty: 100, serving_unit: "g", calories: 50, category: "Frutas" },
        { food_name: "Ciruela", serving_qty: 100, serving_unit: "g", calories: 46, category: "Frutas" },
        { food_name: "Albaricoque", serving_qty: 100, serving_unit: "g", calories: 43, category: "Frutas" },
        { food_name: "Paraguayo", serving_qty: 100, serving_unit: "g", calories: 43, category: "Frutas" },
        { food_name: "Sandía", serving_qty: 100, serving_unit: "g", calories: 30, category: "Frutas" },
        { food_name: "Melón", serving_qty: 100, serving_unit: "g", calories: 30, category: "Frutas" },

        // Carnes
        { food_name: "Hamburguesa", serving_qty: 100, serving_unit: "g", calories: 291, category: "Carnes" },
        { food_name: "Chuletas de Cordero", serving_qty: 100, serving_unit: "g", calories: 250, category: "Carnes" },
        { food_name: "Muslo de Pollo sin Piel", serving_qty: 100, serving_unit: "g", calories: 195, category: "Carnes" },
        { food_name: "Escalope de Cerdo", serving_qty: 100, serving_unit: "g", calories: 105, category: "Carnes" },

        // Lácteos
        { food_name: "Queso de Cabra", serving_qty: 100, serving_unit: "g", calories: 364, category: "Lácteos" },
        { food_name: "Queso Mozzarella", serving_qty: 100, serving_unit: "g", calories: 280, category: "Lácteos" }
    ];

    console.log('Iniciando actualización de la base de datos...');
    for (const food of newFoods) {
        await addFoodIfNotExists(food);
    }
    console.log('Actualización completada');
}

// Ejecutar la actualización
addNewFoods().then(() => {
    console.log('Base de datos actualizada correctamente');
}).catch(error => {
    console.error('Error en la actualización:', error);
});

// Función para inicializar bebidas alcohólicas
export async function initializeDefaultDrinks() {
    const bebidasAlcoholicas = [
        {
            food_name: "Copa de Vino Tinto",
            serving_qty: 1,
            serving_unit: "copa",
            calories: 65,
            category: "Bebidas Alcohólicas",
            warningTime: true,
            isAlcohol: true
        },
        {
            food_name: "Copa de Vino Blanco",
            serving_qty: 1,
            serving_unit: "copa",
            calories: 85,
            category: "Bebidas Alcohólicas",
            warningTime: true,
            isAlcohol: true
        },
        {
            food_name: "Copa de Cava",
            serving_qty: 1,
            serving_unit: "copa",
            calories: 85,
            category: "Bebidas Alcohólicas",
            warningTime: true,
            isAlcohol: true
        },
        {
            food_name: "Cerveza",
            serving_qty: 1,
            serving_unit: "tercio",
            calories: 150,
            category: "Bebidas Alcohólicas",
            warningTime: true,
            isAlcohol: true
        },
        {
            food_name: "Cuba Libre",
            serving_qty: 1,
            serving_unit: "copa",
            calories: 160,
            category: "Bebidas Alcohólicas",
            warningTime: true,
            isAlcohol: true
        },
        {
            food_name: "Gin Tonic",
            serving_qty: 1,
            serving_unit: "copa",
            calories: 210,
            category: "Bebidas Alcohólicas",
            warningTime: true,
            isAlcohol: true
        },
        {
            food_name: "Vodka con Soda",
            serving_qty: 1,
            serving_unit: "copa",
            calories: 85,
            category: "Bebidas Alcohólicas",
            warningTime: true,
            isAlcohol: true
        }
    ];

    try {
        const foodsRef = collection(db, 'foods');
        for (const bebida of bebidasAlcoholicas) {
            const q = query(foodsRef, where("food_name", "==", bebida.food_name));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                await addDoc(foodsRef, {
                    ...bebida,
                    timestamp: new Date()
                });
                console.log(`Añadida: ${bebida.food_name}`);
            }
        }
        console.log('Bebidas alcohólicas inicializadas correctamente');
    } catch (error) {
        console.error('Error al inicializar bebidas:', error);
    }
}

// Añadir estas funciones para manejar los perfiles familiares
export async function getFamilyProfiles(): Promise<UserProfile[]> {
    try {
        const profilesRef = collection(db, 'userProfiles');
        const querySnapshot = await getDocs(profilesRef);
        const profiles = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as UserProfile)).filter(profile => profile.name); // Filtrar perfiles inválidos
        
        console.log('Perfiles obtenidos:', profiles); // Para debug
        return profiles;
    } catch (error) {
        console.error('Error al obtener perfiles:', error);
        return [];
    }
}

export async function saveUserProfile(profile: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    try {
        const profilesRef = collection(db, 'userProfiles');
        const profileData = {
            name: profile.name,
            weight: profile.weight,
            height: profile.height,
            age: profile.age,
            gender: profile.gender,
            activityLevel: profile.activityLevel,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const docRef = await addDoc(profilesRef, profileData);
        console.log('Perfil guardado con ID:', docRef.id); // Para debug
        
        return {
            id: docRef.id,
            ...profileData
        };
    } catch (error) {
        console.error('Error al guardar el perfil:', error);
        throw error;
    }
}

export async function updateUserProfile(profileId: string, profile: UserProfile): Promise<void> {
    try {
        if (!profileId) throw new Error('ID de perfil no válido');
        
        const docRef = doc(db, 'userProfiles', profileId);
        const updateData = {
            name: profile.name,
            weight: profile.weight,
            height: profile.height,
            age: profile.age,
            gender: profile.gender,
            activityLevel: profile.activityLevel,
            updatedAt: new Date()
        };
        
        await updateDoc(docRef, updateData);
        
        // Actualizar el perfil en localStorage también
        localStorage.setItem('currentProfile', JSON.stringify(profile));
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        throw error;
    }
}

// Añadir función para obtener un perfil específico
export async function getProfileById(profileId: string): Promise<UserProfile | null> {
    try {
        const docRef = doc(db, 'userProfiles', profileId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        return null;
    }
}

export async function deleteUserProfile(profileId: string): Promise<void> {
    try {
        const docRef = doc(db, 'userProfiles', profileId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error al eliminar el perfil:', error);
        throw error;
    }
}

// Función para obtener todos los alimentos
export async function getAllFoods(): Promise<FoodItem[]> {
    try {
        const foodsRef = collection(db, 'foods');
        const querySnapshot = await getDocs(foodsRef);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as FoodItem));
    } catch (error) {
        console.error('Error al obtener alimentos:', error);
        return [];
    }
}

export async function updateFoodInFirebase(food: FoodItem): Promise<void> {
    try {
        if (!food.id) {
            console.error('No se puede actualizar un alimento sin ID');
            throw new Error('ID de alimento no proporcionado');
        }
        
        const foodRef = doc(db, 'foods', food.id);
        const foodData = {
            food_name: food.food_name,
            serving_qty: food.serving_qty,
            serving_unit: food.serving_unit,
            calories: food.calories,
            category: food.category,
            timestamp: new Date()
        };
        
        await updateDoc(foodRef, foodData);
    } catch (error) {
        console.error('Error al actualizar el alimento:', error);
        throw error;
    }
}

// Función para guardar el registro diario
export async function saveDailyLog(userId: string, foods: FoodItem[], totalCalories: number): Promise<void> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const dailyLogsRef = collection(db, 'daily_logs');
        
        // Verificar si ya existe un registro para hoy
        const q = query(
            dailyLogsRef, 
            where('userId', '==', userId),
            where('date', '==', today)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            // Actualizar el registro existente
            const docRef = doc(db, 'daily_logs', querySnapshot.docs[0].id);
            await updateDoc(docRef, {
                totalCalories,
                foods,
                lastUpdated: new Date()
            });
        } else {
            // Crear nuevo registro
            await addDoc(dailyLogsRef, {
                userId,
                date: today,
                totalCalories,
                foods,
                created: new Date(),
                lastUpdated: new Date()
            });
        }
    } catch (error) {
        console.error('Error al guardar el registro diario:', error);
        throw error;
    }
}

// Función para obtener el histórico de registros
export async function getDailyLogs(userId: string, days: number = 7): Promise<DailyLog[]> {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const dailyLogsRef = collection(db, 'daily_logs');
        const q = query(
            dailyLogsRef,
            where('userId', '==', userId),
            where('date', '>=', startDate.toISOString().split('T')[0]),
            where('date', '<=', endDate.toISOString().split('T')[0])
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as DailyLog));
    } catch (error) {
        console.error('Error al obtener los registros diarios:', error);
        return [];
    }
}

// Guardar un grupo de comidas
export async function saveMealGroup(group: MealGroup): Promise<void> {
    try {
        // Limpiamos el objeto antes de guardarlo
        const cleanGroup = {
            name: group.name || '',
            type: group.type || '',
            description: group.description || '',
            foods: group.foods || [],
            totalCalories: group.totalCalories || 0,
            userId: group.userId || '',
            // No incluimos el id si es undefined
            ...(group.id ? { id: group.id } : {})
        };

        const mealGroupsRef = collection(db, 'meal_groups');
        if (group.id) {
            // Si tiene ID, actualizamos el documento existente
            await updateDoc(doc(mealGroupsRef, group.id), cleanGroup);
        } else {
            // Si no tiene ID, creamos uno nuevo
            const docRef = await addDoc(mealGroupsRef, cleanGroup);
            // Actualizamos el documento con su ID
            await updateDoc(docRef, { id: docRef.id });
        }
    } catch (error) {
        console.error('Error al guardar el grupo de comidas:', error);
        throw error;
    }
}

// Obtener grupos de comidas del usuario
export async function getMealGroups(userId: string): Promise<MealGroup[]> {
    try {
        const mealGroupsRef = collection(db, 'meal_groups');
        const q = query(mealGroupsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as MealGroup));
    } catch (error) {
        console.error('Error al obtener grupos de comidas:', error);
        throw error;
    }
}

// Eliminar un grupo de comidas
export async function deleteMealGroup(groupId: string): Promise<void> {
    try {
        const docRef = doc(db, 'meal_groups', groupId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error al eliminar el grupo de comidas:', error);
        throw error;
    }
}

// Función para añadir los alimentos del desayuno
export async function initializeBreakfastFoods() {
    const breakfastFoods: FoodItem[] = [
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
        }
    ];

    console.log('Inicializando alimentos del desayuno...');
    for (const food of breakfastFoods) {
        await addFoodIfNotExists(food);
    }
    console.log('Alimentos del desayuno inicializados');
}

// Función para crear el grupo de desayuno predeterminado
export async function createDefaultBreakfastGroup(userId: string) {
    try {
        // Verificar si ya existe un grupo de desayuno
        const mealGroupsRef = collection(db, 'meal_groups');
        const q = query(
            mealGroupsRef, 
            where('userId', '==', userId),
            where('name', '==', 'Mi Desayuno Habitual')
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            // Si no existe, crear el grupo
            const breakfastGroup: MealGroup = {
                userId,
                name: "Mi Desayuno Habitual",
                type: "desayuno",
                description: "Desayuno completo con proteínas, lácteos, pan y fruta",
                foods: [
                    {
                        food_name: "Proteína Mercadona",
                        serving_qty: 1,
                        serving_unit: "porción",
                        calories: 52
                    },
                    {
                        food_name: "Yogur sin lactosa Mercadona",
                        serving_qty: 125,
                        serving_unit: "g",
                        calories: 53
                    },
                    {
                        food_name: "Proteína Consum Real Whey Chocolate",
                        serving_qty: 30,
                        serving_unit: "g",
                        calories: 111
                    },
                    {
                        food_name: "Café solo",
                        serving_qty: 10,
                        serving_unit: "ml",
                        calories: 7
                    },
                    {
                        food_name: "Panecillo Integral sin Sal Mercadona",
                        serving_qty: 70,
                        serving_unit: "g",
                        calories: 202
                    },
                    {
                        food_name: "Jamón York Cocido Extra",
                        serving_qty: 22,
                        serving_unit: "g",
                        calories: 22
                    },
                    {
                        food_name: "Naranja Navel",
                        serving_qty: 140,
                        serving_unit: "g",
                        calories: 63
                    }
                ],
                totalCalories: 510
            };
            await saveMealGroup(breakfastGroup);
            console.log('Grupo de desayuno predeterminado creado');
        }
        return true;
    } catch (error) {
        console.error('Error al crear/verificar el grupo de desayuno:', error);
        return false;
    }
}

// Función para actualizar un grupo de comidas
export async function updateMealGroup(groupId: string, updatedGroup: MealGroup): Promise<void> {
    try {
        const docRef = doc(db, 'meal_groups', groupId);
        await updateDoc(docRef, {
            name: updatedGroup.name,
            type: updatedGroup.type,
            description: updatedGroup.description,
            foods: updatedGroup.foods,
            totalCalories: updatedGroup.totalCalories,
            userId: updatedGroup.userId
        });
    } catch (error) {
        console.error('Error al actualizar el grupo de comidas:', error);
        throw error;
    }
} 