import { nombre, email, telefono, empresa, formulario, contenedorLista } from "./variables.js";
let DB;

// imprimir alerta
export function imprimirAlerta(mensage, tipo) {
    const alerta = document.createElement("div");
    alerta.classList.add(
        "alerta",
        "border",
        "px-4",
        "py-3",
        "rounded",
        "max-w-lg",
        "mx-auto",
        "mt-6",
        "text-center"
    );
    alerta.textContent = mensage;

    const existe = document.querySelector(".alerta");

    if (!existe) {
        if (tipo === "error") {
            alerta.classList.add(
                "bg-red-100",
                "border-red-400",
                "text-red-700"
            );
        } else {
            alerta.classList.add(
                "bg-green-100",
                "border-green-400",
                "text-green-700"
            );
        }

        formulario.appendChild(alerta);
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
}

// crear base de datos
export function crearBaseDeDatos() {
    const crearDB = window.indexedDB.open("crm", 1);
    // onerror
    crearDB.onerror = function () {
        console.log("Error al crear DB");
    };

    // onsuccess
    crearDB.onsuccess = function () {
        DB = crearDB.result;
    };

    // onupgradeneeded
    crearDB.onupgradeneeded = function (e) {
        const db = e.target.result;
        // objectStore
        const objectStore = db.createObjectStore("crm", {
            keyPath: "id",
            autoIncrement: true,
        });

        // create index
        objectStore.createIndex("nombre", "nombre", { unique: false });
        objectStore.createIndex("email", "email", { unique: true });
        objectStore.createIndex("telefono", "telefono", { unique: false });
        objectStore.createIndex("empresa", "empresa", { unique: false });
        objectStore.createIndex("id", "id", { unique: true });
    };
}

// validad Formulario
export function validadFormulario() {
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();

        if (
            nombre.value === "" ||
            email.value === "" ||
            telefono.value === "" ||
            empresa.value === ""
        ) {
            imprimirAlerta("Todo los campos son obligatorios", "error");
        } else {
            const cliente = {
                nombre: nombre.value,
                email: email.value,
                telefono: telefono.value,
                empresa: empresa.value,
                id: Date.now(),
            };

            // agregamos el cliente a indexedDB
            const transaction = DB.transaction(["crm"], "readwrite");
            // onerror
            transaction.onerror = function () {
                imprimirAlerta("El Correo Ya Esta Registrado", "error");
                email.value = "";
            };
            // oncomplete
            transaction.oncomplete = function () {
                imprimirAlerta("Agregado Correctamente");
                formulario.reset();
            };
            // objectStore
            const objectStore = transaction.objectStore("crm");
            // add
            objectStore.add(cliente);
        }
    });
}

// hacer la conexion a la base de datos
export function conexionDB(mostrar, editar) {
    // crear conexion
    const conexion = window.indexedDB.open("crm", 1);
    // onerror
    conexion.onerror = function () {
        console.log("Error en la conexion");
    };
    // onsuccess
    conexion.onsuccess = function () {
        DB = conexion.result;

        if (mostrar) {
            mostrarClientes();
            eliminarCliente();
        }
        if (editar) {
            editarCliente();
        }
    };
}

// mostrar clientes en el html
export function mostrarClientes() {
    // conectar objectStore
    const objectStore = DB.transaction("crm").objectStore("crm");

    objectStore.openCursor().onsuccess = function (e) {
        const cursor = e.target.result;

        if (cursor) {
            const { nombre, email, telefono, empresa, id } = cursor.value;

            const clienteDiv = document.createElement("div");
            clienteDiv.classList.add("tabla__top", "bg-white");

            clienteDiv.innerHTML = `
                <div class="px-6 py-3 border-b border-gray-200">
                    <p class="text-sm leading-5 font-medium text-gray-700 font-bold">${nombre}</p>
                    <p class="text-sm leading-8 text-gray-700">${email}</p>
                </div>

                <div class="px-6 py-3 border-b border-gray-200">
                    <p class="text-sm text-gray-700">${telefono}</p>
                </div>

                <div class="px-6 py-3 border-b border-gray-200">
                    <p class="text-sm text-gray-600">${empresa}</p>
                </div>

                <div class="px-6 py-3  border-b border-gray-200 text-sm ">        
                    <a href="editar.html?id=${id}" class="text-teal-600 hover:text-teal-900 mr-5">Editar</a>
                    <a href="#" class="text-red-500 hover:text-red-900 eliminar" data-id="${id}">Eliminar</a>
                </div>
            `;

            contenedorLista.appendChild(clienteDiv);

            cursor.continue();
        }
    };
}

// editarCliente
export function editarCliente() {
    const parametrosURL = new URLSearchParams(window.location.search);
    const clienteId = Number(parametrosURL.get("id"));

    // transaction
    const transaction = DB.transaction(["crm"], "readwrite");
    // objectStore
    const objectStore = transaction.objectStore("crm");

    const clienteEncontrado = objectStore.openCursor();

    // openCursor
    clienteEncontrado.onsuccess = function (e) {
        const cursor = e.target.result;

        if (cursor) {
            if (cursor.value.id === clienteId) {
                llenarFormulario(cursor.value);
            }
            cursor.continue();
        }
    };
}

// llenar Formulario
export function llenarFormulario(cliente) {
    const { nombre, email, telefono, empresa, id } = cliente;

    llenarInput(nombre, email, telefono, empresa, id);
}
// llenar los inputs
export function llenarInput(
    txtNombre,
    txtEmail,
    txtTelefono,
    txtEmpresa,
    txtId
) {
    nombre.value = txtNombre;
    email.value = txtEmail;
    telefono.value = txtTelefono;
    empresa.value = txtEmpresa;

    actualizarCliente(txtId);
}

// actualizar cliente
export function actualizarCliente(id) {
    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        if (
            nombre.value === "" ||
            email.value === "" ||
            telefono.value === "" ||
            empresa.value === ""
        ) {
            imprimirAlerta("Todo los campos son obligatorios", "error");
        } else {
            // creamos un nuevo objecto con el cliente actualizado
            const clienteActualizado = {
                nombre: nombre.value,
                email: email.value,
                telefono: telefono.value,
                empresa: empresa.value,
                id: Number(id),
            };

            // transaction
            const transaction = DB.transaction(["crm"], "readwrite");
            // onerror
            transaction.onerror = function () {
                imprimirAlerta("Error al actualizar cliente", "error");
            };
            // oncomplete
            transaction.oncomplete = function () {
                imprimirAlerta("Actualizado correctamente");
                formulario.reset();
                setTimeout(() => {
                    window.location.href = "mostrar-clientes.html";
                }, 2000);
            };
            // objectStore
            const objectStore = transaction.objectStore("crm");
            // put
            objectStore.put(clienteActualizado);
        }
    });
}
// eliminar cliente
export function eliminarCliente() {
    contenedorLista.addEventListener("click", (e) => {
        if (e.target.classList.contains("eliminar")) {
            const id = Number(e.target.getAttribute("data-id"));
            // transaction
            const transaction = DB.transaction(["crm"], "readwrite");
            // onerror
            transaction.onerror = function () {
                console.log("Error al eliminar cliente");
            };
            // oncomplete
            transaction.oncomplete = function () {
                e.target.parentElement.parentElement.remove();
            };
            // objectStore
            const objectStore = transaction.objectStore("crm");
            // delete
            objectStore.delete(id);
        }
    });
}
