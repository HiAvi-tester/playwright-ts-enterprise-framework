import { type APIRequestContext } from '@playwright/test';

export interface HrmEmployee {
  empNumber: number;
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string | null;
}

export interface NewEmployee {
  firstName: string;
  lastName: string;
  employeeId: string;
}

const EMPLOYEES = '/web/index.php/api/v2/pim/employees';

/**
 * Client for OrangeHRM's internal REST API (the same endpoints the Vue UI calls).
 * It must be built from an authenticated context (page.request after storageState),
 * because the API relies on the browser session cookie.
 *
 * Used for fast, reliable test-data setup and cleanup; behaviour under test is
 * still exercised through the UI.
 */
export class HrmClient {
  constructor(private readonly request: APIRequestContext) {}

  async createEmployee(employee: NewEmployee): Promise<HrmEmployee> {
    const res = await this.request.post(EMPLOYEES, { data: { ...employee, middleName: '' } });
    if (!res.ok()) throw new Error(`OrangeHRM create employee failed: HTTP ${res.status()} ${await res.text()}`);
    const body = (await res.json()) as { data: HrmEmployee };
    return body.data;
  }

  /** Employees whose name or employee id matches `nameOrId`. */
  async findEmployees(nameOrId: string): Promise<HrmEmployee[]> {
    const res = await this.request.get(EMPLOYEES, { params: { nameOrId, limit: 50 } });
    if (!res.ok()) throw new Error(`OrangeHRM employee search failed: HTTP ${res.status()}`);
    const body = (await res.json()) as { data: HrmEmployee[] };
    return body.data;
  }

  /**
   * Deletes employees by empNumber. Records already removed (for example by a
   * test that deletes through the UI) are skipped, so cleanup is idempotent.
   */
  async deleteEmployees(empNumbers: number[]): Promise<void> {
    if (empNumbers.length === 0) return;
    const res = await this.request.delete(EMPLOYEES, { data: { ids: empNumbers } });
    if (!res.ok() && res.status() !== 404) {
      throw new Error(`OrangeHRM cleanup failed for ${empNumbers.join(',')}: HTTP ${res.status()} ${await res.text()}`);
    }
  }
}
