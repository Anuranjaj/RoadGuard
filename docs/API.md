# RoadGuard API

## Base URL

Development: http://localhost:5000/api

## Authentication

All protected routes require an Authorization header:

Authorization: Bearer <token>

## Auth

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

## Vehicles

- GET /api/vehicles
- POST /api/vehicles
- PUT /api/vehicles/:id
- DELETE /api/vehicles/:id

## Services

- GET /api/services
- POST /api/services

## Service Requests

- GET /api/service-requests
- POST /api/service-requests
- GET /api/service-requests/:id
- PATCH /api/service-requests/:id/status
- POST /api/service-requests/:id/accept
- POST /api/service-requests/:id/cancel

## Partners

- GET /api/partners
- GET /api/partners/nearby

## Notifications

- GET /api/notifications
- PATCH /api/notifications/:id/read
- PATCH /api/notifications/read-all

## Complaints

- GET /api/complaints
- POST /api/complaints
- PATCH /api/complaints/:id

## Ratings

- POST /api/ratings
- GET /api/ratings

## Admin

- GET /api/admin/metrics
- GET /api/admin/users
