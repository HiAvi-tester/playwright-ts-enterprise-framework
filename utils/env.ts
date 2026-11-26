/**
 * Typed, centralised environment configuration.
 *
 * Every value can be overridden through an environment variable (locally or as a
 * CI secret), and falls back to the public demo defaults so the suite runs with
 * zero setup. Tests and page objects must import from here, never read
 * `process.env` directly.
 */

function read(name: string, fallback: string): string {
  const value = process.env[name];
  return value !== undefined && value.trim() !== '' ? value.trim() : fallback;
}

function readInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer, got "${raw}"`);
  }
  return parsed;
}

export interface Credentials {
  readonly username: string;
  readonly password: string;
}

export interface EnvConfig {
  readonly isCI: boolean;
  readonly web: {
    readonly baseURL: string;
    readonly user: Credentials;
  };
  readonly api: {
    readonly baseURL: string;
    readonly admin: Credentials;
  };
  /** OrangeHRM open-source demo (shared, resets daily). */
  readonly hrm: {
    readonly baseURL: string;
    readonly admin: Credentials;
  };
  /** Automation Exercise: e-commerce UI + REST API used for API-seeded UI tests. */
  readonly ae: {
    readonly baseURL: string;
  };
  readonly workers: number | undefined;
  readonly retries: number;
}

const isCI = !!process.env.CI;

export const env: EnvConfig = Object.freeze({
  isCI,
  web: {
    baseURL: read('WEB_BASE_URL', 'https://www.saucedemo.com'),
    user: {
      username: read('SAUCE_USERNAME', 'standard_user'),
      password: read('SAUCE_PASSWORD', 'secret_sauce'),
    },
  },
  api: {
    baseURL: read('API_BASE_URL', 'https://restful-booker.herokuapp.com'),
    admin: {
      username: read('BOOKER_USERNAME', 'admin'),
      password: read('BOOKER_PASSWORD', 'password123'),
    },
  },
  hrm: {
    baseURL: read('HRM_BASE_URL', 'https://opensource-demo.orangehrmlive.com'),
    admin: {
      username: read('HRM_USERNAME', 'Admin'),
      password: read('HRM_PASSWORD', 'admin123'),
    },
  },
  ae: {
    baseURL: read('AE_BASE_URL', 'https://automationexercise.com'),
  },
  workers: process.env.WORKERS ? readInt('WORKERS', 2) : isCI ? 2 : undefined,
  retries: readInt('RETRIES', isCI ? 2 : 0),
});

/** Where the authenticated SauceDemo session is persisted by the setup project. */
export const STORAGE_STATE = '.auth/standard_user.json';

/** Where the authenticated OrangeHRM admin session is persisted by the hrm-setup project. */
export const HRM_STORAGE_STATE = '.auth/hrm_admin.json';
