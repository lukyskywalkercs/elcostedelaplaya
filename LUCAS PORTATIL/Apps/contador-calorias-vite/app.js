// Archivo JavaScript básico
document.addEventListener('DOMContentLoaded', function() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = '<h1>Contador de Calorías</h1><p>Cargando aplicación...</p>';
    }
    
    // Intentar cargar el código principal si existe
    try {
        if (typeof loadUserProfile === 'function') {
            loadUserProfile();
        }
    } catch (e) {
        console.error('Error al cargar la aplicación:', e);
    }
});
