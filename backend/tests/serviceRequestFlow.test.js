import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCreateRequestPayload } from '../src/utils/serviceRequestUtils.js';
import { partnerOffersService } from '../src/utils/partnerEligibility.js';

test('owner-created requests keep the authenticated owner and do not pre-assign a partner', () => {
  const payload = {
    vehicle: 'vehicle-123',
    serviceCategory: 'breakdown-repair',
    description: 'Battery went flat',
    pickupLocation: 'MG Road, Bengaluru',
    latitude: 12.9716,
    longitude: 77.5946,
    assignedPartner: 'partner-999',
    price: 299,
  };

  const request = normalizeCreateRequestPayload(payload, { _id: 'owner-456' });

  assert.equal(request.owner.toString(), 'owner-456');
  assert.equal(request.vehicle, 'vehicle-123');
  assert.equal(request.serviceCategory, 'breakdown-repair');
  assert.equal(request.assignedPartner, undefined);
  assert.equal(request.price, undefined);
});

test('partner service matching works without a location check', () => {
  const serviceKeys = new Set(['batteryjumpstart']);
  const partner = {
    serviceCategories: ['Battery Jump Start'],
    location: undefined,
  };

  assert.equal(partnerOffersService(partner.serviceCategories, serviceKeys), true);
  assert.equal(partner.location, undefined);
});
