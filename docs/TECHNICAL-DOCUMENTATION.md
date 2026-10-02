# RoadGuard Technical Documentation

## Overview

RoadGuard is a full-stack application combining a React frontend with an Express + MongoDB backend for roadside assistance management.

## Architecture

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Real-time: Socket.IO
- Authentication: JWT + bcrypt

## Authentication

The backend issues a signed JWT containing the user id and role. Protected routes validate the token and enforce authorization based on the user role.

## KPI Calculations

- Number of service requests: count of all service requests
- Average response time: computed from timestamps where available
- Service completion rate: completed / total requests * 100
- User satisfaction rating: average rating across completed services
- Partner acceptance rate: accepted requests / eligible requests * 100

## Security

- Passwords hashed with bcrypt
- JWT secret stored in environment variables
- CORS restricted to configured frontend origin
- Rate limiting applied to the API
- Sensitive errors are not exposed in production
