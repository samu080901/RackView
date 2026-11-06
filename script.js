
// ==========================================
// RACKVIEW - SISTEMA DE GESTIÓN DE RACKS
// ==========================================

const STORAGE_KEY = "rackview_inventario";

// Inventario inicial de prueba
const inventarioInicial = [
    { rack: "Rack-01", equipo: "Switch Core 01", vendor: "Cisco", ubicacion_u: "U01-U02", ip: "192.168.1.10", funcion: "Switch principal", energia: "250 W", interfaces: "48 puertos" },
    { rack: "Rack-01", equipo: "Router Principal", vendor: "Huawei", ubicacion_u: "U03-U04", ip: "192.168.1.11", funcion: "Enrutamiento", energia: "180 W", interfaces: "8 puertos" },
    { rack: "Rack-01", equipo: "Firewall 01", vendor: "Cisco", ubicacion_u: "U05", ip: "192.168.1.12", funcion: "Seguridad de red", energia: "120 W", interfaces: "12 puertos" },
    { rack: "Rack-01", equipo: "Servidor Web", vendor: "Huawei", ubicacion_u: "U06-U08", ip: "192.168.1.13", funcion: "Alojamiento web", energia: "450 W", interfaces: "4 puertos" },
    { rack: "Rack-02", equipo: "Switch Acceso 01", vendor: "Cisco", ubicacion_u: "U01-U02", ip: "192.168.2.10", funcion: "Distribución de red", energia: "200 W", interfaces: "24 puertos" },
    { rack: "Rack-02", equipo: "Router Secundario", vendor: "Huawei", ubicacion_u: "U03", ip: "192.168.2.11", funcion: "Conexión externa", energia: "150 W", interfaces: "8 puertos" },
    { rack: "Rack-02", equipo: "Servidor BD", vendor: "Cisco", ubicacion_u: "U04-U06", ip: "192.168.2.12", funcion: "Base de datos", energia: "500 W", interfaces: "6 puertos" },
    { rack: "Rack-02", equipo: "Firewall 02", vendor: "Huawei", ubicacion_u: "U07", ip: "192.168.2.13", funcion: "Protección de red", energia: "130 W", interfaces: "10 puertos" },
    { rack: "Rack-03", equipo: "Switch Distribución", vendor: "Cisco", ubicacion_u: "U01-U02", ip: "192.168.3.10", funcion: "Distribución", energia: "230 W", interfaces: "48 puertos" },
    { rack: "Rack-03", equipo: "Servidor Aplicaciones", vendor: "Huawei", ubicacion_u: "U03-U05", ip: "192.168.3.11", funcion: "Aplicaciones internas", energia: "400 W", interfaces: "4 puertos" },
    { rack: "Rack-03", equipo: "Switch Acceso 02", vendor: "Cisco", ubicacion_u: "U06-U07", ip: "192.168.3.12", funcion: "Conectividad", energia: "190 W", interfaces: "24 puertos" },
    { rack: "Rack-03", equipo: "Router Respaldo", vendor: "Huawei", ubicacion_u: "U08", ip: "192.168.3.13", funcion: "Respaldo de conexión", energia: "140 W", interfaces: "8 puertos" }
];

// Cargar inventario guardado o iniciar con datos de prueba
let inventario = cargarInventario();
let vendorChart = null;

function cargarInventario() {
    try {
        const guardado = localStorage.getItem(STORAGE_KEY);
        return guardado ? JSON.parse(guardado) : [...inventarioInicial];
    } catch (error) {
        console.error("No se pudo cargar el inventario:", error);
        return [...inventarioInicial];
    }
}

function guardarInventario() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventario));
}

// Obtener número de unidades U ocupadas por un equipo
function unidadesOcupadas(texto) {
    const numeros = String(texto).match(/\d+/g);

    if (!numeros || numeros.length === 0) return 1;

    if (numeros.length === 1) return 1;

    const inicio = Number(numeros[0]);
    const fin = Number(numeros[1]);

    return Math.max(1, fin - inicio + 1);
}

// Actualizar todas las estadísticas
function actualizarEstadisticas() {
    const racks = [...new Set(inventario.map(item => item.rack))];
    const fabricantes = [...new Set(inventario.map(item => item.vendor))];

    document.getElementById("totalEquipos").textContent = inventario.length;
    document.getElementById("totalRacks").textContent = racks.length;
    document.getElementById("totalVendors").textContent = fabricantes.length;

    // Se estima una capacidad de 42 unidades U por rack
    const capacidadTotal = racks.length * 42;
    const ocupadas = inventario.reduce(
        (total, item) => total + unidadesOcupadas(item.ubicacion_u), 0
    );

    const porcentaje = capacidadTotal
        ? Math.round((ocupadas / capacidadTotal) * 100)
        : 0;

    document.getElementById("ocupacion").textContent = porcentaje + "%";

    actualizarGrafica(fabricantes);
    actualizarRacks(racks);
    actualizarFiltroRacks(racks);
}

// Crear gráfica de fabricantes
function actualizarGrafica(fabricantes) {
    const cantidades = fabricantes.map(
        marca => inventario.filter(item => item.vendor === marca).length
    );

    const canvas = document.getElementById("vendorChart");
    if (!canvas || typeof Chart === "undefined") return;

    if (vendorChart) {
        vendorChart.destroy();
    }

    vendorChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: fabricantes,
            datasets: [{
                data: cantidades,
                backgroundColor: ["#7867ed", "#42c98b", "#e5a84b", "#4d9fe8"],
                borderColor: "#141414",
                borderWidth: 5,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#aaa",
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 11 }
                    }
                }
            },
            cutout: "68%"
        }
    });
}

// Mostrar ocupación de cada rack
function actualizarRacks(racks) {
    const contenedor = document.getElementById("rackSummary");

    if (racks.length === 0) {
        contenedor.innerHTML = '<p class="empty-message">Todavía no hay racks registrados.</p>';
        return;
    }

    contenedor.innerHTML = racks.map(rack => {
        const equipos = inventario.filter(item => item.rack === rack);
        const ocupadas = equipos.reduce(
            (total, item) => total + unidadesOcupadas(item.ubicacion_u), 0
        );
        const porcentaje = Math.min(100, Math.round((ocupadas / 42) * 100));

        return `
            <div class="rack-item">
                <div class="rack-item-header">
                    <strong>${escaparHTML(rack)}</strong>
                    <span>${porcentaje}% · ${equipos.length} equipos</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${porcentaje}%"></div>
                </div>
            </div>
        `;
    }).join("");
}

// Actualizar opciones del filtro de racks
function actualizarFiltroRacks(racks) {
    const filtro = document.getElementById("rackFilter");
    const seleccionado = filtro.value;

    filtro.innerHTML = '<option value="">Todos los racks</option>';

    racks.forEach(rack => {
        const opcion = document.createElement("option");
        opcion.value = rack;
        opcion.textContent = rack;
        filtro.appendChild(opcion);
    });

    filtro.value = racks.includes(seleccionado) ? seleccionado : "";
}

// Mostrar los equipos en la tabla
function mostrarInventario() {
    const cuerpo = document.getElementById("inventoryBody");
    const busqueda = document.getElementById("searchInput").value.toLowerCase();
    const fabricante = document.getElementById("vendorFilter").value;
    const rack = document.getElementById("rackFilter").value;

    const resultados = inventario
        .map((item, indice) => ({ ...item, indice }))
        .filter(item => {
            const coincideBusqueda = [
                item.equipo, item.vendor, item.rack,
                item.ip, item.funcion, item.ubicacion_u
            ].some(valor => String(valor).toLowerCase().includes(busqueda));

            const coincideFabricante = !fabricante || item.vendor === fabricante;
            const coincideRack = !rack || item.rack === rack;

            return coincideBusqueda && coincideFabricante && coincideRack;
        });

    if (resultados.length === 0) {
        cuerpo.innerHTML = `
            <tr><td colspan="8" class="empty-message">
                No se encontraron equipos.
            </td></tr>
        `;
        return;
    }

    cuerpo.innerHTML = resultados.map(item => `
        <tr>
            <td><strong>${escaparHTML(item.equipo)}</strong></td>
            <td><span class="vendor-badge">${escaparHTML(item.vendor)}</span></td>
            <td>${escaparHTML(item.rack)}</td>
            <td>${escaparHTML(item.ubicacion_u)}</td>
            <td>${escaparHTML(item.ip || "—")}</td>
            <td>${escaparHTML(item.funcion)}</td>
            <td><span class="energy-badge">${escaparHTML(item.energia || "—")}</span></td>
            <td>
                <button class="action-button" data-edit="${item.indice}">Editar</button>
                <button class="action-button delete-button" data-delete="${item.indice}">Eliminar</button>
            </td>
        </tr>
    `).join("");
}

// Evitar que los datos escritos se interpreten como HTML
function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

// Abrir y cerrar ventana de registro
const modal = document.getElementById("equipmentModal");
const formulario = document.getElementById("equipmentForm");

document.getElementById("addEquipment").addEventListener("click", () => {
    formulario.reset();
    delete formulario.dataset.editando;
    modal.classList.add("open");
});

document.getElementById("closeModal").addEventListener("click", () => {
    modal.classList.remove("open");
});

modal.addEventListener("click", evento => {
    if (evento.target === modal) {
        modal.classList.remove("open");
    }
});

// Registrar o editar un equipo
formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    const datos = Object.fromEntries(new FormData(formulario).entries());

    if (formulario.dataset.editando !== undefined) {
        const indice = Number(formulario.dataset.editando);
        inventario[indice] = datos;
    } else {
        inventario.push(datos);
    }

    guardarInventario();
    actualizarTodo();
    formulario.reset();
    delete formulario.dataset.editando;
    modal.classList.remove("open");
});

// Editar o eliminar equipos desde la tabla
document.getElementById("inventoryBody").addEventListener("click", evento => {
    const botonEditar = evento.target.closest("[data-edit]");
    const botonEliminar = evento.target.closest("[data-delete]");

    if (botonEditar) {
        const indice = Number(botonEditar.dataset.edit);
        const equipo = inventario[indice];

        if (!equipo) return;

        Object.entries(equipo).forEach(([campo, valor]) => {
            if (formulario.elements[campo]) {
                formulario.elements[campo].value = valor;
            }
        });

        formulario.dataset.editando = indice;
        modal.classList.add("open");
    }

    if (botonEliminar) {
        const indice = Number(botonEliminar.dataset.delete);
        const equipo = inventario[indice];

        if (!equipo) return;

        if (confirm(`¿Deseas eliminar el equipo "${equipo.equipo}"?`)) {
            inventario.splice(indice, 1);
            guardarInventario();
            actualizarTodo();
        }
    }
});

// Búsqueda y filtros
document.getElementById("searchInput").addEventListener("input", mostrarInventario);
document.getElementById("vendorFilter").addEventListener("change", mostrarInventario);

document.getElementById("rackFilter").addEventListener("change", mostrarInventario);

// Exportar inventario a CSV
document.getElementById("exportCsv").addEventListener("click", () => {
    const columnas = [
        "rack", "equipo", "vendor", "ubicacion_u",
        "ip", "funcion", "energia", "interfaces"
    ];

    const filas = [
        columnas.join(","),
        ...inventario.map(item =>
            columnas.map(columna => csvEscapar(item[columna] ?? "")).join(",")
        )
    ];

    const contenido = "\uFEFF" + filas.join("\r\n");
    const archivo = new Blob([contenido], {
        type: "text/csv;charset=utf-8;"
    });

    const enlace = document.createElement("a");
    const url = URL.createObjectURL(archivo);

    enlace.href = url;
    enlace.download = "inventario_rack.csv";
    enlace.click();

    URL.revokeObjectURL(url);
});

// Escapar campos para el formato CSV
function csvEscapar(valor) {
    return '"' + String(valor).replace(/"/g, '""') + '"';
}

// Leer un archivo CSV respetando comillas y comas
function leerCSV(texto) {
    const filas = [];
    let fila = [];
    let campo = "";
    let dentroComillas = false;

    for (let i = 0; i < texto.length; i++) {
        const caracter = texto[i];
        const siguiente = texto[i + 1];

        if (caracter === '"' && dentroComillas && siguiente === '"') {
            campo += '"';
            i++;
        } else if (caracter === '"') {
            dentroComillas = !dentroComillas;
        } else if (caracter === "," && !dentroComillas) {
            fila.push(campo);
            campo = "";
        } else if ((caracter === "\n" || caracter === "\r") && !dentroComillas) {
            if (caracter === "\r" && siguiente === "\n") i++;
            fila.push(campo);
            if (fila.some(valor => valor.trim() !== "")) filas.push(fila);
            fila = [];
            campo = "";
        } else {
            campo += caracter;
        }
    }

    fila.push(campo);
    if (fila.some(valor => valor.trim() !== "")) filas.push(fila);

    return filas;
}

// Importar inventario desde CSV
document.getElementById("importCsv").addEventListener("change", async evento => {
    const archivo = evento.target.files[0];

    if (!archivo) return;

    try {
        const texto = await archivo.text();
        const filas = leerCSV(texto);

        if (filas.length < 2) {
            throw new Error("El archivo no contiene registros.");
        }

        const encabezados = filas[0].map(
            valor => valor.trim().replace(/^\uFEFF/, "").toLowerCase()
        );

        const columnasObligatorias = [
            "rack", "equipo", "vendor", "ubicacion_u",
            "ip", "funcion", "energia", "interfaces"
        ];

        const faltantes = columnasObligatorias.filter(
            columna => !encabezados.includes(columna)
        );

        if (faltantes.length) {
            throw new Error("Faltan columnas: " + faltantes.join(", "));
        }

        const nuevosEquipos = filas.slice(1).map(fila => {
            const registro = {};

            columnasObligatorias.forEach(columna => {
                const posicion = encabezados.indexOf(columna);
                registro[columna] = (fila[posicion] || "").trim();
            });

            return registro;
        }).filter(item => item.equipo && item.rack);

        if (nuevosEquipos.length === 0) {
            throw new Error("No se encontraron equipos válidos.");
        }

        if (confirm(`Se encontraron ${nuevosEquipos.length} equipos. ¿Deseas reemplazar el inventario actual?`)) {
            inventario = nuevosEquipos;
            guardarInventario();
            actualizarTodo();
            alert("Inventario importado correctamente.");
        }
    } catch (error) {
        alert("No se pudo importar el archivo: " + error.message);
    } finally {
        evento.target.value = "";
    }
});

// Mostrar fecha actual
function mostrarFecha() {
    const fecha = new Date();

    document.getElementById("currentDate").textContent =
        fecha.toLocaleDateString("es-CO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}

// Actualizar el dashboard completo
function actualizarTodo() {
    actualizarEstadisticas();
    mostrarInventario();
}

// Inicio del sistema
mostrarFecha();
actualizarTodo();
