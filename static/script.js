console.log("script.js: Script loaded.");

// Funciones para el modal
function mostrarModal() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal-resultados').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('modal-resultados').style.display = 'none';
}

// Función para mostrar resultados con formato mejorado
function mostrarResultados(data) {
    const resultadosDiv = document.getElementById('resultados');
    
    // Si hay un mensaje de éxito, mostrarlo de forma destacada
    if (data.mensaje) {
        // Mostrar notificación toast
        mostrarNotificacion(data.mensaje, 'success');
        
        // Formatear el resultado para mostrar el mensaje de éxito destacado
        let contenido = `<div class="success-text mb-3">✅ ${data.mensaje}</div>`;
        delete data.mensaje; // Remover el mensaje para que no se duplique
        
        // Añadir el resto de datos formateados
        if (Object.keys(data).length > 0) {
            contenido += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
        
        resultadosDiv.innerHTML = contenido;
    } else {
        // JSON normal para otros resultados
        resultadosDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }
    
    // Mostrar el modal con los resultados
    mostrarModal();
}

// Función para mostrar errores con formato mejorado
function mostrarError(mensaje) {
    const resultadosDiv = document.getElementById('resultados');
    
    // Mostrar notificación toast
    mostrarNotificacion(mensaje, 'error');
    
    // Formatear el error
    resultadosDiv.innerHTML = `<div class="error-text">❌ Error: ${mensaje}</div>`;
    
    // Mostrar el modal con el error
    mostrarModal();
}

// Función para mostrar notificaciones tipo toast
function mostrarNotificacion(mensaje, tipo = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    
    // Crear el elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    
    // Título según el tipo
    let titulo = tipo === 'success' ? 'Éxito' : 
                 tipo === 'error' ? 'Error' : 'Información';
    
    // Icono según el tipo
    let icono = tipo === 'success' ? '✅' : 
               tipo === 'error' ? '❌' : 'ℹ️';
    
    // Contenido del toast
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">${icono} ${titulo}</strong>
            <button type="button" class="btn-close" aria-label="Cerrar" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
        <div class="toast-body">
            ${mensaje}
        </div>
    `;
    
    // Añadir al contenedor
    toastContainer.appendChild(toast);
    
    // Eliminar después de 5 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// --- Event Listeners (Execute after DOM is loaded) ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("script.js: DOM fully loaded and parsed.");
    // Cargar grafo - Attach listener after DOM ready
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            const nodesFile = document.getElementById('nodesFile');
            const edgesFile = document.getElementById('edgesFile');

            // Check if files are selected
            if (nodesFile && nodesFile.files.length > 0) {
                formData.append('nodes', nodesFile.files[0]);
            } else {
                mostrarError('Por favor, seleccione un archivo de nodos.');
                return;
            }

            if (edgesFile && edgesFile.files.length > 0) {
                 formData.append('edges', edgesFile.files[0]);
            } else {
                 mostrarError('Por favor, seleccione un archivo de aristas.');
                 return;
            }
            
            fetch('/cargar-grafo', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    mostrarError(data.error);
                } else {
                    mostrarResultados(data);
                }
            })
            .catch(error => mostrarError(error.message));
        });
    } else {
         console.error("Elemento con ID 'uploadForm' no encontrado.");
    }

    // Cerrar modal al hacer clic fuera - Attach listener after DOM ready
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', function() {
            cerrarModal();
        });
    } else {
        console.error("Elemento con ID 'overlay' no encontrado.");
    }

    // Attach listeners to buttons that call global functions
    // Example for one button (optional, as onclick attributes are used)
    // const infoButton = document.querySelector('button[onclick="infoGrafo()"]');
    // if(infoButton) {
    //     infoButton.addEventListener('click', infoGrafo);
    // } 
    // Note: Keep onclick attributes for simplicity unless refactoring to fully JS-based event handling.
    
     // Attach listener for graph visualization node click
     const svgElement = document.getElementById('grafo-svg');
     if (svgElement) {
         svgElement.addEventListener('click', () => {
             const nodeInfo = document.getElementById('node-info');
             if (nodeInfo) {
                 nodeInfo.style.display = 'none';
             }
         });
     } else {
         // This might log if the graph hasn't been visualized yet, which is normal.
         // console.log("Elemento SVG 'grafo-svg' no encontrado al cargar la página.");
     }

});


// --- API Call Functions (remain globally accessible for onclick) ---

// Información del grafo
function infoGrafo() {
    console.log("script.js: infoGrafo() called.");
    fetch('/info-grafo')
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            mostrarError(data.error);
        } else {
            // Si no hay un mensaje de éxito explícito, añadimos uno
            if (!data.mensaje) {
                data.mensaje = "Información del grafo obtenida correctamente";
            }
            mostrarResultados(data);
        }
    })
    .catch(error => mostrarError(error.message));
}

// Listar nodos
function listarNodos() {
    console.log("script.js: listarNodos() called.");
    fetch('/nodos')
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            mostrarError(data.error);
        } else {
            // Añadir mensaje de éxito
            data.mensaje = `Listado de ${data.nodos?.length || 0} nodos obtenido correctamente`;
            mostrarResultados(data);
        }
    })
    .catch(error => mostrarError(error.message));
}

// Listar aristas
function listarAristas() {
    console.log("script.js: listarAristas() called.");
    fetch('/aristas')
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            mostrarError(data.error);
        } else {
            // Añadir mensaje de éxito
            data.mensaje = `Listado de ${data.aristas?.length || 0} aristas obtenido correctamente`;
            mostrarResultados(data);
        }
    })
    .catch(error => mostrarError(error.message));
}

// Calcular métricas
function calcularMetricas() {
    console.log("script.js: calcularMetricas() called.");
    mostrarNotificacion('Calculando métricas, por favor espere...', 'info');
    
    fetch('/calcular-metricas', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            mostrarError(data.error);
        } else {
            mostrarResultados(data);
        }
    })
    .catch(error => mostrarError(error.message));
}

// Buscar nodo por nombre
function buscarNodo() {
    console.log("script.js: buscarNodo() called.");
    const nombre = document.getElementById('buscarNodoInput').value;
    if (!nombre) {
        return mostrarError('Debe ingresar un nombre para buscar');
    }
    
    fetch(`/buscar-nodo/${nombre}`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            mostrarError(data.error);
        } else {
            data.mensaje = `Nodo "${nombre}" encontrado correctamente`;
            mostrarResultados(data);
        }
    })
    .catch(error => mostrarError(error.message));
}

// Calcular distancia entre nodos
function calcularDistancia() {
    console.log("script.js: calcularDistancia() called.");
    const nodo1 = document.getElementById('nodoId1').value;
    const nodo2 = document.getElementById('nodoId2').value;
    
    if (!nodo1 || !nodo2) {
        return mostrarError('Debe ingresar los IDs de ambos nodos');
    }
    
    fetch(`/distancia/${nodo1}/${nodo2}`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            mostrarError(data.error);
        } else {
            data.mensaje = `Distancia calculada correctamente`;
            mostrarResultados(data);
        }
    })
    .catch(error => mostrarError(error.message));
}

// Visualizar grafo
function visualizarGrafo() {
    console.log("script.js: visualizarGrafo() called.");
    mostrarNotificacion('Generando visualización del grafo...', 'info');
    
    fetch('/grafo-visualizacion')
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            return mostrarError(data.error);
        }
        renderGrafo(data);
        mostrarNotificacion(`Grafo visualizado con ${data.nodes.length} nodos y ${data.links.length} aristas`, 'success');
    })
    .catch(error => mostrarError(error.message));
}

// Renderizar el grafo con D3.js
function renderGrafo(data) {
    console.log("script.js: renderGrafo() called.");
    // Mostrar el contenedor
    document.getElementById('grafo-container').classList.remove('d-none');
    
    // Limpiar el SVG
    d3.select("#grafo-svg").selectAll("*").remove();
    
    const svg = d3.select("#grafo-svg"),
          width = svg.node().getBoundingClientRect().width,
          height = svg.node().getBoundingClientRect().height;
    
    // Crear grupo principal para aplicar zoom
    const g = svg.append("g");
    
    // Configurar el zoom
    const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
    
    // Aplicar zoom al SVG
    svg.call(zoom);
    
    // Resetear zoom
    window.resetZoom = function() {
        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity
        );
    };
    
    // Crear la simulación de fuerzas
    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(30));
    
    // Crear las líneas (enlaces)
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("class", "link");
    
    // Crear los nodos
    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(data.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("id", d => `node-${d.id.replace(/[^a-zA-Z0-9]/g, "_")}`)
        .on("click", function(event, d) {
            event.stopPropagation();
            mostrarInfoNodo(d, event, this);
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
    // Añadir círculos a los nodos
    node.append("circle")
        .attr("r", d => Math.max(5, Math.min(15, d.value)))
        .attr("fill", d => getRandomColor(d.id));
    
    // Añadir etiquetas a los nodos
    node.append("text")
        .attr("dy", -10)
        .text(d => d.label || d.id)
        .attr("text-anchor", "middle");
    
    // Añadir título al pasar el ratón
    node.append("title")
        .text(d => d.label || d.id);
    
    // Actualización en cada tick de la simulación
    simulation.on("tick", () => {
        link
            .attr("x1", d => Math.max(10, Math.min(width - 10, d.source.x)))
            .attr("y1", d => Math.max(10, Math.min(height - 10, d.source.y)))
            .attr("x2", d => Math.max(10, Math.min(width - 10, d.target.x)))
            .attr("y2", d => Math.max(10, Math.min(height - 10, d.target.y)));
        
        node.attr("transform", d => `translate(${Math.max(10, Math.min(width - 10, d.x))},${Math.max(10, Math.min(height - 10, d.y))})`);
    });
    
    // Funciones para el arrastre
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    // Generar colores aleatorios pero consistentes para cada nodo
    function getRandomColor(id) {
        // Asegurarse de que id sea una cadena
        id = String(id || '');
        // Verificar si id está vacío
        if (!id) {
            return 'hsl(0, 70%, 60%)'; // Color rojo por defecto
        }
        // Genera un color basado en el id para que el mismo nodo siempre tenga el mismo color
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
    
    // Función para mostrar información del nodo
    function mostrarInfoNodo(nodo, event, nodeElement) {
        event.preventDefault();
        const nodeInfo = document.getElementById('node-info');
        
        // Log para depuración
        console.log('Mostrando info de nodo:', nodo);
        
        // Verificar que el nodo tiene un ID válido
        if (!nodo || !nodo.id) {
            console.error('Error: Nodo sin ID válido', nodo);
            nodeInfo.innerHTML = `<p class="error-text">Error: El nodo no tiene un ID válido</p>`;
            nodeInfo.style.left = `${event.clientX}px`;
            nodeInfo.style.top = `${event.clientY}px`;
            nodeInfo.style.display = 'block';
            return;
        }
        
        // Mostrar información de carga
        nodeInfo.innerHTML = `<p>Cargando información del nodo ${nodo.id}...</p>`;
        nodeInfo.style.left = `${event.clientX}px`;
        nodeInfo.style.top = `${event.clientY}px`;
        nodeInfo.style.display = 'block';
        
        const url = `/nodo/${encodeURIComponent(nodo.id)}`;
        console.log('Solicitando datos de:', url);
        
        // Obtener información detallada del nodo
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`No se encontró el nodo con ID ${nodo.id}`);
                    } else {
                        throw new Error(`Error del servidor: ${response.status}`);
                    }
                }
                
                // Verificar que la respuesta es JSON antes de parsearla
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    // Si no es JSON, leer como texto y mostrar error
                    return response.text().then(text => {
                        console.error('Respuesta no es JSON:', text);
                        throw new Error('La respuesta del servidor no es JSON válido');
                    });
                }
            })
            .then(data => {
                // Verificar si hay error
                if (data.error) {
                    nodeInfo.innerHTML = `<p class="error-text">Error: ${data.error}</p>`;
                } else {
                    // Crear contenido HTML
                    let html = `
                        <h6>Nodo: ${data.nombre}</h6>
                        <p><strong>ID:</strong> ${data.id}</p>
                        <p><strong>Adyacentes:</strong> ${data.num_adyacentes}</p>
                    `;
                    
                    // Función auxiliar para formatear valores numéricos
                    const formatNumber = (value) => {
                        return (value !== null && value !== undefined) ? parseFloat(value).toFixed(3) : '0.000';
                    };
                    
                    // Añadir métricas si están disponibles
                    if (data.centralidad !== undefined) {
                        html += `<p><strong>Centralidad:</strong> ${formatNumber(data.centralidad)}</p>`;
                    }
                    if (data.cercania !== undefined) {
                        html += `<p><strong>Cercanía:</strong> ${formatNumber(data.cercania)}</p>`;
                    }
                    if (data.intermediacion !== undefined) {
                        html += `<p><strong>Intermediación:</strong> ${formatNumber(data.intermediacion)}</p>`;
                    }
                    if (data.pagerank !== undefined) {
                        html += `<p><strong>PageRank:</strong> ${formatNumber(data.pagerank)}</p>`;
                    }
                    // Añadir métricas de HITS
                    if (data.authority !== undefined) {
                        html += `<p><strong>Authority:</strong> ${formatNumber(data.authority)}</p>`;
                    }
                    if (data.hub !== undefined) {
                        html += `<p><strong>Hub:</strong> ${formatNumber(data.hub)}</p>`;
                    }
                    
                    nodeInfo.innerHTML = html;
                }
            })
            .catch(error => {
                console.error("Error al obtener información del nodo:", error);
                nodeInfo.innerHTML = `<p class="error-text">❌ Error: ${error.message}</p>`;
            });
    }
    
    // Cerrar la información del nodo al hacer clic en otra parte
    // Necesita que 'svg' sea accesible globalmente o pasado como argumento si está fuera del alcance
    // Como está definido dentro de renderGrafo, se buscará la forma de adjuntar el listener correctamente.
    // Una opción es adjuntarlo al final de renderGrafo
    const svgElement = document.getElementById('grafo-svg');
    if (svgElement) {
        svgElement.addEventListener('click', () => {
            document.getElementById('node-info').style.display = 'none';
        });
    } else {
        console.error("Elemento SVG no encontrado para adjuntar listener de click.");
    }
}

// --- Final structure reminder ---
// Global functions (API calls, UI updates like modal/toast) are defined first.
// Then, the DOMContentLoaded listener attaches event handlers to elements. 