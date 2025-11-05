const isDev = import.meta.env.DEV;

export const logger = {
  log: isDev ? console.log.bind(console) : () => {},
  error: isDev ? console.error.bind(console) : () => {},
  warn: isDev ? console.warn.bind(console) : () => {},
  info: isDev ? console.info.bind(console) : () => {},
  debug: isDev ? console.debug.bind(console) : () => {},
  group: isDev ? console.group.bind(console) : () => {},
  groupEnd: isDev ? console.groupEnd.bind(console) : () => {},
};

export const persistentLogger = {
  error: (message: string, ...args: unknown[]) => {
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'object') return '[Object]';
      if (typeof arg === 'string' && arg.length > 100) return arg.substring(0, 100) + '...';
      return arg;
    });
    console.error(message, ...sanitizedArgs);
  }
};

export default logger;
