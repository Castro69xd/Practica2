import { describe, expect, it } from "vitest";
import {
  ahorrar,
  CONFIG,
  crearEstadoInicial,
  obtenerGastosDeSemana,
  pagarGasto,
  pasarSemana,
  posponerGasto,
} from "../src/logica";

describe("reglas de Fin de Mes", () => {
  it("arma el estado inicial con el saldo y los gastos pendientes esperados", () => {
    const estado = crearEstadoInicial();

    expect(estado.semana).toBe(CONFIG.semanaInicial);
    expect(estado.dinero).toBe(CONFIG.dineroInicial);
    expect(estado.ahorro).toBe(CONFIG.ahorroInicial);
    expect(estado.resultado).toBe("en_curso");
    expect(estado.avisoImprevisto).toBeNull();
    expect(estado.gastos).toHaveLength(CONFIG.gastosSemanales.length);
    expect(estado.gastos.every((gasto) => gasto.estado === "pendiente")).toBe(
      true,
    );
    expect(obtenerGastosDeSemana(estado).map((gasto) => gasto.id)).toEqual([
      "comida-s1",
      "transporte-s1",
    ]);
  });

  it("paga un gasto de la semana y descuenta su monto", () => {
    const estado = crearEstadoInicial();

    expect(pagarGasto(estado, "comida-s1")).toBe(true);
    expect(estado.dinero).toBe(CONFIG.dineroInicial - 80);
    expect(estado.gastos.find((gasto) => gasto.id === "comida-s1")?.estado).toBe(
      "pagado",
    );
  });

  it("rechaza pagar un gasto inexistente, de otra semana o ya pagado", () => {
    const estado = crearEstadoInicial();

    expect(pagarGasto(estado, "no-existe")).toBe(false);
    expect(pagarGasto(estado, "comida-s2")).toBe(false);
    expect(pagarGasto(estado, "comida-s1")).toBe(true);
    expect(pagarGasto(estado, "comida-s1")).toBe(false);
  });

  it("ahorra el monto configurado y lo suma al fondo reservado", () => {
    const estado = crearEstadoInicial();

    expect(ahorrar(estado)).toBe(true);
    expect(estado.dinero).toBe(CONFIG.dineroInicial - CONFIG.montoAhorro);
    expect(estado.ahorro).toBe(CONFIG.ahorroInicial + CONFIG.montoAhorro);
  });

  it("rechaza ahorrar cuando el dinero disponible no alcanza", () => {
    const estado = crearEstadoInicial();
    estado.dinero = CONFIG.montoAhorro - 1;

    expect(ahorrar(estado)).toBe(false);
    expect(estado.dinero).toBe(CONFIG.montoAhorro - 1);
    expect(estado.ahorro).toBe(CONFIG.ahorroInicial);
  });

  it("pospone un gasto no obligatorio para la semana siguiente", () => {
    const estado = crearEstadoInicial();

    expect(posponerGasto(estado, "transporte-s1")).toBe(true);
    expect(estado.gastos.find((gasto) => gasto.id === "transporte-s1")).toMatchObject({
      semana: CONFIG.semanaInicial + CONFIG.incrementoSemana,
      estado: "pospuesto",
    });
  });

  it("impide posponer un gasto obligatorio o uno de la última semana", () => {
    const estado = crearEstadoInicial();

    expect(posponerGasto(estado, "comida-s1")).toBe(false);
    estado.semana = CONFIG.semanasTotales;
    estado.gastos.push({
      id: "transporte-final",
      semana: CONFIG.semanasTotales,
      descripcion: "Transporte",
      monto: 10,
      obligatorio: false,
      estado: "pendiente",
    });

    expect(posponerGasto(estado, "transporte-final")).toBe(false);
  });

  it("solo avanza si los gastos de la semana están resueltos", () => {
    const estado = crearEstadoInicial();

    expect(pagarGasto(estado, "comida-s1")).toBe(true);
    expect(pasarSemana(estado)).toBe(false);
    expect(estado.semana).toBe(CONFIG.semanaInicial);

    expect(pagarGasto(estado, "transporte-s1")).toBe(true);
    expect(pasarSemana(estado)).toBe(true);
    expect(estado.semana).toBe(CONFIG.semanaInicial + CONFIG.incrementoSemana);
    expect(estado.avisoImprevisto).toBe(CONFIG.descripcionImprevisto);
  });

  it("termina mal si no se paga un gasto obligatorio o el saldo cae bajo cero", () => {
    const estadoSinComida = crearEstadoInicial();
    expect(pasarSemana(estadoSinComida)).toBe(true);
    expect(estadoSinComida.resultado).toBe("derrota");

    const estadoSinFondos = crearEstadoInicial();
    estadoSinFondos.dinero = 1;
    expect(pagarGasto(estadoSinFondos, "comida-s1")).toBe(true);
    expect(estadoSinFondos.dinero).toBeLessThan(CONFIG.dineroMinimoParaGanar);
    expect(estadoSinFondos.resultado).toBe("derrota");
  });

  it("termina mal en la semana final si el dinero no es positivo", () => {
    const estado = crearEstadoInicial();
    estado.semana = CONFIG.semanasTotales;
    estado.dinero = CONFIG.dineroMinimoParaGanar;
    estado.gastos = estado.gastos.filter(
      (gasto) => gasto.semana !== CONFIG.semanasTotales,
    );

    expect(pasarSemana(estado)).toBe(true);
    expect(estado.resultado).toBe("derrota");
  });

  it("permite completar las cuatro semanas y ganar con dinero y ahorro", () => {
    const estado = crearEstadoInicial();

    expect(pagarGasto(estado, "comida-s1")).toBe(true);
    expect(pagarGasto(estado, "transporte-s1")).toBe(true);
    expect(ahorrar(estado)).toBe(true);
    expect(pasarSemana(estado)).toBe(true);

    expect(pagarGasto(estado, "comida-s2")).toBe(true);
    expect(pagarGasto(estado, "transporte-s2")).toBe(true);
    expect(pagarGasto(estado, "imprevisto-refri")).toBe(true);
    expect(pasarSemana(estado)).toBe(true);

    expect(pagarGasto(estado, "comida-s3")).toBe(true);
    expect(pagarGasto(estado, "transporte-s3")).toBe(true);
    expect(pasarSemana(estado)).toBe(true);

    expect(pagarGasto(estado, "comida-s4")).toBe(true);
    expect(pagarGasto(estado, "transporte-s4")).toBe(true);
    expect(estado.dinero).toBe(35);
    expect(estado.ahorro).toBe(CONFIG.montoAhorro);
    expect(pasarSemana(estado)).toBe(true);
    expect(estado.resultado).toBe("victoria");
  });
});