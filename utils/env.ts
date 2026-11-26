/**
 * Typed, single-source environment configuration.
 * Every value can be overridden from the shell or CI, e.g.
 *   BASE_URL=https://staging.example.com npx playwright test
 */
export interface EnvConfig {
  /** UI application under test */
  baseUrl: string;
  /** REST API under test */
  apiBaseUrl: string;
  /** Credentials for the API auth endpoint */
  apiUser: string;
  apiPassword: string;
  /** True when running inside a CI pipeline */
  isCI: boolean;
}

function read(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

export const env: EnvConfig = Object.freeze({
  baseUrl: read('BASE_URL', 'https://www.saucedemo.com'),
  apiBaseUrl: read('API_BASE_URL', 'https://restful-booker.herokuapp.com'),
  // Public demo credentials published by restful-booker; override via secrets for real systems.
  apiUser: read('API_USER', 'admin'),
  apiPassword: read('API_PASSWORD', 'password123'),
  isCI: !!process.env.CI,
});

/** Path where the authenticated browser state is cached between projects. */
export const STORAGE_STATE_PATH = '.auth/standard-user.json';
