import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLoginIdentifier } from '../src/controllers/authController.js';

test('supports both email and identifier login payloads', () => {
  assert.equal(resolveLoginIdentifier({ email: ' admin@roadguard.com ' }), 'admin@roadguard.com');
  assert.equal(resolveLoginIdentifier({ identifier: 'admin@roadguard.com' }), 'admin@roadguard.com');
  assert.equal(resolveLoginIdentifier({ identifier: '+919876543210' }), '+919876543210');
});
