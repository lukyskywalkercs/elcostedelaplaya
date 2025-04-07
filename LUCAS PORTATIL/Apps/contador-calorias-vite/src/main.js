import './style.css'
import { 
    // Comentar los imports no utilizados
    // db,
    saveFoodToFirebase,
    getFoodsFromFirebase,
    saveUserProfile,
    getFamilyProfiles,
    deleteUserProfile,
    // updateUserProfile,
    // updateFoodInFirebase,
    deleteFoodFromFirebase,
    saveDailyLog,
    getDailyLogs,
    getMealGroups,
    saveMealGroup,
    deleteMealGroup
} from './services/firebase'
import type { FoodItem, UserProfile, MealGroup } from './types/index'
// Eliminar esta importación no utilizada
// import { collection, query, where, getDocs } from 'firebase/firestore'

// Mantener la variable pero comentarla
// let userProfile: UserProfile | null = JSON.parse(localStorage.getItem('userProfile') || 'null');
let totalCalories = 0;
let dailyCalorieGoal = 2000; // Valor por defecto
let currentProfile: UserProfile | null = null;
let mealGroups: MealGroup[] = []; // Añadimos esta variable para los grupos de comidas

// Añadir al inicio del archivo
let savedFoods: FoodItem[] = [];

// Por ejemplo, podemos agregar un comentario para evitar la advertencia:
// @ts-ignore - Función utilizada en otras partes del código
function getCalorieClass(calories: number): string {
    if (calories > 300) return 'high-calorie';
    if (calories > 150) return 'moderate-calorie';
    return 'low-calorie';
}

// Comentar esta declaración si no se usa
// const styles = `
// ... (resto del código)
// `;

async function showProfileSelector() {
    const profiles = await getFamilyProfiles();
    console.log('Perfiles para mostrar:', profiles); // Para debug
    
    const selectorModal = document.createElement('div');
    selectorModal.className = 'modal profile-selector';
    selectorModal.innerHTML = `
        <div class="modal-content">
            <h2>
                <span class="icon">👤</span>
                Selecciona tu perfil
            </h2>
            <div class="profile-buttons">
                ${profiles.length > 0 ? profiles.map(profile => `
                    <button class="profile-button" data-id="${profile.id}">
                        ${profile.name} - ${profile.weight}kg
                    </button>
                `).join('') : ''}
                <button class="profile-button new-profile">
                    ➕ Crear nuevo perfil
                </button>
    </div>
  </div>
    `;

    document.body.appendChild(selectorModal);

    // Manejar selección de perfil
    selectorModal.querySelectorAll('.profile-button').forEach(button => {
        button.addEventListener('click', async () => {
            try {
                if (button.classList.contains('new-profile')) {
                    selectorModal.remove();
                    await setupUserProfile();
                } else {
                    const profileId = button.getAttribute('data-id');
                    const selectedProfile = profiles.find(p => p.id === profileId);
                    if (selectedProfile) {
                        currentProfile = selectedProfile;
                        dailyCalorieGoal = calculateDailyCalories(selectedProfile);
                        selectorModal.remove();
                        showWarning(`Bienvenido/a, ${selectedProfile.name}! 👋`, 'info');
                        await initializeApp();
                    }
                }
            } catch (error) {
                console.error('Error al seleccionar perfil:', error);
                showWarning('Error al cargar el perfil', 'error');
            }
        });
    });
}

async function setupUserProfile() {
    const profileForm = document.createElement('div');
    profileForm.className = 'modal';
    profileForm.innerHTML = `
        <div class="modal-content">
            <h2>
                <span class="icon">📊</span>
                Configura tu perfil
            </h2>
            <form id="profileForm">
                <div class="form-group">
                    <label>
                        <span class="icon">👤</span>
                        Nombre
                    </label>
                    <input 
                        type="text" 
                        name="name"
                        required 
                        placeholder="Tu nombre"
                    >
                </div>
                <div class="form-group">
                    <label>
                        <span class="icon">⚖️</span>
                        Peso (kg)
                    </label>
                    <input 
                        type="number" 
                        name="weight"
                        required 
                        min="30" 
                        max="200" 
                        step="0.1" 
                        placeholder="Ej: 70.5"
                    >
                </div>
                <div class="form-group">
                    <label>
                        <span class="icon">📏</span>
                        Altura (cm)
                    </label>
                    <input 
                        type="number" 
                        name="height"
                        required 
                        min="120" 
                        max="220" 
                        placeholder="Ej: 170"
                    >
                </div>
                <div class="form-group">
                    <label>
                        <span class="icon">🎂</span>
                        Edad
                    </label>
                    <input 
                        type="number" 
                        name="age"
                        required 
                        min="18" 
                        max="100" 
                        placeholder="Ej: 30"
                    >
                </div>
                <div class="form-group">
                    <label>
                        <span class="icon">👤</span>
                        Género
                    </label>
                    <select name="gender" required>
                        <option value="">Selecciona una opción</option>
                        <option value="male">Hombre</option>
                        <option value="female">Mujer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <span class="icon">🏃‍♂️</span>
                        Nivel de Actividad
                    </label>
                    <select name="activityLevel" required>
                        <option value="">Selecciona una opción</option>
                        <option value="1.2">Sedentario (poco o ningún ejercicio)</option>
                        <option value="1.375">Ligeramente activo (1-3 días/semana)</option>
                        <option value="1.55">Moderadamente activo (3-5 días/semana)</option>
                        <option value="1.725">Muy activo (6-7 días/semana)</option>
                    </select>
                </div>
                <button type="submit" class="submit-button">Guardar Perfil</button>
            </form>
        </div>
    `;

    document.body.appendChild(profileForm);

    const form = profileForm.querySelector('#profileForm');
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        
        const newProfile = {
            name: formData.get('name') as string,
            weight: Number(formData.get('weight')),
            height: Number(formData.get('height')),
            age: Number(formData.get('age')),
            gender: formData.get('gender') as 'male' | 'female',
            activityLevel: Number(formData.get('activityLevel'))
        };

        try {
            const savedProfile = await saveUserProfile(newProfile);
            currentProfile = savedProfile;
            dailyCalorieGoal = calculateDailyCalories(savedProfile);
            profileForm.remove();
            showWarning('✅ Perfil guardado correctamente', 'info');
            await initializeApp();
        } catch (error) {
            console.error('Error al guardar el perfil:', error);
            showWarning('Error al guardar el perfil', 'error');
        }
    });
}

// Función para cargar los alimentos
async function loadFoods() {
    try {
        savedFoods = await getFoodsFromFirebase();
        console.log(`Cargados ${savedFoods.length} alimentos`);
    } catch (error) {
        console.error('Error al cargar alimentos:', error);
    }
}

// Función de búsqueda
function searchFoods(query: string): FoodItem[] {
    if (!query) return [];
    query = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return savedFoods.filter(food => 
        food.food_name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .includes(query)
    );
}

// Mostrar resultados de búsqueda
function showSearchResults(results: FoodItem[]) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    searchResults.style.display = 'block';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p>No se encontraron resultados</p>';
        return;
    }
    
    searchResults.innerHTML = results.map(food => `
        <div class="food-item">
            <div class="food-info">
                <div class="food-name">${food.food_name}</div>
                <div class="food-details">${food.serving_qty} ${food.serving_unit} | ${food.calories} cal</div>
            </div>
            <div class="food-item-actions">
                <button class="edit-btn" data-id="${food.id}">✏️</button>
                <button class="delete-btn" data-id="${food.id}">🗑️</button>
                <button class="add-btn" data-id="${food.id}">Añadir</button>
            </div>
        </div>
    `).join('');
    
    // Añadir listeners
    searchResults.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const foodId = (e.target as HTMLButtonElement).dataset.id;
            const food = results.find(f => f.id === foodId);
            if (food) showEditFoodModal(food);
        });
    });
    
    searchResults.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const foodId = (e.target as HTMLButtonElement).dataset.id;
            if (foodId && confirm('¿Estás seguro de que quieres eliminar este alimento?')) {
                try {
                    await deleteFoodFromFirebase(foodId);
                    (e.target as HTMLButtonElement).closest('.food-item')?.remove();
                    showWarning('Alimento eliminado correctamente', 'info');
                } catch (error) {
                    showWarning('Error al eliminar el alimento', 'error');
                }
            }
        });
    });
    
    searchResults.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const foodId = (e.target as HTMLButtonElement).dataset.id;
            const food = results.find(f => f.id === foodId);
            if (food) addFoodToDailyLog(food);
        });
    });
}

function addFoodToDailyLog(food: FoodItem) {
    const dailyFoodsList = document.querySelector('#dailyFoodsList');
    if (!dailyFoodsList) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${food.food_name}</h3>
            <div class="quantity-form">
                <label for="quantity">Cantidad (${food.serving_unit})</label>
                <input 
                    type="number" 
                    id="quantity" 
                    value="${food.serving_qty}"
                    min="0" 
                    step="1"
                >
                <div class="calories-preview">
                    Calorías: <span id="caloriesPreview">${food.calories}</span>
                </div>
            </div>
            <div class="form-actions">
                <button class="submit-button">Añadir</button>
                <button class="cancel-button">Cancelar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const quantityInput = modal.querySelector('#quantity') as HTMLInputElement;
    const caloriesPreview = modal.querySelector('#caloriesPreview');
    
    const calculateCalories = (quantity: number) => {
        const newCalories = Math.round((quantity * food.calories) / food.serving_qty);
        if (caloriesPreview) caloriesPreview.textContent = newCalories.toString();
        return newCalories;
    };

    quantityInput.addEventListener('input', () => {
        const quantity = Number(quantityInput.value);
        calculateCalories(quantity);
    });

    const submitButton = modal.querySelector('.submit-button');
    submitButton?.addEventListener('click', async () => {
        const quantity = Number(quantityInput.value) || 0;
        const adjustedCalories = calculateCalories(quantity);

        const foodElement = document.createElement('div');
        foodElement.className = 'food-item';
        foodElement.innerHTML = `
            <div class="food-info">
                <span class="food-name">${food.food_name}</span>
                <span class="food-details">${quantity} ${food.serving_unit} | ${adjustedCalories} cal</span>
            </div>
            <button class="delete-food-btn" title="Eliminar">🗑️</button>
        `;

        const deleteButton = foodElement.querySelector('.delete-food-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', async () => {
                const caloriesText = foodElement.querySelector('.food-details')?.textContent || '';
                const caloriesMatch = caloriesText.match(/\|\s+(\d+)\s+cal/);
                if (caloriesMatch) {
                    const calories = parseInt(caloriesMatch[1]);
                    await updateTotalCalories(-calories);
                }
                foodElement.remove();
            });
        }

        dailyFoodsList.appendChild(foodElement);
    });
}

// Modificar la función initializeApp para incluir la inicialización del contador
async function initializeApp() {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (!app) return;

    // Limpiamos todo el contenido anterior
    app.innerHTML = '';

    // Creamos la estructura desde cero
    const container = document.createElement('div');
    container.className = 'container';
    app.appendChild(container);

    // 1. Histórico y fecha
    const topBar = document.createElement('div');
    topBar.className = 'top-bar';
    container.appendChild(topBar);

    const historyButton = document.createElement('button');
    historyButton.className = 'history-button';
    historyButton.innerHTML = '📊 Ver Histórico';
    historyButton.addEventListener('click', showHistoryModal);
    topBar.appendChild(historyButton);

    const dateSpan = document.createElement('span');
    dateSpan.className = 'current-date';
    dateSpan.textContent = new Date().toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    topBar.appendChild(dateSpan);

    // 2. Barra de usuario
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    container.appendChild(userInfo);

    userInfo.innerHTML = `
        <div class="user-info-content">
            <div class="user-profile">
                <span class="user-icon">👤</span>
                <span class="user-name">${currentProfile?.name || 'Usuario'}</span>
            </div>
            <div class="calorie-goal">
                🎯 ${dailyCalorieGoal} cal
            </div>
            <div class="user-actions">
                <button class="edit-profile-btn" title="Editar perfil">✏️</button>
                <button class="delete-profile-btn" title="Eliminar perfil">🗑️</button>
            </div>
        </div>
    `;

    // Añadir el botón de grupos de comidas
    const groupsButton = document.createElement('button');
    groupsButton.className = 'meal-groups-button';
    groupsButton.innerHTML = '🍳 Grupos de Comidas';
    groupsButton.addEventListener('click', showMealGroupsModal);
    userInfo.appendChild(groupsButton);

    // 3. Contenido principal
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    container.appendChild(mainContent);

    // 3.1 Añadir alimento
    const addFoodSection = document.createElement('div');
    addFoodSection.className = 'add-food-section';
    mainContent.appendChild(addFoodSection);

    addFoodSection.innerHTML = `
        <h3>Añadir Nuevo Alimento a la Base de Datos</h3>
        <form id="addFoodForm" class="add-food-form">
            <input 
                type="text" 
                name="foodName" 
                placeholder="Nombre del alimento" 
                required
            >
            <div class="calories-wrapper">
                <input 
                    type="number" 
                    name="calories" 
                    placeholder="Calorías" 
                    required 
                    min="0"
                >
                <span class="per-100g">por 100g</span>
            </div>
            <button type="submit" class="save-button">
                📝 Guardar
            </button>
        </form>
    `;

    // 3.2 Buscar alimento
    const searchSection = document.createElement('div');
    searchSection.className = 'search-section';
    mainContent.appendChild(searchSection);

    searchSection.innerHTML = `
        <h3>Buscar y Añadir al Registro Diario</h3>
        <input 
            type="text" 
            id="searchInput" 
            placeholder="Buscar alimento..." 
            class="search-input"
        />
        <div id="searchResults" class="search-results"></div>
    `;

    // 3.3 Alimentos consumidos
    const dailyFoods = document.createElement('div');
    dailyFoods.className = 'daily-foods';
    mainContent.appendChild(dailyFoods);

    dailyFoods.innerHTML = `
        <h3>Alimentos Consumidos Hoy</h3>
        <div id="dailyFoodsList" class="daily-foods-list"></div>
        <div class="progress-container">
            <div class="progress-bar">
                <div id="calorieProgress" class="progress"></div>
            </div>
            <div class="daily-total">
                <span id="totalCalories">0</span> / <span id="calorieGoal">${dailyCalorieGoal}</span> calorías
            </div>
        </div>
    `;

    // Configurar event listeners
    document.querySelector('#addFoodForm')?.addEventListener('submit', handleAddFood);
    
    // Añadir listeners para los botones de perfil
    document.querySelector('.edit-profile-btn')?.addEventListener('click', () => {
        if (currentProfile) showEditProfileModal(currentProfile);
    });
    
    document.querySelector('.delete-profile-btn')?.addEventListener('click', () => {
        if (currentProfile) handleDeleteProfile(currentProfile);
    });
    
    // Inicializar búsqueda
    document.querySelector('#searchInput')?.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.trim();
        if (query.length < 2) {
            const searchResults = document.querySelector('#searchResults');
            if (searchResults && 'style' in searchResults) {
                (searchResults as HTMLElement).style.display = 'none';
            }
            return;
        }
        const results = searchFoods(query);
        showSearchResults(results);
    });

    // Cargar comidas
    await loadFoods();
    
    // Inicializar contador diario
    await initializeDailyCounter();
    
    // Inicializar barra de progreso
    initializeProgressBar();
}

// Asegurarnos de que el perfil se carga correctamente
async function loadUserProfile() {
    const profiles = await getFamilyProfiles();
    if (profiles.length === 0) {
        setupUserProfile();
    } else {
        showProfileSelector();
    }
}

// Modificar el event listener inicial para manejar async/await
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile().catch(error => {
        console.error('Error al cargar el perfil:', error);
        showWarning('Error al cargar el perfil. Por favor, recarga la página.', 'error');
    });
});

// Función para mostrar el gestor de alimentos
async function showFoodManager() {
    const foods = await getAllFoods();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content food-manager">
            <h2>
                <span class="icon">🍽️</span>
                Gestionar Alimentos
            </h2>
            <div class="foods-list">
                ${foods.map(food => `
                    <div class="food-item-manager">
                        <div class="food-info">
                            <span class="food-name">${food.food_name}</span>
                            <span class="food-details">
                                ${food.serving_qty} ${food.serving_unit} | ${food.calories} cal
                                ${food.category ? `| ${food.category}` : ''}
                            </span>
                        </div>
                        <button class="delete-food-btn" data-id="${food.id}">🗑️</button>
                    </div>
                `).join('')}
            </div>
            <button class="close-button">Cerrar</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Manejar eliminación de alimentos
    modal.querySelectorAll('.delete-food-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const foodId = (e.target as HTMLButtonElement).dataset.id;
            if (foodId && confirm('¿Estás seguro de que quieres eliminar este alimento?')) {
                try {
                    await deleteFoodFromFirebase(foodId);
                    (e.target as HTMLButtonElement).closest('.food-item-manager')?.remove();
                    showWarning('Alimento eliminado correctamente', 'info');
                } catch (error) {
                    showWarning('Error al eliminar el alimento', 'error');
                }
            }
        });
    });

    // Manejar cierre del modal
    modal.querySelector('.close-button')?.addEventListener('click', () => {
        modal.remove();
    });
}

function addHistoryButton() {
    // Primero verificamos si ya existe el contenedor para evitar duplicados
    const existingContainer = document.querySelector('.history-date-container');
    if (existingContainer) {
        existingContainer.remove();
    }

    // Crear contenedor para el histórico y la fecha
    const historyContainer = document.createElement('div');
    historyContainer.className = 'history-date-container';

    // Configurar el contenido
    historyContainer.innerHTML = `
        <button class="history-button">
            📊 Ver Histórico
        </button>
        <span class="current-date">
            ${new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })}
        </span>
    `;

    // Añadir el event listener al botón
    const historyButton = historyContainer.querySelector('.history-button');
    if (historyButton) {
        historyButton.addEventListener('click', showHistoryModal);
    }

    // Insertar el contenedor en la posición correcta
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.parentNode?.insertBefore(historyContainer, mainContent);
    } else {
        // Si no encuentra .main-content, lo añadimos al principio del #app
        const app = document.querySelector('#app');
        if (app) {
            app.insertBefore(historyContainer, app.firstChild);
        }
    }
}

// Y actualizar la función que maneja el .user-info para que sea más simple
function updateUserInfo() {
    const container = document.querySelector('.user-info');
    if (!container || !currentProfile) return;

    container.innerHTML = `
        <div class="user-info-container">
            <div class="user-profile">
                <span class="user-icon">👤</span>
                <span class="user-name">${currentProfile.name}</span>
            </div>
            <div class="user-goal">
                <span class="goal-icon">🎯</span>
                <span class="calorie-goal">${dailyCalorieGoal} cal</span>
            </div>
            <div class="user-actions">
                <button class="edit-profile-btn" title="Editar perfil">✏️</button>
                <button class="delete-profile-btn" title="Eliminar perfil">🗑️</button>
            </div>
        </div>
    `;

    // Añadir event listeners
    container.querySelector('.edit-profile-btn')?.addEventListener('click', () => 
        showEditProfileModal(currentProfile!)
    );
    container.querySelector('.delete-profile-btn')?.addEventListener('click', () => 
        handleDeleteProfile(currentProfile!)
    );
}

async function showHistoryModal() {
    if (!currentProfile?.id) {
        showWarning('❌ Necesitas seleccionar un perfil primero', 'error');
        return;
    }

    const logs = await getDailyLogs(currentProfile.id, 7);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content history-modal">
            <h2>Histórico de Calorías</h2>
            <div class="history-list">
                ${logs.map(log => `
                    <div class="history-item">
                        <div class="history-date">${formatDate(log.date)}</div>
                        <div class="history-calories">
                            ${log.totalCalories} / ${dailyCalorieGoal} cal
                            <div class="history-progress">
                                <div class="progress" style="width: ${(log.totalCalories / dailyCalorieGoal) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="close-button">Cerrar</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Cerrar modal
    modal.querySelector('.close-button')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Asegurarnos que la barra de progreso se inicializa correctamente
function initializeProgressBar() {
    const progressBar = document.getElementById('calorieProgress');
    const totalCaloriesElement = document.getElementById('totalCalories');
    const calorieGoalElement = document.getElementById('calorieGoal');
    
    if (progressBar && totalCaloriesElement && calorieGoalElement) {
        // Actualizar los valores
        totalCaloriesElement.textContent = totalCalories.toString();
        calorieGoalElement.textContent = dailyCalorieGoal.toString();
        
        // Calcular el porcentaje y actualizar la barra
        const percentage = Math.min((totalCalories / dailyCalorieGoal) * 100, 100);
        progressBar.style.width = `${percentage}%`;
        
        // Cambiar color según el porcentaje
        if (percentage > 100) {
            progressBar.style.backgroundColor = '#f44336'; // Rojo si excedemos
        } else if (percentage > 80) {
            progressBar.style.backgroundColor = '#ff9800'; // Naranja si estamos cerca del límite
        } else {
            progressBar.style.backgroundColor = '#0091EA'; // Azul en estado normal
        }
    }
}

// Añadir el botón de grupos de comidas en la barra superior
function addMealGroupsButton() {
    const userInfo = document.querySelector('.user-info');
    if (!userInfo) return;

    const button = document.createElement('button');
    button.className = 'meal-groups-button';
    button.innerHTML = '🍳 Grupos de Comidas';
    button.addEventListener('click', showMealGroupsModal);
    
    userInfo.appendChild(button);
}

// Modal para mostrar los grupos de comidas
async function showMealGroupsModal() {
    if (!currentProfile?.id) {
        showWarning('❌ Necesitas seleccionar un perfil primero', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    
    try {
        const mealGroups = await getMealGroups(currentProfile.id);
        
        modal.innerHTML = `
            <div class="modal-content meal-groups-modal">
                <h2>Mis Grupos de Comidas</h2>
                <button class="create-group-button">+ Crear Nuevo Grupo</button>
                <div class="meal-groups-list">
                    ${mealGroups.map(group => `
                        <div class="meal-group-item" data-id="${group.id}">
                            <div class="group-info">
                                <div class="group-header">
                                    <h3>${group.name}</h3>
                                    <span class="group-type">${group.type}</span>
                                </div>
                                <div class="group-calories">${group.totalCalories} calorías</div>
                                ${group.description ? `<p class="group-description">${group.description}</p>` : ''}
                                <div class="group-foods">
                                    ${group.foods.map(food => `
                                        <div class="group-food-item">
                                            • ${food.food_name} (${food.serving_qty} ${food.serving_unit})
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="group-actions">
                                <button class="add-group-button" title="Añadir al registro diario">➕ Añadir</button>
                                <button class="edit-group-button" title="Editar grupo">✏️</button>
                                <button class="delete-group-button" title="Eliminar grupo">🗑️</button>
                            </div>
                        </div>
                    `).join('') || '<p class="no-groups">No hay grupos de comidas guardados</p>'}
                </div>
                <button class="close-button">Cerrar</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Botón para crear nuevo grupo
        modal.querySelector('.create-group-button')?.addEventListener('click', () => {
            modal.remove();
            showCreateMealGroupModal();
        });

        // Manejar acciones de los grupos
        modal.querySelectorAll('.meal-group-item').forEach((item, index) => {
            const group = mealGroups[index];
            
            // Añadir grupo al registro
            item.querySelector('.add-group-button')?.addEventListener('click', () => {
                addMealGroupToDaily(group);
                modal.remove();
            });

            // Editar grupo
            item.querySelector('.edit-group-button')?.addEventListener('click', () => {
                modal.remove();
                showCreateMealGroupModal(group);
            });

            // Eliminar grupo
            item.querySelector('.delete-group-button')?.addEventListener('click', async () => {
                if (confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
                    try {
                        await deleteMealGroup(group.id!);
                        item.remove();
                        showWarning('✅ Grupo eliminado correctamente', 'info');
                    } catch (error) {
                        console.error('Error al eliminar grupo:', error);
                        showWarning('❌ Error al eliminar el grupo', 'error');
                    }
                }
            });
        });

        // Cerrar modal
        modal.querySelector('.close-button')?.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

    } catch (error) {
        console.error('Error al cargar grupos de comidas:', error);
        showWarning('❌ Error al cargar los grupos de comidas', 'error');
    }
}

// Función para añadir un grupo de comidas al registro diario
async function addMealGroupToDaily(group: MealGroup) {
    const dailyFoodsList = document.querySelector('#dailyFoodsList');
    if (!dailyFoodsList || !currentProfile?.id) return;

    let totalGroupCalories = 0;
    const addedFoods: FoodItem[] = [];

    // Añadir cada alimento del grupo
    for (const food of group.foods) {
        const foodElement = document.createElement('div');
        foodElement.className = 'food-item';
        foodElement.innerHTML = `
            <div class="food-info">
                <span class="food-name">${food.food_name}</span>
                <span class="food-details">${food.serving_qty} ${food.serving_unit} | ${food.calories} cal</span>
            </div>
            <button class="delete-food-btn" title="Eliminar">🗑️</button>
        `;

        const deleteButton = foodElement.querySelector('.delete-food-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', async () => {
                foodElement.remove();
                await updateTotalCalories(-food.calories);
                
                // Actualizar el registro diario al eliminar
                const currentFoods = getCurrentFoods();
                if (currentProfile?.id) {
                    await saveDailyLog(currentProfile.id, currentFoods, totalCalories);
                }
            });
        }

        dailyFoodsList.appendChild(foodElement);
        totalGroupCalories += food.calories;
        
        // Añadir a la lista de alimentos para el registro
        addedFoods.push({
            ...food,
            timestamp: new Date()
        });
    }

    // Actualizar calorías totales
    await updateTotalCalories(totalGroupCalories);

    // Obtener todos los alimentos actuales y guardar en el registro diario
    const currentFoods = getCurrentFoods();
    await saveDailyLog(currentProfile.id, currentFoods, totalCalories);

    showWarning(`✅ Grupo "${group.name}" añadido al registro`, 'info');
}

// Modal para crear/editar grupo de comidas
async function showCreateMealGroupModal(existingGroup?: MealGroup) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content meal-group-modal">
            <h2>${existingGroup ? 'Editar' : 'Crear'} Grupo de Comidas</h2>
            <form id="mealGroupForm">
                <div class="form-group">
                    <label for="groupName">Nombre del Grupo</label>
                    <input type="text" id="groupName" name="name" required value="${existingGroup?.name || ''}">
                </div>
                <div class="form-group">
                    <label for="groupType">Tipo</label>
                    <select id="groupType" name="type" required>
                        <option value="desayuno" ${existingGroup?.type === 'desayuno' ? 'selected' : ''}>Desayuno</option>
                        <option value="almuerzo" ${existingGroup?.type === 'almuerzo' ? 'selected' : ''}>Almuerzo</option>
                        <option value="comida" ${existingGroup?.type === 'comida' ? 'selected' : ''}>Comida</option>
                        <option value="merienda" ${existingGroup?.type === 'merienda' ? 'selected' : ''}>Merienda</option>
                        <option value="cena" ${existingGroup?.type === 'cena' ? 'selected' : ''}>Cena</option>
                        <option value="otro" ${existingGroup?.type === 'otro' ? 'selected' : ''}>Otro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="groupDescription">Descripción (opcional)</label>
                    <textarea id="groupDescription" name="description">${existingGroup?.description || ''}</textarea>
                </div>
                <div class="group-foods-section">
                    <h3>Alimentos</h3>
                    <div id="groupFoodsList" class="group-foods-list">
                        ${existingGroup?.foods?.map((food, index) => `
                            <div class="group-food-item">
                                <div class="food-details">
                                    <span class="food-name">${food.food_name}</span>
                                    <span class="food-info">${food.serving_qty} ${food.serving_unit} | ${food.calories} cal</span>
                                </div>
                                <button type="button" class="remove-food-btn" data-index="${index}">🗑️</button>
                            </div>
                        `).join('') || ''}
                    </div>
                    <button type="button" id="addFoodToGroup" class="add-food-button">+ Añadir Alimento</button>
                </div>
                <div class="form-actions">
                    <button type="button" id="cancelGroupCreate" class="cancel-button">Cancelar</button>
                    <button type="submit" class="submit-button">Guardar Grupo</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const groupFoods: FoodItem[] = existingGroup?.foods || [];
    const groupFoodsContainer = modal.querySelector('#groupFoodsList') as HTMLDivElement;
    const form = modal.querySelector('#mealGroupForm') as HTMLFormElement;
    const addFoodButton = modal.querySelector('#addFoodToGroup') as HTMLButtonElement;
    const cancelButton = modal.querySelector('#cancelGroupCreate') as HTMLButtonElement;

    function updateGroupFoodsList() {
        groupFoodsContainer.innerHTML = groupFoods
            .map((food, index) => `
                <div class="group-food-item">
                    <div class="food-details">
                        <span class="food-name">${food.food_name}</span>
                        <span class="food-info">${food.serving_qty} ${food.serving_unit} | ${food.calories} cal</span>
                    </div>
                    <button type="button" class="remove-food-btn" data-index="${index}">🗑️</button>
                </div>
            `)
            .join('') || '<div class="empty-message">No hay alimentos añadidos</div>';

        // Actualizar eventos de eliminar alimentos
        groupFoodsContainer.querySelectorAll('.remove-food-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt((e.target as HTMLButtonElement).dataset.index || '0');
                groupFoods.splice(index, 1);
                updateGroupFoodsList();
            });
        });
    }

    // Inicializar la lista de alimentos si hay existentes
    updateGroupFoodsList();

    // Evento para añadir alimentos
    const addFoodHandler = () => {
        showFoodSearchModal((selectedFood) => {
            groupFoods.push(selectedFood);
            updateGroupFoodsList();
        });
    };
    addFoodButton.addEventListener('click', addFoodHandler);

    // Evento para cancelar
    const cancelHandler = () => modal.remove();
    cancelButton.addEventListener('click', cancelHandler);

    // Evento para cerrar al hacer clic fuera
    const outsideClickHandler = (e: MouseEvent) => {
        if (e.target === modal) modal.remove();
    };
    modal.addEventListener('click', outsideClickHandler);

    // Manejar el envío del formulario
    const submitHandler = async (e: Event) => {
        e.preventDefault();
        const formData = new FormData(form);
        
        const newGroup: MealGroup = {
            id: existingGroup?.id,
            name: formData.get('name') as string,
            type: formData.get('type') as 'desayuno' | 'almuerzo' | 'comida' | 'merienda' | 'cena' | 'otro' || 'otro',
            description: formData.get('description') as string,
            foods: groupFoods,
            totalCalories: groupFoods.reduce((total, food) => total + food.calories, 0),
            userId: currentProfile?.id || '',
        };

        try {
            await saveMealGroup(newGroup);
            modal.remove();
            showWarning('✅ Grupo guardado correctamente', 'info');
            // Recargar los grupos
            await loadMealGroups();
        } catch (error) {
            console.error('Error al guardar el grupo:', error);
            showWarning('❌ Error al guardar el grupo', 'error');
        }
    };
    form.addEventListener('submit', submitHandler);

    // Función de limpieza
    const cleanupFn = () => {
        addFoodButton.removeEventListener('click', addFoodHandler);
        cancelButton.removeEventListener('click', cancelHandler);
        modal.removeEventListener('click', outsideClickHandler);
        form.removeEventListener('submit', submitHandler);
    };

    // Usar una Map o WeakMap para almacenar la función de limpieza
    const modalCleanups = new WeakMap<HTMLElement, Function>();
    modalCleanups.set(modal, cleanupFn);

    // Y cambiar donde se usa:
    // modal.cleanup()
    const modalCleanup = modalCleanups.get(modal);
    if (modalCleanup) modalCleanup();
}

function showFoodSearchModal(onFoodSelect: (food: FoodItem) => void) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'food-search-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Buscar Alimento</h3>
            <div class="search-container">
                <input 
                    type="text" 
                    class="search-input" 
                    placeholder="Escribe para buscar alimentos..."
                    autocomplete="off"
                >
                <div id="foodSearchResults" class="search-results" style="display: block;"></div>
            </div>
        </div>
    `;

    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);

    const searchInput = modal.querySelector('.search-input') as HTMLInputElement;
    const searchResults = modal.querySelector('#foodSearchResults') as HTMLDivElement;

    // Cargar y mostrar todos los alimentos inmediatamente
    async function showAllFoods() {
        try {
            const foods = await getFoodsFromFirebase();
            if (foods.length === 0) {
                searchResults.innerHTML = '<div class="search-message">No hay alimentos en la base de datos</div>';
                return;
            }

            searchResults.innerHTML = foods
                .map(food => `
                    <div class="search-result-item">
                        <div class="food-info">
                            <span class="food-name">${food.food_name}</span>
                            <span class="food-details">${food.calories} cal/${food.serving_qty}${food.serving_unit}</span>
                        </div>
                        <button class="select-food-btn">Seleccionar</button>
                    </div>
                `)
                .join('');

            // Añadir eventos de selección
            searchResults.querySelectorAll('.search-result-item').forEach((item, index) => {
                item.querySelector('.select-food-btn')?.addEventListener('click', () => {
                    onFoodSelect(foods[index]);
                    modalOverlay.remove();
                });
            });
        } catch (error) {
            console.error('Error al cargar alimentos:', error);
            searchResults.innerHTML = '<div class="search-message error">Error al cargar los alimentos</div>';
        }
    }

    // Mostrar todos los alimentos al inicio
    showAllFoods();

    // Función de búsqueda
    searchInput.addEventListener('input', async () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const foods = await getFoodsFromFirebase();
        const filteredFoods = foods.filter(food => 
            food.food_name.toLowerCase().includes(searchTerm)
        );

        if (filteredFoods.length === 0) {
            searchResults.innerHTML = '<div class="search-message">No se encontraron alimentos</div>';
            return;
        }

        searchResults.innerHTML = filteredFoods
            .map(food => `
                <div class="search-result-item">
                    <div class="food-info">
                        <span class="food-name">${food.food_name}</span>
                        <span class="food-details">${food.calories} cal/${food.serving_qty}${food.serving_unit}</span>
                    </div>
                    <button class="select-food-btn">Seleccionar</button>
                </div>
            `)
            .join('');

        // Añadir eventos de selección para los resultados filtrados
        searchResults.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.querySelector('.select-food-btn')?.addEventListener('click', () => {
                onFoodSelect(filteredFoods[index]);
                modalOverlay.remove();
            });
        });
    });

    // Cerrar modal al hacer clic fuera
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });

    // Enfocar el input
    searchInput.focus();
}

async function createNewMealGroup(groupData: Partial<MealGroup>) {
    if (!currentProfile?.id) {
        showWarning('❌ Debes iniciar sesión para crear grupos de comidas', 'error');
        return;
    }

    const newGroup: MealGroup = {
        name: groupData.name || '',
        type: groupData.type || 'otro',
        description: groupData.description || '',
        foods: groupData.foods || [],
        totalCalories: groupData.foods?.reduce((total, food) => total + food.calories, 0) || 0,
        userId: currentProfile.id,
    };

    try {
        await saveMealGroup(newGroup);
        showWarning('✅ Grupo de comidas guardado correctamente', 'success');
        await loadMealGroups(); // Recargar los grupos después de guardar
    } catch (error) {
        console.error('Error al guardar el grupo:', error);
        showWarning('❌ Error al guardar el grupo de comidas', 'error');
    }
}

// Función para manejar la adición de un nuevo alimento a Firebase
async function handleAddFood(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const foodName = formData.get('foodName') as string;
    const calories = parseInt(formData.get('calories') as string);
    
    if (!foodName || isNaN(calories)) {
        showWarning('Por favor, completa todos los campos correctamente', 'warning');
        return;
    }
    
    const newFood: FoodItem = {
        food_name: foodName,
        serving_qty: 100,
        serving_unit: 'g',
        calories: calories,
        category: 'General'
    };
    
    try {
        await saveFoodToFirebase(newFood);
        form.reset();
        showWarning('✅ Alimento guardado correctamente', 'info');
        await loadFoods(); // Recargar la lista de alimentos
    } catch (error) {
        console.error('Error al guardar el alimento:', error);
        showWarning('❌ Error al guardar el alimento', 'error');
    }
}

// Función para cargar los grupos de comidas
async function loadMealGroups() {
    if (!currentProfile?.id) return;
    
    try {
        // Obtener los grupos de comidas del usuario actual
        mealGroups = await getMealGroups(currentProfile.id);
        console.log('Grupos de comidas cargados:', mealGroups.length);
    } catch (error) {
        console.error('Error al cargar los grupos de comidas:', error);
        showWarning('Error al cargar los grupos de comidas', 'error');
    }
}

// Añadir la función handleDeleteProfile si no existe
// Esta función solo se añadirá si no existe ya en el código
async function handleDeleteProfile(profile: UserProfile) {
    if (!profile.id) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar el perfil de ${profile.name}?`)) {
        try {
            await deleteUserProfile(profile.id);
            localStorage.removeItem('userProfile');
            currentProfile = null;
            showWarning('Perfil eliminado correctamente', 'info');
            loadUserProfile(); // Volver a la selección de perfil
        } catch (error) {
            console.error('Error al eliminar perfil:', error);
            showWarning('Error al eliminar el perfil', 'error');
        }
    }
}

// Función para obtener todos los alimentos
async function getAllFoods(): Promise<FoodItem[]> {
    try {
        return await getFoodsFromFirebase();
    } catch (error) {
        console.error('Error al obtener todos los alimentos:', error);
        showWarning('Error al cargar los alimentos', 'error');
        return [];
    }
}

function calculateDailyCalories(profile: UserProfile): number {
    // Fórmula Harris-Benedict
    const bmr = profile.gender === 'male'
        ? (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5
        : (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) - 161;
    
    // Ajustar por nivel de actividad y crear déficit del 20%
    return Math.round(bmr * profile.activityLevel * 0.8);
}

// Añadir esta función que está faltando
async function showEditFoodModal(food: FoodItem) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>
                <span class="edit-icon">✏️</span>
                Editar Alimento
            </h2>
            <form id="editFoodForm">
                <div class="form-group">
                    <label>Nombre</label>
                    <input 
                        type="text" 
                        name="food_name" 
                        value="${food.food_name}"
                        required
                    >
                </div>
                <div class="form-group">
                    <label>Cantidad</label>
                    <input 
                        type="number" 
                        name="serving_qty" 
                        value="${food.serving_qty}"
                        required
                        min="0"
                    >
                </div>
                <div class="form-group">
                    <label>Unidad</label>
                    <input 
                        type="text" 
                        name="serving_unit" 
                        value="${food.serving_unit}"
                        required
                    >
                </div>
                <div class="form-group">
                    <label>Calorías</label>
                    <input 
                        type="number" 
                        name="calories" 
                        value="${food.calories}"
                        required
                        min="0"
                    >
                </div>
                <div class="form-group">
                    <label>Categoría</label>
                    <select name="category">
                        <option value="Frutas" ${food.category === 'Frutas' ? 'selected' : ''}>Frutas</option>
                        <option value="Verduras" ${food.category === 'Verduras' ? 'selected' : ''}>Verduras</option>
                        <option value="Carnes" ${food.category === 'Carnes' ? 'selected' : ''}>Carnes</option>
                        <option value="Pescados" ${food.category === 'Pescados' ? 'selected' : ''}>Pescados</option>
                        <option value="Lácteos" ${food.category === 'Lácteos' ? 'selected' : ''}>Lácteos</option>
                        <option value="Bebidas" ${food.category === 'Bebidas' ? 'selected' : ''}>Bebidas</option>
                        <option value="Snacks" ${food.category === 'Snacks' ? 'selected' : ''}>Snacks</option>
                        <option value="Embutidos" ${food.category === 'Embutidos' ? 'selected' : ''}>Embutidos</option>
                        <option value="Pan" ${food.category === 'Pan' ? 'selected' : ''}>Pan</option>
                        <option value="Proteínas" ${food.category === 'Proteínas' ? 'selected' : ''}>Proteínas</option>
                        <option value="General" ${food.category === 'General' ? 'selected' : ''}>General</option>
                    </select>
                </div>
                <div class="form-buttons">
                    <button type="submit" class="save-changes-btn">Guardar Cambios</button>
                    <button type="button" class="delete-food-btn">Eliminar Alimento</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    
    const form = modal.querySelector('#editFoodForm') as HTMLFormElement;
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        
        const updatedFood: FoodItem = {
            ...food,
            food_name: formData.get('food_name') as string,
            serving_qty: Number(formData.get('serving_qty')),
            serving_unit: formData.get('serving_unit') as string,
            calories: Number(formData.get('calories')),
            category: formData.get('category') as string
        };

        try {
            // Implementar la actualización
            await updateFoodInFirebase(updatedFood);
            modal.remove();
            showWarning('✅ Alimento actualizado correctamente', 'info');
            
            // Actualizar la lista de resultados
            const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
            if (searchInput) {
                const query = searchInput.value.trim();
                if (query.length >= 2) {
                    const results = await searchFoods(query);
                    showSearchResults(results);
                }
            }
        } catch (error) {
            console.error('Error al actualizar:', error);
            showWarning('❌ Error al actualizar el alimento', 'error');
        }
    });

    // Manejar eliminación
    const deleteButton = modal.querySelector('.delete-food-btn');
    deleteButton?.addEventListener('click', async () => {
        if (food.id && confirm('¿Estás seguro de que quieres eliminar este alimento?')) {
            try {
                await deleteFoodFromFirebase(food.id);
                modal.remove();
                showWarning('✅ Alimento eliminado correctamente', 'info');
                
                // Actualizar la lista de resultados
                const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
                if (searchInput) {
                    const query = searchInput.value.trim();
                    if (query.length >= 2) {
                        const results = await searchFoods(query);
                        showSearchResults(results);
                    }
                }
            } catch (error) {
                console.error('Error al eliminar:', error);
                showWarning('❌ Error al eliminar el alimento', 'error');
            }
        }
    });

    // Manejar cierre del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Añadir esta función
async function updateTotalCalories(change: number) {
    totalCalories += change;
    
    // Actualizar el elemento en la interfaz
    const totalCaloriesElement = document.getElementById('totalCalories');
    if (totalCaloriesElement) {
        totalCaloriesElement.textContent = totalCalories.toString();
    }
    
    // Actualizar la barra de progreso
    initializeProgressBar();
    
    // Guardar el registro diario actualizado
    if (currentProfile?.id) {
        try {
            const foods = getCurrentFoods();
            await saveDailyLog(currentProfile.id, foods, totalCalories);
        } catch (error) {
            console.error('Error al actualizar el registro diario:', error);
        }
    }
}

// Añadir esta función
function showEditProfileModal(profile: UserProfile) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>
                <span class="icon">✏️</span>
                Editar Perfil
            </h2>
            <form id="editProfileForm">
                <div class="form-group">
                    <label>
                        <span class="icon">👤</span>
                        Nombre
                    </label>
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Tu nombre" 
                        value="${profile.name}"
                        required
                    >
                </div>
                <div class="form-group">
                    <label>
                        <span class="icon">⚖️</span>
                        Peso (kg)
                    </label>
                    <input 
                        type="number" 
                        name="weight" 
                        placeholder="Tu peso en kg" 
                        value="${profile.weight}"
                        required
                        min="20"
                        max="300"
                    >
                </div>
                <div class="form-group">
                    <label>
                        <span class="icon">📏</span>
                        Altura (cm)
                    </label>
                    <input 
                        type="number" 
                        name="height" 
                        placeholder="Tu altura en cm" 
                        value="${profile.height}"
                        required
                        min="100"
                        max="250"
                    >
                </div>
                <div class="form-group">
                    <label>
                        <span class="icon">🎂</span>
                        Edad
                    </label>
                    <input 
                        type="number" 
                        name="age" 
                        placeholder="Tu edad" 
                        value="${profile.age}"
                        required
                        min="12"
                        max="120"
                    >
                </div>
                <div class="form-group">
                    <label>
                        <span class="icon">👫</span>
                        Género
                    </label>
                    <select name="gender" required>
                        <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>Hombre</option>
                        <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>Mujer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <span class="icon">🏃</span>
                        Nivel de Actividad
                    </label>
                    <select name="activityLevel" required>
                        <option value="1.2" ${profile.activityLevel === 1.2 ? 'selected' : ''}>Sedentario</option>
                        <option value="1.375" ${profile.activityLevel === 1.375 ? 'selected' : ''}>Ligero</option>
                        <option value="1.55" ${profile.activityLevel === 1.55 ? 'selected' : ''}>Moderado</option>
                        <option value="1.725" ${profile.activityLevel === 1.725 ? 'selected' : ''}>Activo</option>
                        <option value="1.9" ${profile.activityLevel === 1.9 ? 'selected' : ''}>Muy Activo</option>
                    </select>
                </div>
                <button type="submit" class="submit-button">Guardar Cambios</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    
    const form = modal.querySelector('#editProfileForm') as HTMLFormElement;
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        
        const updatedProfile: UserProfile = {
            ...profile,
            name: formData.get('name') as string,
            weight: Number(formData.get('weight')),
            height: Number(formData.get('height')),
            age: Number(formData.get('age')),
            gender: formData.get('gender') as 'male' | 'female',
            activityLevel: Number(formData.get('activityLevel'))
        };

        try {
            if (profile.id) {
                await updateUserProfile(profile.id, updatedProfile);
                currentProfile = updatedProfile;
                localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
                
                // Actualizar el objetivo calórico
                dailyCalorieGoal = calculateDailyCalories(updatedProfile);
                
                // Actualizar la interfaz
                updateUserInfo();
                initializeProgressBar();
                
                modal.remove();
                showWarning('✅ Perfil actualizado correctamente', 'info');
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            showWarning('❌ Error al actualizar el perfil', 'error');
        }
    });

    // Manejar cierre del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Añadir esta función
async function initializeDailyCounter() {
    if (!currentProfile?.id) return;
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const dailyLogs = await getDailyLogs(currentProfile.id);
        
        const todayLog = dailyLogs.find(log => log.date === today);
        
        if (todayLog) {
            // Cargar los alimentos y calorías del día
            totalCalories = todayLog.totalCalories;
            
            // Mostrar los alimentos en la lista
            const dailyFoodsList = document.querySelector('#dailyFoodsList');
            if (dailyFoodsList && todayLog.foods) {
                dailyFoodsList.innerHTML = todayLog.foods.map(food => `
                    <div class="food-item">
                        <div class="food-info">
                            <span class="food-name">${food.food_name}</span>
                            <span class="food-details">${food.serving_qty} ${food.serving_unit} | ${food.calories} cal</span>
                        </div>
                        <button class="delete-food-btn" data-id="${food.id || ''}">🗑️</button>
                    </div>
                `).join('');
                
                // Agregar listeners para los botones de eliminar
                dailyFoodsList.querySelectorAll('.delete-food-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const foodId = (e.target as HTMLButtonElement).dataset.id;
                        const foodItem = (e.target as HTMLButtonElement).closest('.food-item');
                        const foodCalories = parseInt(
                            foodItem?.querySelector('.food-details')?.textContent?.split('|')[1].trim() || '0'
                        );
                        
                        if (confirm('¿Estás seguro de que quieres eliminar este alimento?')) {
                            // Restar calorías
                            await updateTotalCalories(-foodCalories);
                            
                            // Eliminar de la interfaz
                            foodItem?.remove();
                        }
                    });
                });
            }
        }
        
        // Actualizar la interfaz
        const totalCaloriesElement = document.querySelector('#totalCalories');
        if (totalCaloriesElement) {
            totalCaloriesElement.textContent = totalCalories.toString();
        }
        
        // Inicializar barra de progreso
        initializeProgressBar();
    } catch (error) {
        console.error('Error al inicializar el contador diario:', error);
        showWarning('❌ Error al cargar el registro diario', 'error');
    }
}

// Añadir esta función
function getCurrentFoods(): FoodItem[] {
    const dailyFoodsList = document.querySelector('#dailyFoodsList');
    if (!dailyFoodsList) return [];
    
    const foods: FoodItem[] = [];
    
    dailyFoodsList.querySelectorAll('.food-item').forEach(item => {
        const nameElement = item.querySelector('.food-name');
        const detailsElement = item.querySelector('.food-details');
        
        if (nameElement && detailsElement) {
            const name = nameElement.textContent || '';
            const details = detailsElement.textContent || '';
            
            // Parsear los detalles para obtener cantidad, unidad y calorías
            const match = details.match(/(\d+)\s+(\w+)\s+\|\s+(\d+)/);
            
            if (match) {
                const [_, qty, unit, cal] = match;
                
                foods.push({
                    food_name: name,
                    serving_qty: parseInt(qty),
                    serving_unit: unit,
                    calories: parseInt(cal),
                    id: item.querySelector('.delete-food-btn')?.getAttribute('data-id') || undefined
                });
            }
        }
    });
    
    return foods;
}
