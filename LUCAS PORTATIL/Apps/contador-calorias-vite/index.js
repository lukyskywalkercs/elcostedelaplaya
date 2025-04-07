// Archivo bootstrap para cargar el código principal
document.addEventListener('DOMContentLoaded', function() {
    // Cargar el CSS primero
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './src/style.css';
    document.head.appendChild(link);

    // Cargar el script principal
    const script = document.createElement('script');
    script.src = './src/main.js';
    document.body.appendChild(script);
    
    console.log('Código inicializado correctamente');
});
