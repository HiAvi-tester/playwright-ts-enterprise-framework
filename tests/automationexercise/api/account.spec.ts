import { test, expect } from '../../../fixtures/ae.fixture';
import { buildAeAccount } from '../../../api/AutomationExerciseClient';
import { validateUserDetailResponse } from '../../../schemas/automationexercise.schema';
import { schemaErrors } from '../../../schemas/booking.schema';

/**
 * Account lifecycle. Every test gets its own account from the `aeAccount` fixture,
 * which deletes it afterwards. Assertions target `responseCode`, never the HTTP
 * status, because this API returns HTTP 200 for everything.
 */
test.describe('Automation Exercise API: accounts', () => {
  test('createAccount returns 201 and the new user can log in @smoke', async ({ aeApi, aeAccount }) => {
    expect(aeAccount.created).toMatchObject({ httpStatus: 200, responseCode: 201, message: 'User created!' });

    const login = await aeApi.verifyLogin(aeAccount.account.email, aeAccount.account.password);
    expect(login).toMatchObject({ responseCode: 200, message: 'User exists!' });
  });

  test('verifyLogin with a wrong password reports 404 inside an HTTP 200', async ({ aeApi, aeAccount }) => {
    const result = await aeApi.verifyLogin(aeAccount.account.email, 'definitely-wrong');

    expect(result.httpStatus).toBe(200); // the quirk: transport says OK...
    expect(result).toMatchObject({ responseCode: 404, message: 'User not found!' }); // ...the body says no
  });

  test('getUserDetailByEmail matches the contract and the created data', async ({ aeApi, aeAccount }) => {
    const { account } = aeAccount;
    const result = await aeApi.getUserDetailByEmail(account.email);

    expect(result.responseCode).toBe(200);
    expect(validateUserDetailResponse(result.body), schemaErrors(validateUserDetailResponse)).toBe(true);
    expect(result.body.user).toMatchObject({
      name: account.name,
      email: account.email,
      first_name: account.firstname,
      last_name: account.lastname,
      city: account.city,
      zipcode: account.zipcode,
    });
  });

  test('updateAccount changes the stored details', async ({ aeApi, aeAccount }) => {
    const updated = { ...aeAccount.account, firstname: 'Updated', city: 'Noida', address1: '99 New Road' };

    const result = await aeApi.updateAccount(updated);
    expect(result).toMatchObject({ responseCode: 200, message: 'User updated!' });

    const detail = await aeApi.getUserDetailByEmail(updated.email);
    expect(detail.body.user).toMatchObject({ first_name: 'Updated', city: 'Noida', address1: '99 New Road' });
  });

  test('deleteAccount removes the user', async ({ aeApi, aeAccount }) => {
    const { email, password } = aeAccount.account;

    const result = await aeApi.deleteAccount(email, password);
    expect(result).toMatchObject({ responseCode: 200, message: 'Account deleted!' });

    const detail = await aeApi.getUserDetailByEmail(email);
    expect(detail.responseCode).toBe(404);
    expect(await aeApi.verifyLogin(email, password)).toMatchObject({ responseCode: 404 });
  });

  test('createAccount rejects a duplicate email', async ({ aeApi, aeAccount }) => {
    const duplicate = buildAeAccount({ email: aeAccount.account.email });

    const result = await aeApi.createAccount(duplicate);

    expect(result).toMatchObject({ responseCode: 400, message: 'Email already exists!' });
  });
});
