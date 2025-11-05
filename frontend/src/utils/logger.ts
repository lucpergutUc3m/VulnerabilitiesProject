// En producción, NUNCA mostrar nada en consola
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop = (..._args: unknown[]) => {};

export const logger = {
  log: noop,
  error: noop,
  warn: noop,
  info: noop,
  debug: noop,
  group: noop,
  groupEnd: noop,
};

export const persistentLogger = {
  error: noop,
};

export default logger;
