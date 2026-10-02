import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedStatusTransition, sanitizeProtectedFields } from '../src/utils/security.js';

test('allows only valid service request progress transitions', () => {
  assert.equal(isAllowedStatusTransition('REQUESTED', 'PARTNER_ACCEPTED'), true);
  assert.equal(isAllowedStatusTransition('PARTNER_ACCEPTED', 'PARTNER_ARRIVING'), true);
  assert.equal(isAllowedStatusTransition('SERVICE_IN_PROGRESS', 'COMPLETED'), true);
  assert.equal(isAllowedStatusTransition('COMPLETED', 'REQUESTED'), false);
  assert.equal(isAllowedStatusTransition('CANCELLED', 'PARTNER_ACCEPTED'), false);
});

test('removes protected database and auth fields from user-controlled updates', () => {
  const payload = {
    name: 'Updated Name',
    role: 'ADMIN',
    isVerified: true,
    password: 'secret',
    balance: 100,
    earnings: 80,
    notes: 'ok',
  };

  assert.deepEqual(sanitizeProtectedFields(payload), {
    name: 'Updated Name',
    notes: 'ok',
  });
});
