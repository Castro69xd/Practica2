export const CONFIG = {
  semanaInicial: 1, // Unidad: semanas del juego.
  semanasTotales: 4, // Unidad: semanas del juego.
  incrementoSemana: 1, // Unidad: semanas.
  dineroInicial: 400, // Unidad: pesos.
  ahorroInicial: 0, // Unidad: pesos.
  montoAhorro: 20, // Unidad: pesos por acción de ahorro.
  dineroMinimoParaGanar: 0, // Unidad: pesos; el saldo final debe superarlo.
  semanaImprevisto: 2, // Unidad: semanas del juego.
  montoImprevisto: 80, // Unidad: pesos.
  descripcionImprevisto: "Se dañó la refri", // No aplica.
  gastosSemanales: [
    {
      id: "comida-s1",
      semana: 1, // Unidad: semanas del juego.
      descripcion: "Comida",
      monto: 80, // Unidad: pesos.
      obligatorio: true,
    },
    {
      id: "transporte-s1",
      semana: 1, // Unidad: semanas del juego.
      descripcion: "Transporte",
      monto: 20, // Unidad: pesos.
      obligatorio: false,
    },
    {
      id: "comida-s2",
      semana: 2, // Unidad: semanas del juego.
      descripcion: "Comida",
      monto: 50, // Unidad: pesos.
      obligatorio: true,
    },
    {
      id: "transporte-s2",
      semana: 2, // Unidad: semanas del juego.
      descripcion: "Transporte",
      monto: 20, // Unidad: pesos.
      obligatorio: false,
    },
    {
      id: "comida-s3",
      semana: 3, // Unidad: semanas del juego.
      descripcion: "Comida",
      monto: 40, // Unidad: pesos.
      obligatorio: true,
    },
    {
      id: "transporte-s3",
      semana: 3, // Unidad: semanas del juego.
      descripcion: "Transporte",
      monto: 15, // Unidad: pesos.
      obligatorio: false,
    },
    {
      id: "comida-s4",
      semana: 4, // Unidad: semanas del juego.
      descripcion: "Comida",
      monto: 25, // Unidad: pesos.
      obligatorio: true,
    },
    {
      id: "transporte-s4",
      semana: 4, // Unidad: semanas del juego.
      descripcion: "Transporte",
      monto: 15, // Unidad: pesos.
      obligatorio: false,
    },
  ],
} as const;

export type EstadoGasto = "pendiente" | "pagado" | "pospuesto";

export type ResultadoPartida = "en_curso" | "victoria" | "derrota";

export interface Gasto {
  id: string;
  semana: number;
  descripcion: string;
  monto: number;
  obligatorio: boolean;
  estado: EstadoGasto;
}

export interface EstadoJuego {
  semana: number;
  dinero: number;
  ahorro: number;
  gastos: Gasto[];
  resultado: ResultadoPartida;
  avisoImprevisto: string | null;
}

export function crearEstadoInicial(): EstadoJuego {
  return {
    semana: CONFIG.semanaInicial,
    dinero: CONFIG.dineroInicial,
    ahorro: CONFIG.ahorroInicial,
    gastos: CONFIG.gastosSemanales.map((gasto) => ({
      ...gasto,
      estado: "pendiente",
    })),
    resultado: "en_curso",
    avisoImprevisto: null,
  };
}

export function obtenerGastosDeSemana(estado: EstadoJuego): Gasto[] {
  return estado.gastos
    .filter((gasto) => gasto.semana === estado.semana)
    .map((gasto) => ({ ...gasto }));
}

export function pagarGasto(estado: EstadoJuego, idGasto: string): boolean {
  if (estado.resultado !== "en_curso") {
    return false;
  }

  const gasto = estado.gastos.find(
    (elemento) =>
      elemento.id === idGasto &&
      elemento.semana === estado.semana &&
      elemento.estado !== "pagado",
  );

  if (!gasto) {
    return false;
  }

  estado.dinero -= gasto.monto;
  gasto.estado = "pagado";

  if (estado.dinero < CONFIG.dineroMinimoParaGanar) {
    estado.resultado = "derrota";
  }

  return true;
}

export function ahorrar(estado: EstadoJuego): boolean {
  if (
    estado.resultado !== "en_curso" ||
    estado.dinero < CONFIG.montoAhorro
  ) {
    return false;
  }

  estado.dinero -= CONFIG.montoAhorro;
  estado.ahorro += CONFIG.montoAhorro;
  return true;
}

export function posponerGasto(
  estado: EstadoJuego,
  idGasto: string,
): boolean {
  if (estado.resultado !== "en_curso") {
    return false;
  }

  const gasto = estado.gastos.find(
    (elemento) =>
      elemento.id === idGasto &&
      elemento.semana === estado.semana &&
      elemento.estado !== "pagado",
  );

  if (
    !gasto ||
    gasto.obligatorio ||
    estado.semana >= CONFIG.semanasTotales
  ) {
    return false;
  }

  gasto.semana += CONFIG.incrementoSemana;
  gasto.estado = "pospuesto";
  return true;
}

export function pasarSemana(estado: EstadoJuego): boolean {
  if (estado.resultado !== "en_curso") {
    return false;
  }

  const gastosSinResolver = estado.gastos.filter(
    (gasto) =>
      gasto.semana === estado.semana && gasto.estado !== "pagado",
  );

  if (gastosSinResolver.some((gasto) => gasto.obligatorio)) {
    estado.resultado = "derrota";
    return true;
  }

  if (gastosSinResolver.length > 0) {
    return false;
  }

  if (estado.semana === CONFIG.semanasTotales) {
    estado.resultado =
      estado.dinero > CONFIG.dineroMinimoParaGanar
        ? "victoria"
        : "derrota";
    return true;
  }

  estado.semana += CONFIG.incrementoSemana;
  estado.avisoImprevisto = null;

  if (estado.semana === CONFIG.semanaImprevisto) {
    estado.gastos.push({
      id: "imprevisto-refri",
      semana: CONFIG.semanaImprevisto,
      descripcion: CONFIG.descripcionImprevisto,
      monto: CONFIG.montoImprevisto,
      obligatorio: true,
      estado: "pendiente",
    });
    estado.avisoImprevisto = CONFIG.descripcionImprevisto;
  }

  return true;
}