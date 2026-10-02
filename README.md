# RoadGuard

RoadGuard is a roadside assistance platform with the original React UI preserved and a real Node.js + Express + MongoDB backend connected behind it.

## Stack

- Frontend: React 19 + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Real-time: Socket.IO
- Authentication: JWT + bcrypt

## Features

- Owner registration and login
- Partner and admin roles
- Vehicle management
- Service request creation and lifecycle updates
- Nearby partner discovery
- Notifications and complaint flows
- Admin metrics endpoint
- Secure JWT-protected API routes

## Local setup

### Frontend

1. npm install
2. npm run dev

### Backend

1. cd backend
2. npm install
3. Copy .env.example to .env and set the values
4. npm run dev

## Environment variables

Backend .env

- MONGODB_URI
- JWT_SECRET
- PORT
- CLIENT_URL

Frontend environment

- VITE_API_URL=http://localhost:5000/api

## Structure

- src/ — existing RoadGuard frontend
- backend/ — Express + MongoDB API
- docs/ — technical and API docs

## Notes

The original design and route structure were kept visually intact. The same UI now reads from a backend API layer instead of static mock data, while keeping the flow familiar for existing users.

How It Works

For Mechanics

About

Contact

Login

Get Assistance

Hero Section

Create a strong hero section with:

Headline:

"Roadside Assistance When You Need It Most"

Supporting text explaining that users can quickly find verified mechanics and towing partners nearby.

Primary CTA:

Get Roadside Assistance

Secondary CTA:

Become a Service Partner

Include a visually attractive vehicle/roadside-assistance illustration or image.

6. SERVICES SECTION

Display the main roadside services as attractive cards.

Services:

Breakdown Repair

Icon + short description

Towing

Icon + short description

Battery Jump-Start

Icon + short description

Flat Tire Repair

Icon + short description

Fuel Delivery

Icon + short description

Each card should have:

Icon

Service name

Description

Estimated starting price

"Request Service" button

7. HOW IT WORKS

Create a simple 4-step section:

1. Select Service

Choose the type of roadside assistance.

2. Share Location

Confirm the vehicle location.

3. Choose a Partner

Compare nearby mechanics/towing partners.

4. Track & Get Help

Track the partner until they arrive.

Use a clean visual timeline or step-based design.

8. USER AUTHENTICATION

Create polished pages for:

Login

Fields:

Email/phone

Password

Options:

Remember me

Forgot password

Login

Also provide:

Create account

Registration

Fields:

Full name

Email

Phone

Password

Confirm password

Allow the user to select:

Vehicle Owner

or

Service Partner

Create proper validation and helpful error messages.

9. VEHICLE OWNER DASHBOARD

Create a professional dashboard for vehicle owners.

Dashboard should show:

Welcome section

Example:

"Good morning, John"

"Need roadside assistance?"

Large emergency CTA:

Request Assistance

Quick Actions

Request Assistance

Add Vehicle

Service History

Invoices

My Vehicles

Display vehicle cards containing:

Vehicle image

Vehicle name

Registration number

Vehicle type

Fuel type

Last service

Edit button

Example:

Toyota Innova
KL-XX-1234

Buttons:

View

Edit

Delete

10. REQUEST ROADside ASSISTANCE FLOW

This is one of the most important parts of the application.

Create a multi-step service request flow.

Step 1 — Select Vehicle

Show the user's saved vehicles.

Allow:

- Add Vehicle

Step 2 — Select Service

Display:

Breakdown Repair

Towing

Battery Jump-Start

Flat Tire Repair

Fuel Delivery

Each service should have:

Icon

Description

Estimated price

Estimated arrival time

Step 3 — Location

Create a map-style interface.

Show:

Current location

Vehicle location marker

Address

Change location button

Use a realistic map placeholder/mock map for now.

Step 4 — Additional Information

Allow the user to provide:

Problem description

Upload vehicle/problem photos

Optional notes

Step 5 — Nearby Partners

Display nearby mechanics/towing partners.

Each partner card should show:

Profile photo

Name

Verification badge

Rating

Number of completed jobs

Distance

Estimated arrival time

Service price

Available status

Example:

Raj Auto Care ✓

⭐ 4.8

1.2 km away

Arrival: 8 min

Estimated price: ₹650

Button:

Request This Partner

Also provide sorting/filtering:

Nearest

Highest rated

Fastest arrival

Lowest price

11. SERVICE REQUEST STATUS

After requesting assistance, create a live service-status page.

Show a clear progress timeline:

Request Sent

✓

Partner Accepted

✓

Partner On The Way

Current status

Arrived

Pending

Service Started

Pending

Completed

Pending

Display:

Partner details

Vehicle details

Service type

Estimated arrival

Contact button

Call button

Chat button

Cancel request

12. REAL-TIME TRACKING UI

Create a professional tracking screen.

Main area:

Map

Show:

User vehicle location

Mechanic location

Route line

Estimated arrival

Side/bottom information card:

Your mechanic is on the way

Raj Auto Care

⭐ 4.8

ETA: 8 minutes

Distance: 1.2 km

Buttons:

Call

Chat

View Partner

Use mock map data for the frontend.

Make the tracking interface visually similar to modern ride/delivery tracking applications.

13. SERVICE HISTORY

Create a service history page.

Show completed services in cards/table.

Information:

Service ID

Date

Vehicle

Service type

Partner

Amount

Status

Statuses:

Completed
Cancelled
Pending

Allow users to click a service to view details.

14. INVOICE PAGE

Create a professional invoice view.

Include:

Invoice number

Date

Customer

Vehicle

Service provider

Service type

Service charge

Additional charges

Taxes

Total amount

Buttons:

Download Invoice

Print Invoice

For now these can use frontend/mock behavior.

15. USER PROFILE

Create a profile page.

Sections:

Personal Information

Name

Email

Phone

Profile photo

Saved Vehicles

Notification Preferences

Security

Change password

Logout

16. MECHANIC / TOWING PARTNER DASHBOARD

Create a separate professional dashboard for service partners.

Dashboard should show:

Overview

Today's Jobs

Pending Requests

Completed Jobs

Today's Earnings

Monthly Earnings

Average Rating

Incoming Requests

Each request card should display:

Customer name

Vehicle

Service type

Distance

Location

Estimated price

Requested time

Buttons:

Accept

Reject

17. PARTNER SERVICE REQUEST DETAIL

When a partner opens a request, show:

Customer information

Vehicle information

Service required

Customer location

Distance

Estimated earnings

Additional notes

Photos uploaded by customer

Buttons:

Accept Request

Reject

After accepting:

Start Navigation

Arrived

Start Service

Complete Service

18. PARTNER SERVICE PROFILE

Create a professional profile management page.

Include:

Profile photo

Business/partner name

Description

Phone

Service area

Verification status

Rating

Completed jobs

Service Offerings

Allow the partner to configure:

Breakdown Repair

Towing

Battery Jump-Start

Flat Tire Repair

Fuel Delivery

For each service:

Enable/disable

Price

Estimated service time

19. PARTNER EARNINGS

Create an earnings dashboard.

Display:

Today's earnings

Weekly earnings

Monthly earnings

Total earnings

Add a clean earnings chart.

Also show:

Recent Jobs

Date

Customer

Service

Amount

Status

20. PARTNER JOB HISTORY

Create a job-history page with:

Completed jobs

Cancelled jobs

Pending jobs

Include filters:

Date

Service type

Status

21. ADMIN DASHBOARD

Create a separate admin interface.

The admin dashboard should feel like a professional SaaS administration panel.

Overview cards

Display:

Total Users

Total Partners

Pending Verifications

Active Service Requests

Completed Services

Total Revenue

22. ADMIN USER MANAGEMENT

Create:

Users page

Table containing:

User

Email

Phone

Vehicles

Services used

Account status

Registration date

Actions:

View

Suspend

Activate

23. PARTNER VERIFICATION

Create a partner verification page.

Show:

Partner name

Profile photo

Phone

Business information

Documents

Service types

Registration date

Verification status

Statuses:

Pending

Verified

Rejected

Actions:

Verify

Reject

View Documents

24. LIVE SERVICE MONITORING

Create an admin live-service monitoring page.

Show a large map-style interface.

Display active requests with statuses:

New request

Searching for partner

Partner assigned

Partner travelling

Service started

Completed

Include a side panel showing active requests.

25. SERVICE CATEGORY MANAGEMENT

Admin should be able to manage:

Breakdown Repair

Towing

Battery Jump-Start

Flat Tire Repair

Fuel Delivery

Show:

Service name

Description

Base price

Status

Actions:

Add

Edit

Enable/Disable

Delete

26. DISPUTES & COMPLAINTS

Create an admin complaints page.

Display:

Complaint ID

User

Partner

Service

Date

Issue

Status

Statuses:

Open

Under Review

Resolved

Provide a detailed complaint view.

27. REPORTS & ANALYTICS

Create an admin analytics page.

Include charts for:

Total service requests

Completed services

Cancelled services

Revenue

Partner performance

Popular service types

Monthly growth

Use clean dashboard charts.

28. NAVIGATION

Use role-based navigation.

Vehicle Owner Navigation

Dashboard
My Vehicles
Request Assistance
Service History
Invoices
Profile
Notifications

Partner Navigation

Dashboard
Requests
Active Jobs
Job History
Services & Pricing
Earnings
Profile

Admin Navigation

Dashboard
Users
Partners
Verification
Live Services
Service Categories
Complaints
Reports
Settings

29. UI COMPONENT SYSTEM

Create reusable components such as:

Navbar

Sidebar

Buttons

Cards

Modal

Forms

Input fields

Select dropdowns

Status badges

Toast notifications

Tables

Tabs

Rating component

Service cards

Partner cards

Vehicle cards

Dashboard statistics cards

Map container

Timeline

Loading states

Empty states

Error states

Maintain a consistent design system throughout the application.

30. MOCK DATA

Create realistic mock data for:

Users
Vehicles
Mechanics
Towing partners
Service requests
Service history
Invoices
Earnings
Ratings
Notifications
Admin statistics

Use realistic Indian names, vehicle numbers, locations and prices in ₹.

Do not hard-code the same information everywhere. Create reusable mock data structures.

31. IMPORTANT UX DETAILS

Include:

Loading states

Empty states

Error states

Confirmation dialogs

Success notifications

Form validation

Hover states

Disabled states

Skeleton loading where appropriate

For emergency actions, make the CTA visually prominent but not overwhelming.

32. ACCESSIBILITY

Follow good accessibility practices:

Semantic HTML

Proper labels

Keyboard navigation

Good contrast

Accessible buttons

Form error messages

Alt text for meaningful images

33. TECHNICAL STRUCTURE

Keep the code modular and maintainable.

Use reusable components rather than creating everything inside one large page.

Organize the project logically by:

Components

Pages

Layouts

Data/mock data

Hooks

Utilities

Types/interfaces

Keep role-specific pages separated.

34. FINAL QUALITY REQUIREMENT

The final frontend should look like a real commercial roadside assistance platform.

It should be visually polished enough to demonstrate to:

Customers

Mechanics

Towing companies

Investors

Interviewers

The most important user journey is:

Login → Dashboard → Request Assistance → Select Vehicle → Select Service → Confirm Location → Compare Nearby Partners → Request Partner → Track Partner → Service Completed → Invoice → Service History

Make this complete journey feel smooth, intuitive and professional.

Do not leave major pages as blank placeholders.

Use realistic mock data and interactions so the application feels functional even without a backend.

Before implementing, analyze the entire requirement and create the application structure accordingly.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/90756d17-6c68-4adb-8a1e-be6b0eb65e65).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
