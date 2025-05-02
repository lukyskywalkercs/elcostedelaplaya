// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- TASAS DE INCREMENTO POR SEGUNDO (Base 2023 para proyección 2025) ---
    // Basado en los cálculos por minuto divididos entre 60
    const tasaAguaPorSegundo = 15515 / 60; // Litros/segundo
    const tasaHuevosPorSegundo = 78 / 60;    // Huevos/segundo
    const tasaLechePorSegundo = 7.8 / 60;   // Litros/segundo

    // --- TOTALES ANUALES ESTIMADOS 2025 (Base 2023) ---
    const totalAguaAnual2025 = 8154927900; // Litros
    const totalHuevosAnual2025 = 40774640;  // Huevos
    const totalLecheAnual2025 = 4077464;   // Litros

    // --- DATOS ADICIONALES (Para comparativas) ---
    const produccionMediaHuevosGallina = 300; // Huevos/año
    const produccionMediaLecheVaca = 8900;   // Litros/año
    const consumoAguaHotelEstimado = 300;    // Litros/noche/huésped
    const consumoMedioHogarAgua = 133;     // Litros/día/persona (INE 2022)

    // --- CÁLCULOS PARA DATOS ADICIONALES ---
    // Se dividen los totales anuales entre la producción anual por animal
    const gallinasNecesarias = totalHuevosAnual2025 / produccionMediaHuevosGallina;
    const vacasNecesarias = totalLecheAnual2025 / produccionMediaLecheVaca;

    // --- ELEMENTOS DEL DOM (CONTADORES) ---
    const contadorAguaElem = document.getElementById('contador-agua');
    const contadorHuevosElem = document.getElementById('contador-huevos');
    const contadorLecheElem = document.getElementById('contador-leche');

    // --- ELEMENTOS DEL DOM (DATOS ESTÁTICOS - TOTALES BAJO CONTADOR) ---
    const totalAgua2025Elem = document.getElementById('total-agua-2025');
    const totalHuevos2025Elem = document.getElementById('total-huevos-2025');
    const totalLeche2025Elem = document.getElementById('total-leche-2025');

    // --- ELEMENTOS DEL DOM (DATOS ADICIONALES) ---
    const gallinasNecesariasElem = document.getElementById('gallinas-necesarias');
    const vacasNecesariasElem = document.getElementById('vacas-necesarias');
    const consumoAguaHuespedElem = document.getElementById('consumo-agua-huesped');
    const consumoMedioHogarElem = document.getElementById('consumo-medio-hogar');

    // --- FUNCIÓN PARA FORMATEAR NÚMEROS GRANDES ---
    const formatoNumero = (num) => {
        return num.toLocaleString('es-ES'); // Usa separadores de miles para España
    };

    // --- INICIALIZAR VALORES ESTÁTICOS ---
    totalAgua2025Elem.textContent = formatoNumero(Math.round(totalAguaAnual2025));
    totalHuevos2025Elem.textContent = formatoNumero(Math.round(totalHuevosAnual2025));
    totalLeche2025Elem.textContent = formatoNumero(Math.round(totalLecheAnual2025));

    gallinasNecesariasElem.textContent = formatoNumero(Math.ceil(gallinasNecesarias)); // Redondear hacia arriba
    vacasNecesariasElem.textContent = formatoNumero(Math.ceil(vacasNecesarias));       // Redondear hacia arriba
    consumoAguaHuespedElem.textContent = formatoNumero(consumoAguaHotelEstimado);
    consumoMedioHogarElem.textContent = formatoNumero(consumoMedioHogarAgua);

    // --- LÓGICA DEL CONTADOR ---
    let aguaAcumulada = 0;
    let huevosAcumulados = 0;
    let lecheAcumulada = 0;

    // Función para actualizar los contadores
    const actualizarContadores = () => {
        aguaAcumulada += tasaAguaPorSegundo;
        huevosAcumulados += tasaHuevosPorSegundo;
        lecheAcumulada += tasaLechePorSegundo;

        // Actualizar el DOM (redondeando para evitar decimales excesivos)
        contadorAguaElem.textContent = formatoNumero(Math.floor(aguaAcumulada));
        contadorHuevosElem.textContent = formatoNumero(Math.floor(huevosAcumulados));
        contadorLecheElem.textContent = lecheAcumulada.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    };

    // Iniciar el intervalo para actualizar cada segundo (1000 ms)
    setInterval(actualizarContadores, 1000);

    // --- LÓGICA DEL CAMBIO DE MES VISUAL --- Eliminado
    /* 
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const mesActualElem = document.getElementById('mes-actual');
    let indiceMes = 0;

    const cambiarMes = () => {
        mesActualElem.textContent = meses[indiceMes];
        indiceMes++;
        if (indiceMes >= meses.length) {
            indiceMes = 0; // Volver a Enero
        }
    };

    // Iniciar el intervalo para cambiar el mes cada 4 segundos (4000 ms)
    setInterval(cambiarMes, 4000);

    // Llamar una vez al inicio para establecer el primer mes inmediatamente
    cambiarMes(); 
    */

    // --- LÓGICA PARA SECCIONES COLAPSABLES ---
    const toggleButtons = document.querySelectorAll('.toggle-btn');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const contenido = button.closest('.titulo-seccion').nextElementSibling;
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            button.setAttribute('aria-expanded', !isExpanded);
            button.textContent = isExpanded ? '+' : '−'; // Cambia entre + y − (o usa iconos)
            contenido.classList.toggle('expanded');
        });
    });

}); 