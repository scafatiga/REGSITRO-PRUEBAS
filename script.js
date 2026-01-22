document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.getElementById("formulario");
  const fecha = document.getElementById("fecha");
  const nombre = document.getElementById("nombre");
  const puntoVenta = document.getElementById("puntoVenta");
  const ventaEfectivo = document.getElementById("ventaEfectivo");
  const ventaTarjeta = document.getElementById("ventaTarjeta");
  const gastos = document.getElementById("gastos");
  const total = document.getElementById("total");
  const observaciones = document.getElementById("observaciones");
  const btnGuardar = document.getElementById("btnGuardar");
  const mensaje = document.getElementById("mensaje");

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbz9TAKS1F5tGwmn-ptYH8uTNeWXG3k1OKkHDoD2cAunNwbI4Mg0GAv3JEyPP3kUe0zNLg/exec";

  // Convierte string con coma/punto en número
  function parseEuro(valor) {
    return parseFloat(valor.replace(",", ".")) || 0;
  }

  // Calcula Total = Efectivo + Tarjeta
  function actualizarTotal() {
    const efectivo = parseEuro(ventaEfectivo.value);
    const tarjeta = parseEuro(ventaTarjeta.value);
    const suma = efectivo + tarjeta;

    total.value = suma > 0 ? suma.toFixed(2).replace(".", ",") : "";
    validarFormulario();
  }

  // Habilita botón solo si campos obligatorios están completos
  function validarFormulario() {
    const efectivo = parseEuro(ventaEfectivo.value);
    const tarjeta = parseEuro(ventaTarjeta.value);

    const obligatorio =
      fecha.value.trim() !== "" &&
      nombre.value.trim() !== "" &&
      puntoVenta.value.trim() !== "" &&
      ventaEfectivo.value.trim() !== "" &&
      ventaTarjeta.value.trim() !== "" &&
      (efectivo + tarjeta) > 0;

    btnGuardar.disabled = !obligatorio;
  }

  // Escucha cambios en campos obligatorios
  [fecha, nombre, puntoVenta, ventaEfectivo, ventaTarjeta].forEach(c => {
    c.addEventListener("input", () => {
      actualizarTotal();
      validarFormulario();
    });
    c.addEventListener("change", validarFormulario);
  });

  // Escucha cambios en gastos (no afecta total)
  gastos.addEventListener("input", () => {
    actualizarTotal();
  });

  // Envía los datos al Web App
  async function enviarDatos(data) {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.status === "success") {
        mensaje.innerHTML = "✅ Venta guardada";
        formulario.reset();
        total.value = "";

        // Bloquea botón y reactiva tras 15 segundos
        btnGuardar.textContent = "Enviado ✔";
        btnGuardar.disabled = true;

        setTimeout(() => {
          btnGuardar.textContent = "Guardar";
          validarFormulario();
        }, 2500);

      } else {
        throw new Error("Servidor rechazó datos");
      }

    } catch (error) {
      mensaje.innerHTML = "❌ Error de conexión";
      btnGuardar.disabled = false;
      btnGuardar.textContent = "Guardar";
    }
  }

  // Submit del formulario
  formulario.addEventListener("submit", e => {
    e.preventDefault();

    // Bloqueo inmediato para evitar doble envío
    btnGuardar.disabled = true;
    btnGuardar.textContent = "Enviando...";
    mensaje.innerHTML = "";

    const data = {
      fecha: fecha.value,
      nombre: nombre.value,
      puntoVenta: puntoVenta.value,
      ventaEfectivo: ventaEfectivo.value,
      ventaTarjeta: ventaTarjeta.value,
      gastos: gastos.value,
      total: total.value,
      observaciones: observaciones.value
    };

    enviarDatos(data);
  });

  // Inicializa validación
  validarFormulario();
});
