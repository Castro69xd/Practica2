import {
  ahorrar,
  CONFIG,
  crearEstadoInicial,
  obtenerGastosDeSemana,
  pagarGasto,
  pasarSemana,
  posponerGasto,
  type EstadoJuego,
  type Gasto,
} from "./logica";
import "./estilo.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("No se encontró el contenedor de la aplicación.");
}

let estado: EstadoJuego | null = null;
let gastoSeleccionado: string | null = null;
let mensaje = "";

function mostrarDinero(monto: number): string {
  return `$${new Intl.NumberFormat("es").format(monto)}`;
}

function dibujarInicio(): string {
  return `
    <main class="pantalla pantalla-inicio">
      <header class="barra-superior">
        <span class="marca">Fin de Mes</span>
        <span class="etiqueta">Presupuesto familiar</span>
      </header>
      <section class="portada" aria-labelledby="titulo-inicio">
        <p class="sobrelinea">Un mes · cuatro semanas</p>
        <h1 id="titulo-inicio">Que el sueldo<br />llegue al final.</h1>
        <p class="introduccion">
          Empezás con <strong class="dinero-texto">${mostrarDinero(CONFIG.dineroInicial)}</strong>.
          Pagá lo necesario, reservá algo para emergencias y cuidá cada semana.
        </p>
        <button class="boton boton-principal" data-action="iniciar" type="button">
          Empezar la semana ${CONFIG.semanaInicial}
        </button>
      </section>
      <footer class="pie-inicio">
        <span>Comida primero.</span>
        <span>El imprevisto no avisa.</span>
        <span>Terminá con dinero positivo.</span>
      </footer>
    </main>
  `;
}

function dibujarGasto(gasto: Gasto): string {
  const seleccionado = gasto.id === gastoSeleccionado;
  const estadoGasto =
    gasto.estado === "pagado"
      ? "Pagado"
      : gasto.estado === "pospuesto"
        ? "Pospuesto"
        : gasto.obligatorio
          ? "Obligatorio"
          : "Pendiente";

  const controles =
    gasto.estado === "pagado"
      ? ""
      : `
        <div class="acciones-gasto">
          <button
            class="boton boton-secundario"
            data-action="seleccionar"
            data-gasto="${gasto.id}"
            aria-pressed="${seleccionado}"
            type="button"
          >
            ${seleccionado ? "Seleccionado" : "Elegir"}
          </button>
          <button
            class="boton boton-pagar"
            data-action="pagar"
            data-gasto="${gasto.id}"
            type="button"
          >
            Pagar ${mostrarDinero(gasto.monto)}
          </button>
          <button
            class="boton boton-posponer"
            data-action="posponer"
            data-gasto="${gasto.id}"
            type="button"
          >
            Posponer
          </button>
        </div>
      `;

  return `
    <li class="fila-gasto ${seleccionado ? "fila-seleccionada" : ""}">
      <div class="detalle-gasto">
        <span class="nombre-gasto">${gasto.descripcion}</span>
        <span class="estado-gasto ${gasto.estado === "pagado" ? "estado-pagado" : ""}">
          ${estadoGasto}
        </span>
      </div>
      <span class="monto-gasto">${mostrarDinero(gasto.monto)}</span>
      ${controles}
    </li>
  `;
}

function dibujarPartida(partida: EstadoJuego): string {
  const gastos = obtenerGastosDeSemana(partida);

  return `
    <main class="pantalla pantalla-partida">
      <header class="barra-superior">
        <span class="marca">Fin de Mes</span>
        <span class="semana-actual">Semana ${partida.semana}<span> / ${CONFIG.semanasTotales}</span></span>
      </header>

      <section class="resumen" aria-label="Resumen del presupuesto">
        <div class="dato-principal">
          <span class="etiqueta-dato">Dinero disponible</span>
          <strong class="valor-dinero">${mostrarDinero(partida.dinero)}</strong>
        </div>
        <div class="dato-ahorro">
          <span class="etiqueta-dato">Fondo de emergencia</span>
          <strong class="valor-ahorro">${mostrarDinero(partida.ahorro)}</strong>
        </div>
      </section>

      ${partida.avisoImprevisto ? `
        <aside class="aviso-imprevisto" role="status">
          <span class="marca-aviso">Imprevisto</span>
          <strong>${partida.avisoImprevisto}</strong>
          <span>-${mostrarDinero(CONFIG.montoImprevisto)}</span>
        </aside>
      ` : ""}

      <section class="seccion-gastos" aria-labelledby="titulo-gastos">
        <div class="encabezado-seccion">
          <div>
            <p class="sobrelinea">Semana ${partida.semana}</p>
            <h1 id="titulo-gastos">Gastos de esta semana</h1>
          </div>
          <span class="cantidad-gastos">${gastos.length} en lista</span>
        </div>
        <ul class="lista-gastos">
          ${gastos.map(dibujarGasto).join("")}
        </ul>
      </section>

      <section class="panel-acciones" aria-label="Acciones">
        <div class="acciones-principales">
          <button class="boton boton-ahorrar" data-action="ahorrar" type="button">
            Ahorrar ${mostrarDinero(CONFIG.montoAhorro)}
          </button>
          <button class="boton boton-siguiente" data-action="avanzar" type="button">
            Siguiente semana <span aria-hidden="true">→</span>
          </button>
        </div>
        <p class="ayuda-teclado">Teclas: 1 pagar · 2 ahorrar · 3 posponer · Enter avanzar</p>
      </section>

      <p class="mensaje" aria-live="polite">${mensaje}</p>
    </main>
  `;
}

function dibujarFinal(partida: EstadoJuego): string {
  const gano = partida.resultado === "victoria";

  return `
    <main class="pantalla pantalla-final ${gano ? "final-victoria" : "final-derrota"}">
      <header class="barra-superior">
        <span class="marca">Fin de Mes</span>
        <span class="etiqueta">Semana ${partida.semana} / ${CONFIG.semanasTotales}</span>
      </header>
      <section class="resultado" aria-labelledby="titulo-final">
        <p class="sobrelinea">${gano ? "Mes terminado" : "Presupuesto agotado"}</p>
        <h1 id="titulo-final">${gano ? "Llegaste a fin de mes." : "Esta vez no alcanzó."}</h1>
        <p class="introduccion">
          ${gano
            ? "Terminaste el mes con dinero disponible. Buen trabajo cuidando el presupuesto."
            : "La partida terminó antes de poder cerrar el presupuesto del mes."}
        </p>
        <dl class="resultado-cifras">
          <div>
            <dt>Dinero disponible</dt>
            <dd class="${gano ? "dinero-texto" : "gasto-texto"}">${mostrarDinero(partida.dinero)}</dd>
          </div>
          <div>
            <dt>Ahorro</dt>
            <dd class="dinero-texto">${mostrarDinero(partida.ahorro)}</dd>
          </div>
        </dl>
        <button class="boton boton-principal" data-action="reiniciar" type="button">
          Jugar otra vez
        </button>
      </section>
    </main>
  `;
}

function dibujar(): void {
  if (!estado) {
    app.innerHTML = dibujarInicio();
    return;
  }

  app.innerHTML =
    estado.resultado === "en_curso"
      ? dibujarPartida(estado)
      : dibujarFinal(estado);
}

function ejecutarAccion(accion: string, idGasto = ""): void {
  if (accion === "iniciar" || accion === "reiniciar") {
    estado = crearEstadoInicial();
    gastoSeleccionado = null;
    mensaje = "";
    dibujar();
    return;
  }

  if (!estado) {
    return;
  }

  if (accion === "seleccionar") {
    gastoSeleccionado = idGasto;
    mensaje = "";
    dibujar();
    return;
  }

  let accionValida = false;

  if (accion === "pagar") {
    accionValida = pagarGasto(estado, idGasto);
  } else if (accion === "ahorrar") {
    accionValida = ahorrar(estado);
  } else if (accion === "posponer") {
    accionValida = posponerGasto(estado, idGasto);
  } else if (accion === "avanzar") {
    accionValida = pasarSemana(estado);
  }

  mensaje = accionValida ? "" : "No se pudo hacer esa acción.";
  if (accionValida && (accion === "pagar" || accion === "posponer")) {
    gastoSeleccionado = null;
  }
  if (accion === "avanzar" && accionValida) {
    gastoSeleccionado = null;
  }

  dibujar();
}

app.addEventListener("click", (evento: MouseEvent) => {
  if (!(evento.target instanceof Element)) {
    return;
  }

  const boton = evento.target.closest<HTMLButtonElement>("button[data-action]");
  if (!boton) {
    return;
  }

  ejecutarAccion(boton.dataset.action ?? "", boton.dataset.gasto ?? "");
});

document.addEventListener("keydown", (evento: KeyboardEvent) => {
  if (evento.repeat || evento.altKey || evento.ctrlKey || evento.metaKey) {
    return;
  }

  if (evento.key === "1") {
    ejecutarAccion("pagar", gastoSeleccionado ?? "");
  } else if (evento.key === "2") {
    ejecutarAccion("ahorrar");
  } else if (evento.key === "3") {
    ejecutarAccion("posponer", gastoSeleccionado ?? "");
  } else if (evento.key === "Enter") {
    ejecutarAccion("avanzar");
  }
});

dibujar();