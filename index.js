document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM
    const entradaTarea = document.getElementById('entrada-tarea');
    const btnAgregar = document.getElementById('btn-agregar');
    const listaTareas = document.getElementById('lista-tareas');
    const contadorPendientes = document.getElementById('contador-pendientes');
    const fechaActual = document.getElementById('fecha-actual');

    // Estado de la aplicación
    let tareas = [];

    // Inicialización
    cargarTareas();
    mostrarFecha();

    // Event Listeners
    btnAgregar.addEventListener('click', agregarTarea);
    
    entradaTarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            agregarTarea();
        }
    });

    listaTareas.addEventListener('click', (e) => {
        const item = e.target.closest('.tarea-item');
        if (!item) return;

        const id = parseInt(item.dataset.id);

        if (e.target.closest('.btn-eliminar')) {
            eliminarTarea(id);
        } else if (e.target.closest('.checkbox-custom') || e.target.closest('.contenido-tarea')) {
            alternarTarea(id);
        }
    });

    // Funciones
    function mostrarFecha() {
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const fecha = new Date().toLocaleDateString('es-ES', opciones);
        // Capitalizar primera letra
        fechaActual.textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);
    }

    function cargarTareas() {
        const tareasGuardadas = localStorage.getItem('tareas');
        if (tareasGuardadas) {
            tareas = JSON.parse(tareasGuardadas);
            renderizarTareas();
        }
    }

    function guardarTareas() {
        localStorage.setItem('tareas', JSON.stringify(tareas));
        actualizarContador();
    }

    function agregarTarea() {
        const texto = entradaTarea.value.trim();
        if (texto === '') return;

        const nuevaTarea = {
            id: Date.now(),
            texto: texto,
            completada: false,
            fechaCreacion: new Date().toISOString(),
            fechaFinalizacion: null
        };

        tareas.push(nuevaTarea);
        entradaTarea.value = '';
        
        guardarTareas();
        renderizarTareas();
    }

    function eliminarTarea(id) {
        tareas = tareas.filter(tarea => tarea.id !== id);
        guardarTareas();
        renderizarTareas();
    }

    function alternarTarea(id) {
        tareas = tareas.map(tarea => {
            if (tarea.id === id) {
                const completada = !tarea.completada;
                return { 
                    ...tarea, 
                    completada: completada,
                    fechaFinalizacion: completada ? new Date().toISOString() : null
                };
            }
            return tarea;
        });
        guardarTareas();
        renderizarTareas();
    }

    function actualizarContador() {
        const pendientes = tareas.filter(t => !t.completada).length;
        contadorPendientes.textContent = pendientes;
    }

    function formatearFechaHora(isoString) {
        if (!isoString) return '';
        const fecha = new Date(isoString);
        return fecha.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function renderizarTareas() {
        listaTareas.innerHTML = '';
        
        tareas.forEach(tarea => {
            const li = document.createElement('li');
            li.className = `tarea-item ${tarea.completada ? 'completada' : ''}`;
            li.dataset.id = tarea.id;

            const fechaCreacionStr = formatearFechaHora(tarea.fechaCreacion);
            const fechaFinalizacionStr = tarea.fechaFinalizacion ? formatearFechaHora(tarea.fechaFinalizacion) : '';

            li.innerHTML = `
                <div class="checkbox-custom"></div>
                <div class="contenido-tarea">
                    <span class="texto-tarea-contenido">${escaparHTML(tarea.texto)}</span>
                    <div class="fechas-tarea">
                        <span class="fecha-creacion">📅 Creada: ${fechaCreacionStr}</span>
                        ${tarea.completada ? `<span class="fecha-finalizacion">✅ Finalizada: ${fechaFinalizacionStr}</span>` : ''}
                    </div>
                </div>
                <button class="btn-eliminar" aria-label="Eliminar tarea">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;

            listaTareas.appendChild(li);
        });

        actualizarContador();
    }

    function escaparHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
