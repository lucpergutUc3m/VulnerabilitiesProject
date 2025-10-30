interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'staging';
    debug: boolean;
    defaultLanguage: string;
  };
}

export const config: AppConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '5000'),
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Cuestioneo',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: (import.meta.env.VITE_ENVIRONMENT as 'development' | 'production' | 'staging') || 'development',
    debug: import.meta.env.VITE_DEBUG === 'true',
    defaultLanguage: import.meta.env.VITE_DEFAULT_LANGUAGE || 'en',
  },
};

// Helpers
export const isDevelopment = config.app.environment === 'development';
export const isProduction = config.app.environment === 'production';
