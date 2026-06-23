let cart = JSON.parse(localStorage.getItem('ventasSilvaCart')) || [];
let selectedDeliveryMethod = null;

function addToCart(name, price, id) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1, id: id });
    }

    updateButton(name, price, id);
    saveAndRefresh();
}

function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(name);
    } else {
        updateButton(item.name, item.price, item.id);
        saveAndRefresh();
    }
}

function updateButton(name, price, id) {
    const container = document.getElementById(`btn-container-${id}`);
    if (!container) return;

    const item = cart.find(i => i.name === name);
    const quantity = item ? item.quantity : 0;

    if (quantity > 0) {
        container.innerHTML = `
            <div class="d-flex align-items-center justify-content-between border rounded-pill p-1 bg-light">
                <button class="btn btn-sm btn-dark rounded-circle" onclick="updateQuantity('${name}', -1)" style="width:30px; height:30px;">-</button>
                <span class="fw-bold mx-2">${quantity}</span>
                <button class="btn btn-sm btn-dark rounded-circle" onclick="updateQuantity('${name}', 1)" style="width:30px; height:30px;">+</button>
            </div>
        `;
    }
}

function resetButton(name, price, id) {
    const container = document.getElementById(`btn-container-${id}`);
    if (container) {
        container.innerHTML = `<button class="btn btn-add w-100 py-2 btn-sm-custom" onclick="addToCart('${name}', ${price}, '${id}')">+ Añadir</button>`;
    }
}

function saveAndRefresh() {
    localStorage.setItem('ventasSilvaCart', JSON.stringify(cart));
    renderCart();

    const countLabel = document.getElementById('cart-count');
    const countLabelDesktop = document.getElementById('cart-count-desktop');

    if (countLabel) {
        const cartBtn = countLabel.parentElement;
        countLabel.classList.remove('cart-pop');
        if (cartBtn) cartBtn.classList.remove('cart-icon-shake');
        setTimeout(() => {
            countLabel.classList.add('cart-pop');
            if (cartBtn) cartBtn.classList.add('cart-icon-shake');
        }, 10);
    }

    if (countLabelDesktop) {
        const cartBtnDesktop = countLabelDesktop.parentElement;
        countLabelDesktop.classList.remove('cart-pop');
        if (cartBtnDesktop) cartBtnDesktop.classList.remove('cart-icon-shake');
        setTimeout(() => {
            countLabelDesktop.classList.add('cart-pop');
            if (cartBtnDesktop) cartBtnDesktop.classList.add('cart-icon-shake');
        }, 10);
    }
}

function renderCart() {
    const itemsContainer = document.getElementById('cart-items');
    const totalLabel = document.getElementById('cart-total');
    const countLabel = document.getElementById('cart-count');
    const countLabelDesktop = document.getElementById('cart-count-desktop');
    
    if (!itemsContainer || !totalLabel) return;

    itemsContainer.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    // --- MANEJO DE CARRITO VACÍO (SOLUCIÓN DEFINITIVA) ---
    if (cart.length === 0) {
        // Selecciona todos los contenedores de botones de la tienda y los regresa a su estado original
        document.querySelectorAll('[id^="btn-container-"]').forEach(container => {
            const id = container.id.replace('btn-container-', '');
            // Extrae los datos de forma segura desde los atributos data-*
            const name = container.getAttribute('data-name') || '';
            const price = parseFloat(container.getAttribute('data-price') || '0');
            
            // Reconstruye el botón original sin romper nada
            container.innerHTML = `<button class="btn btn-add w-100 py-2 btn-sm-custom" onclick="addToCart('${name}', ${price}, '${id}')">+ Añadir</button>`;
        });

        itemsContainer.innerHTML = `
            <div class="text-center my-5 animate__animated animate__fadeIn">
                <div class="fs-1 opacity-25">🛒</div>
                <p class="text-muted mt-2">Tu carrito está vacío</p>
            </div>`;
    } else {
        // --- RENDERIZADO DE PRODUCTOS EN EL CARRITO ---
        cart.forEach((item) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            totalItems += item.quantity;

            itemsContainer.innerHTML += `
                <div class="cart-item shadow-sm border-0 mb-3 p-3 animate__animated animate__fadeInRight" 
                     style="background: white; border-radius: 15px;">
                    <div class="d-flex justify-content-between align-items-center">
                        <div style="flex: 1; text-align: left;">
                            <h6 class="mb-1 fw-bold text-dark">${item.name}</h6>
                            <div class="d-flex align-items-center gap-2">
                                <div class="btn-group btn-group-sm border rounded-pill overflow-hidden bg-light">
                                    <button class="btn btn-light border-0 px-2" onclick="updateQuantity('${item.name}', -1)">−</button>
                                    <span class="px-2 fw-bold d-flex align-items-center">${item.quantity}</span>
                                    <button class="btn btn-light border-0 px-2" onclick="updateQuantity('${item.name}', 1)">+</button>
                                </div>
                                <small class="text-muted">$${item.price.toFixed(2)} c/u</small>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div class="fw-bold text-success fs-5 mb-1">$${subtotal.toFixed(2)}</div>
                            <button class="btn btn-sm text-danger p-0 border-0 bg-transparent" 
        onclick="removeFromCart('${item.name}')"
        title="Quitar producto">
    <i class="bi bi-trash-fill" style="font-size: 1.1rem;"></i>
</button>
                        </div>
                    </div>
                </div>`;
        });
    }

    if (countLabel) countLabel.innerText = totalItems;
    if (countLabelDesktop) countLabelDesktop.innerText = totalItems;
    totalLabel.innerText = `$${total.toFixed(2)}`;
    
    // Sincroniza los estados numéricos de los botones de la tienda si hay elementos activos
    if (cart.length > 0) {
        syncButtonsWithCart();
    }
}

function syncButtonsWithCart() {
    cart.forEach(item => {
        if (item.id) {
            updateButton(item.name, item.price, item.id);
        }
    });
}

function removeFromCart(name) {
    const itemToRemove = cart.find(item => item.name === name);
    if (itemToRemove) {
        resetButton(itemToRemove.name, itemToRemove.price, itemToRemove.id);
        cart = cart.filter(item => item.name !== name);
    }
    saveAndRefresh();
}

function clearCart() {
    Swal.fire({
        title: '¿VACIAR PEDIDO?',
        text: "Se eliminarán todos los productos de tu lista.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1a1a1a',
        cancelButtonColor: '#d33',
        confirmButtonText: 'SÍ, VACIAR',
        cancelButtonText: 'VOLVER',
        allowOutsideClick: false 
    }).then((result) => {
        if (result.isConfirmed) {
            try {
                cart = []; 
                localStorage.setItem('ventasSilvaCart', JSON.stringify([]));
                renderCart(); // Al llamarse aquí, ejecutará el reseteo completo mediante los atributos data-*

                Swal.fire({
                    title: '¡Vaciado!',
                    text: 'Tu carrito está limpio.',
                    icon: 'success',
                    timer: 1000,
                    showConfirmButton: false
                });

            } catch (error) {
                console.error("Error al vaciar:", error);
            }
        }
    });
}

function toggleCart() {
    const cartPanel = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (cartPanel) {
        cartPanel.classList.toggle('active');
        if (overlay) {
            overlay.style.display = cartPanel.classList.contains('active') ? 'block' : 'none';
        }
    }
}

/* ==========================================================================
   LÓGICA DEL MODAL DE ENTREGA Y ENVÍO A WHATSAPP
   ========================================================================== */

function resetModalState() {
    selectedDeliveryMethod = null;
    const btnSucursal = document.getElementById('btnSucursal');
    const btnDomicilio = document.getElementById('btnDomicilio');
    const direccionContainer = document.getElementById('direccionContainer');
    const inputDireccion = document.getElementById('inputDireccion');
    const btnEnviarFinal = document.getElementById('btnEnviarWhatsAppFinal');

    if (btnSucursal) btnSucursal.className = "btn btn-outline-dark w-50 py-3 fw-bold";
    if (btnDomicilio) btnDomicilio.className = "btn btn-outline-dark w-50 py-3 fw-bold";
    if (direccionContainer) direccionContainer.classList.add('d-none');
    if (inputDireccion) inputDireccion.value = "";
    if (btnEnviarFinal) btnEnviarFinal.disabled = true;
}

function selectDeliveryMethod(method) {
    selectedDeliveryMethod = method;
    const btnSucursal = document.getElementById('btnSucursal');
    const btnDomicilio = document.getElementById('btnDomicilio');
    const direccionContainer = document.getElementById('direccionContainer');
    const inputDireccion = document.getElementById('inputDireccion');

    if (method === 'sucursal') {
        btnSucursal.className = "btn btn-dark w-50 py-3 fw-bold shadow";
        btnDomicilio.className = "btn btn-outline-dark w-50 py-3 fw-bold";
        if (direccionContainer) direccionContainer.classList.add('d-none');
        if (inputDireccion) inputDireccion.value = "";
    } else if (method === 'domicilio') {
        btnDomicilio.className = "btn btn-dark w-50 py-3 fw-bold shadow";
        btnSucursal.className = "btn btn-outline-dark w-50 py-3 fw-bold";
        if (direccionContainer) direccionContainer.classList.remove('d-none');
    }
    validateModalForm();
}

function validateModalForm() {
    const btnEnviarFinal = document.getElementById('btnEnviarWhatsAppFinal');
    if (!btnEnviarFinal) return;

    if (selectedDeliveryMethod === 'sucursal') {
        btnEnviarFinal.disabled = false;
    } else if (selectedDeliveryMethod === 'domicilio') {
        const inputDireccion = document.getElementById('inputDireccion');
        btnEnviarFinal.disabled = !(inputDireccion && inputDireccion.value.trim().length > 5);
    } else {
        btnEnviarFinal.disabled = true;
    }
}

function procesarEnvioWhatsApp() {
    if (!selectedDeliveryMethod) return;

    let infoEntregaText = "";

    // Enviamos etiquetas planas cortas y específicas para que el formateador no duplique palabras
    if (selectedDeliveryMethod === 'sucursal') {
        infoEntregaText = "METODO_RECOGER";
    } else if (selectedDeliveryMethod === 'domicilio') {
        const direccion = document.getElementById('inputDireccion').value.trim();
        infoEntregaText = `METODO_DOMICILIO|${direccion}`;
    }

    const modalElement = document.getElementById('deliveryModal');
    if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
    }

    ejecutarEnvioWhatsAppFinal(infoEntregaText);
}

function toggleMetodoPago() {
    const contenedorDatos = document.getElementById('datosBancarios');
    const esTarjeta = document.getElementById('pagoTarjeta').checked;
    
    if (esTarjeta) {
        contenedorDatos.classList.remove('d-none'); 
    } else {
        contenedorDatos.classList.add('d-none');    
    }
}

function copiarClabe() {
    const clabeTexto = document.getElementById('numClabe').innerText;
    
    navigator.clipboard.writeText(clabeTexto).then(() => {
        const icono = document.getElementById('iconoCopiar');
        icono.classList.remove('bi-clipboard', 'text-muted');
        icono.classList.add('bi-clipboard-check-fill', 'text-success');
        
        setTimeout(() => {
            icono.classList.remove('bi-clipboard-check-fill', 'text-success');
            icono.classList.add('bi-clipboard', 'text-muted');
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}

function ejecutarEnvioWhatsAppFinal(datosEntrega) {
    if (cart.length === 0) {
        Swal.fire('Carrito vacío', 'Agrega productos antes de confirmar.', 'warning');
        return;
    }

    // Estructura limpia y con saltos de línea bien distribuidos
    let mensaje = "\uD83D\uDC4B *Hola Ventas Silva! Mi pedido es:*\n\n";

    // Productos con sangría limpia usando viñeta blanca
    cart.forEach(item => {
        mensaje += `\u25AB\uFE0F ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toFixed(2)})\n`;
    });

    // Total del carrito destacado
    const totalText = document.getElementById('cart-total').innerText;
    mensaje += `\n\uD83D\uDCB0 *Total:* ${totalText}\n`;

    // Procesado del método de pago
    const inputPago = document.querySelector('input[name="metodoPago"]:checked');
    const metodoPagoRaw = inputPago ? inputPago.value : 'Efectivo';
    
    let metodoPago = metodoPagoRaw.replace(/[^\x00-\x7F]/g, "").trim();
    let textoPagoFinal = (metodoPago === 'Tarjeta' || metodoPago === 'Transferencia') ? 'Transferencia' : 'Efectivo';

    mensaje += `\uD83D\uDCB3 *M\u00e9todo de Pago:* ${textoPagoFinal}\n`;

    if (textoPagoFinal === 'Transferencia') {
        mensaje += `\uD83D\uDCC4 _(Te adjunto mi comprobante de transferencia aqu\u00ed mismo)_\n`;
    }

    // Bloque de entrega maquetado con separadores estéticos profesionales
    if (datosEntrega) {
        mensaje += `\n━━━━━━━━━━━━━━━━━━━━━\n\n`;

        if (datosEntrega === "METODO_RECOGER") {
            mensaje += `\uD83C\uDFEA *M\u00e9todo de Entrega:* Recoger en Sucursal\n`;
        } else if (datosEntrega.startsWith("METODO_DOMICILIO|")) {
            const direccionCliente = datosEntrega.split("|")[1];
            mensaje += `\uD83D\uDE9A *M\u00e9todo de Entrega:* Env\u00edo a Domicilio\n`;
            mensaje += `\uD83D\uDCCD *Direcci\u00f3n:* ${direccionCliente}\n`;
        }

        mensaje += `\n━━━━━━━━━━━━━━━━━━━━━`;
    }

    // Cierre cordial
    mensaje += `\n\n\uD83D\uDE4F _\u00a1Gracias por tu atenci\u00f3n!_`;

    // Envío robusto usando URLSearchParams con la API oficial
    const numero = "523121076549";
    const baseEndpoint = "https://api.whatsapp.com/send";
    
    const params = new URLSearchParams();
    params.append("phone", numero);
    params.append("text", mensaje);

    const urlFinal = `${baseEndpoint}?${params.toString()}`;

    // Vaciar carrito de compras
    cart = [];
    localStorage.setItem('ventasSilvaCart', JSON.stringify([]));
    renderCart();

    // Lanzar pestaña a WhatsApp
    window.open(urlFinal, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    const inputDireccion = document.getElementById('inputDireccion');
    if (inputDireccion) {
        inputDireccion.addEventListener('input', validateModalForm);
    }

    const modalElement = document.getElementById('deliveryModal');
    if (modalElement) {
        modalElement.addEventListener('show.bs.modal', resetModalState);
    }
});