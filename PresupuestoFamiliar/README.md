# Fin de Mes

## 1. Nombre y frase

**Fin de Mes** es un juego donde administras el dinero de una familia durante 4 semanas y tratas de llegar a fin de mes sin quedarte en cero.

## 2. Qué hace y cómo se usa

Administra el presupuesto familiar pagando comida y otros gastos durante cuatro semanas.
Decide cuánto ahorrar y qué compras o salidas opcionales omitir; los imprevistos se generan con una semilla reproducible.
Usa los botones o las teclas `1`, `2`, `3` y `Enter`; al terminar, puedes volver a una semana visitada y cambiar una decisión.

## 3. Enlace

Con el servidor local encendido, abre [http://localhost:5173/](http://localhost:5173/). Para jugar desde un celular conectado a la misma red Wi-Fi, escanea el código QR que aparece en la pantalla de inicio.

## 4. Cómo correrlo en otra máquina

Requiere Git y Node.js con npm. En una terminal, ejecuta:

```sh
git clone https://github.com/Castro69xd/Practica2.git
cd Practica2/PresupuestoFamiliar
npm install
npm run dev
```

Abre `http://localhost:5173/`. Para comprobar las pruebas y compilar la aplicación:

```sh
npm test
npm run build
```

## 5. Qué dirigí yo y qué error encontré probando

<!-- Completar este espacio: qué dirigí yo y qué error encontré probando. -->


## 6. Declaración de autoría

Usé GitHub Copilot. El código lo generó un agente de inteligencia artificial bajo mi dirección. Puedo explicar la configuración de gastos y reglas, cómo se generan los imprevistos con semilla, cómo se vuelve a una semana para cambiar una decisión, el código QR y las pruebas de Vitest.