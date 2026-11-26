import { test, expect } from '../../fixtures/hrm.fixture';
import { uid } from '../../utils/unique';

/**
 * Employee lifecycle. Each test owns a unique employee: either created through the
 * UI (and tracked for cleanup) or seeded through the API by the `seededEmployee`
 * fixture. Nothing depends on records that already exist on the shared demo.
 */
test.describe('OrangeHRM PIM', () => {
  test('add a new employee through the UI @smoke', async ({ page, pimPage, hrmApi, trackEmployee }) => {
    const firstName = 'QA';
    const lastName = `Ui${uid(6)}`;
    const employeeId = uid(9);

    await pimPage.gotoAdd();
    const empNumber = await pimPage.addEmployee(firstName, lastName, employeeId);
    trackEmployee(empNumber);

    // Toast is shown on the Add page, before the full-page redirect removes it.
    await expect(pimPage.toastWith('Successfully Saved')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/empNumber/${empNumber}$`));
    await expect(pimPage.employeeNameHeader).toHaveText(`${firstName} ${lastName}`);

    // Backend check: the record really exists with the id we entered.
    const [stored] = await hrmApi.findEmployees(employeeId);
    expect(stored).toMatchObject({ empNumber, firstName, lastName, employeeId });
  });

  test('search finds an employee by unique Employee Id', async ({ pimPage, seededEmployee }) => {
    await pimPage.gotoList();
    await pimPage.searchByEmployeeId(seededEmployee.employeeId);

    await expect(pimPage.recordsFound).toHaveText('(1) Record Found');
    await expect(pimPage.rows).toHaveCount(1);
    await expect(pimPage.row(seededEmployee.employeeId)).toContainText(seededEmployee.lastName);
  });

  test('edit an employee name and persist the change', async ({ page, pimPage, hrmApi, seededEmployee }) => {
    const newLastName = `Edited${uid(6)}`;

    await pimPage.gotoPersonalDetails(seededEmployee.empNumber);
    // The form loads asynchronously; wait for the stored value before editing.
    await expect(pimPage.lastName).toHaveValue(seededEmployee.lastName);
    await pimPage.middleName.fill('Middle');
    await pimPage.lastName.fill(newLastName);
    await pimPage.saveButton.click();

    await expect(pimPage.toastWith('Successfully Updated')).toBeVisible();

    await page.reload();
    await expect(pimPage.lastName).toHaveValue(newLastName);
    await expect(pimPage.middleName).toHaveValue('Middle');
    const [stored] = await hrmApi.findEmployees(seededEmployee.employeeId);
    expect(stored).toMatchObject({ middleName: 'Middle', lastName: newLastName });
  });

  test('delete an employee from the list', async ({ pimPage, hrmApi, seededEmployee }) => {
    await pimPage.gotoList();
    await pimPage.searchByEmployeeId(seededEmployee.employeeId);
    await expect(pimPage.rows).toHaveCount(1);

    await pimPage.deleteRow(seededEmployee.employeeId);

    await expect(pimPage.toastWith('Successfully Deleted')).toBeVisible();
    await expect(pimPage.rows).toHaveCount(0);
    expect(await hrmApi.findEmployees(seededEmployee.employeeId)).toEqual([]);
  });
});
