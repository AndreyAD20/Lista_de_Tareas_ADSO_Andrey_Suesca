document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM
    const entradaTitulo = document.getElementById('entrada-titulo');
    const entradaDescripcion = document.getElementById('entrada-descripcion');
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
    
    // Permitir Enter en ambos inputs para agregar
    if (entradaTitulo) {
        entradaTitulo.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') entradaDescripcion.focus();
        });
    }
    if (entradaDescripcion) {
        entradaDescripcion.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') agregarTarea();
        });
    }
    listaTareas.addEventListener('click', (e) => {
        const item = e.target.closest('.tarea-item');
        if (!item) return;
        const id = parseInt(item.dataset.id);
        if (e.target.closest('.btn-eliminar')) {
            eliminarTarea(id);
        } else if (e.target.closest('.checkbox-custom')) {
            alternarTarea(id);
        } else if (e.target.closest('.contenido-tarea') && !e.target.closest('.modo-edicion')) {
            // Activar edición solo si no se clickea en el checkbox o eliminar
            activarEdicion(id, item);
        } else if (e.target.classList.contains('btn-guardar')) {
            guardarEdicion(id, item);
        }
    });
    // Funciones
    function mostrarFecha() {
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const fecha = new Date().toLocaleDateString('es-ES', opciones);
        fechaActual.textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);
    }
    function cargarTareas() {
        const tareasGuardadas = localStorage.getItem('tareas');
        if (tareasGuardadas) {
            tareas = JSON.parse(tareasGuardadas);
            // Migración simple para tareas antiguas que solo tenían 'texto'
            tareas = tareas.map(t => {
                if (!t.titulo && t.texto) {
                    return { ...t, titulo: t.texto, descripcion: '' };
                }
                return t;
            });
            renderizarTareas();
        }
    }
    function guardarTareas() {
        localStorage.setItem('tareas', JSON.stringify(tareas));
        actualizarContador();
    }
    function agregarTarea() {
        const titulo = entradaTitulo.value.trim();
        const descripcion = entradaDescripcion.value.trim();
        
        if (titulo === '') {
            entradaTitulo.focus();
            return;
        }
        const nuevaTarea = {
            id: Date.now(),
            titulo: titulo,
            descripcion: descripcion,
            completada: false,
            fechaCreacion: new Date().toISOString(),
            fechaFinalizacion: null
        };
        tareas.push(nuevaTarea);
        entradaTitulo.value = '';
        entradaDescripcion.value = '';
        entradaTitulo.focus();
        
        guardarTareas();
        renderizarTareas();
    }
    function eliminarTarea(id) {
        if(confirm('¿Estás seguro de eliminar esta tarea?')) {
            tareas = tareas.filter(tarea => tarea.id !== id);
            guardarTareas();
            renderizarTareas();
        }
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
    function activarEdicion(id, itemElement) {
        const tarea = tareas.find(t => t.id === id);
        if (!tarea || tarea.completada) return; // No editar si está completada
        const contenidoDiv = itemElement.querySelector('.contenido-tarea');
        
        contenidoDiv.innerHTML = `
            <div class="modo-edicion">
                <input type="text" class="edit-titulo" value="${escaparAtributo(tarea.titulo)}" placeholder="Título">
                <input type="text" class="edit-descripcion" value="${escaparAtributo(tarea.descripcion)}" placeholder="Descripción">
                <button class="btn-guardar">Guardar Cambios</button>
            </div>
        `;
        
        const inputTitulo = contenidoDiv.querySelector('.edit-titulo');
        inputTitulo.focus();
    }
    function guardarEdicion(id, itemElement) {
        const nuevoTitulo = itemElement.querySelector('.edit-titulo').value.trim();
        const nuevaDescripcion = itemElement.querySelector('.edit-descripcion').value.trim();
        if (nuevoTitulo === '') return;
        tareas = tareas.map(t => {
            if (t.id === id) {
                return { ...t, titulo: nuevoTitulo, descripcion: nuevaDescripcion };
            }
            return t;
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
                <div class="contenido-tarea" title="Haz click para editar">
                    <div class="titulo-tarea">${escaparHTML(tarea.titulo)}</div>
                    <div class="descripcion-tarea">${escaparHTML(tarea.descripcion)}</div>
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
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    function escaparAtributo(str) {
        if (!str) return '';
        return str.replace(/"/g, '&quot;');
    }
});