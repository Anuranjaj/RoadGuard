# RoadGuard Project Guidelines

This is a modern, responsive frontend for the RoadGuard roadside assistance and vehicle service platform.

## Architecture

- **Core**: React 19 + JavaScript + HTML5
- **Styling**: Tailwind CSS + CSS3
- **Routing**: React Router (`react-router-dom`)
- **State & Data**: React hooks (`useState`, `useEffect`) and centralized mock data (`src/data/mockData.js`)

## Roles & Portals

1. **Public Website**: Landing, Services, About, Contact, Login, Register
2. **Vehicle Owner**: Dashboard, Saved Vehicles, Request Service Wizard, Live Tracking, History, Profile
3. **Mechanic / Partner**: Dashboard, Incoming Requests, Active Job Console, Job History, Earnings, Profile
4. **Administrator**: Dashboard, Users, Partner KYC Verifications, Live Services Radar, Complaints, Reports
