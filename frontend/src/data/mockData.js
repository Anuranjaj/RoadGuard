/**
 * Mock data for RoadGuard platform
 * Contains seed data for vehicles, partners, services, requests, complaints, invoices, and analytics.
 */

export { inr } from "@/utils/helpers";

export const serviceCategories = [
  {
    id: "breakdown",
    name: "Breakdown Repair",
    description: "On-spot diagnosis and repair by a certified mechanic.",
    icon: "Wrench",
    basePrice: 499,
    etaMinutes: 15,
    active: true,
  },
  {
    id: "towing",
    name: "Towing",
    description: "Flatbed or lift towing to the nearest trusted garage.",
    icon: "Truck",
    basePrice: 1200,
    etaMinutes: 25,
    active: true,
  },
  {
    id: "battery",
    name: "Battery Jump-Start",
    description: "Dead battery? We jump-start or replace it on the spot.",
    icon: "BatteryCharging",
    basePrice: 349,
    etaMinutes: 12,
    active: true,
  },
  {
    id: "tyre",
    name: "Flat Tire Repair",
    description: "Puncture repair or spare wheel fitting wherever you are.",
    icon: "Disc3",
    basePrice: 399,
    etaMinutes: 14,
    active: true,
  },
  {
    id: "fuel",
    name: "Fuel Delivery",
    description: "Petrol, diesel or CNG delivered straight to your vehicle.",
    icon: "Fuel",
    basePrice: 299,
    etaMinutes: 18,
    active: true,
  },
];

export const serviceById = (id) =>
  serviceCategories.find((s) => s.id === id) ?? serviceCategories[0];

export const serviceName = (id) => serviceById(id).name;

export const currentUser = {
  id: "USR-1042",
  name: "Arjun Menon",
  email: "arjun.menon@gmail.com",
  phone: "+91 98470 21145",
  role: "owner",
  avatar: "AM",
};

export const vehicles = [
  {
    id: "VEH-01",
    name: "Toyota Innova Crysta",
    registration: "KL-07-BX-1234",
    type: "SUV",
    fuel: "Diesel",
    lastService: "12 Aug 2026",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=70",
    color: "Pearl White",
  },
  {
    id: "VEH-02",
    name: "Maruti Swift VXi",
    registration: "KL-01-CA-8890",
    type: "Car",
    fuel: "Petrol",
    lastService: "03 Jun 2026",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=70",
    color: "Fire Red",
  },
  {
    id: "VEH-03",
    name: "Royal Enfield Classic 350",
    registration: "KL-11-AR-4520",
    type: "Bike",
    fuel: "Petrol",
    lastService: "28 Jul 2026",
    image:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=70",
    color: "Stealth Black",
  },
];

export const partners = [
  {
    id: "PTR-101",
    name: "Raj Auto Care",
    owner: "Rajesh Nair",
    photo: "RA",
    verified: true,
    rating: 4.8,
    reviews: 412,
    jobs: 1284,
    distanceKm: 1.2,
    etaMinutes: 8,
    price: 650,
    available: true,
    phone: "+91 98956 11220",
    area: "Kakkanad, Kochi",
    description:
      "Multi-brand roadside repair unit with 12 years of on-road experience. Specialists in engine and electrical breakdowns.",
    services: ["breakdown", "battery", "tyre"],
    joined: "14 Mar 2024",
    status: "verified",
    documents: [
      { name: "Aadhaar Card", status: "uploaded" },
      { name: "Shop License", status: "uploaded" },
      { name: "GST Certificate", status: "uploaded" },
    ],
  },
  {
    id: "PTR-102",
    name: "Sreekumar Towing Service",
    owner: "Sreekumar P",
    photo: "ST",
    verified: true,
    rating: 4.6,
    reviews: 288,
    jobs: 902,
    distanceKm: 2.4,
    etaMinutes: 13,
    price: 1150,
    available: true,
    phone: "+91 90372 44518",
    area: "Edappally, Kochi",
    description: "24x7 flatbed and lift towing for cars, SUVs and light commercial vehicles.",
    services: ["towing", "breakdown"],
    joined: "02 Jan 2025",
    status: "verified",
    documents: [
      { name: "Aadhaar Card", status: "uploaded" },
      { name: "Tow Vehicle RC", status: "uploaded" },
      { name: "Insurance", status: "uploaded" },
    ],
  },
  {
    id: "PTR-103",
    name: "Ansari Mobile Mechanics",
    owner: "Imran Ansari",
    photo: "AM",
    verified: true,
    rating: 4.9,
    reviews: 531,
    jobs: 1640,
    distanceKm: 3.1,
    etaMinutes: 16,
    price: 580,
    available: true,
    phone: "+91 97445 90031",
    area: "Palarivattom, Kochi",
    description:
      "Highest rated mobile mechanic team in the city. Quick battery and tyre assistance.",
    services: ["battery", "tyre", "fuel", "breakdown"],
    joined: "21 Sep 2023",
    status: "verified",
    documents: [
      { name: "Aadhaar Card", status: "uploaded" },
      { name: "Shop License", status: "uploaded" },
    ],
  },
  {
    id: "PTR-104",
    name: "Deepak Fuel Express",
    owner: "Deepak Verma",
    photo: "DF",
    verified: false,
    rating: 4.3,
    reviews: 94,
    jobs: 210,
    distanceKm: 4.6,
    etaMinutes: 22,
    price: 420,
    available: false,
    phone: "+91 88915 66042",
    area: "Vyttila, Kochi",
    description: "Emergency fuel delivery partner covering the eastern corridor of the city.",
    services: ["fuel"],
    joined: "08 Sep 2026",
    status: "pending",
    documents: [
      { name: "Aadhaar Card", status: "uploaded" },
      { name: "Fuel Handling Permit", status: "missing" },
    ],
  },
  {
    id: "PTR-105",
    name: "Nandhini Motors",
    owner: "Nandhini Rajan",
    photo: "NM",
    verified: false,
    rating: 4.1,
    reviews: 47,
    jobs: 118,
    distanceKm: 5.8,
    etaMinutes: 26,
    price: 520,
    available: true,
    phone: "+91 96334 20907",
    area: "Aluva, Kochi",
    description: "Family-run garage expanding into on-road assistance services.",
    services: ["breakdown", "tyre"],
    joined: "19 Sep 2026",
    status: "pending",
    documents: [
      { name: "Aadhaar Card", status: "uploaded" },
      { name: "Shop License", status: "missing" },
    ],
  },
];

export const currentPartner = partners[0];

export const incomingRequests = [
  {
    id: "REQ-88421",
    customer: "Arjun Menon",
    phone: "+91 98470 21145",
    vehicle: "Toyota Innova Crysta",
    registration: "KL-07-BX-1234",
    service: "breakdown",
    status: "new",
    distanceKm: 1.2,
    location: "NH-66 Service Road, Kakkanad",
    price: 650,
    requestedAt: "2 min ago",
    notes: "Engine overheating, white smoke from the bonnet. Car parked on the shoulder.",
    photos: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=70",
    ],
  },
  {
    id: "REQ-88419",
    customer: "Priya Sankar",
    phone: "+91 99610 33471",
    vehicle: "Hyundai i20",
    registration: "KL-05-AT-7781",
    service: "battery",
    status: "new",
    distanceKm: 2.8,
    location: "Infopark Phase 1, Gate 2",
    price: 380,
    requestedAt: "9 min ago",
    notes: "Car won't crank after office hours.",
  },
  {
    id: "REQ-88414",
    customer: "Vishnu Prasad",
    phone: "+91 94470 51120",
    vehicle: "Mahindra Thar",
    registration: "KL-10-BB-2299",
    service: "tyre",
    status: "new",
    distanceKm: 4.1,
    location: "Seaport-Airport Road, Thrikkakara",
    price: 450,
    requestedAt: "18 min ago",
  },
];

export const activeRequests = [
  {
    id: "REQ-88405",
    customer: "Meera Krishnan",
    phone: "+91 90745 88123",
    vehicle: "Honda City",
    registration: "KL-07-CC-4412",
    service: "towing",
    status: "travelling",
    distanceKm: 3.4,
    location: "Palarivattom Bypass Junction",
    price: 1250,
    requestedAt: "Today, 10:12 AM",
    partnerId: "PTR-102",
  },
  {
    id: "REQ-88398",
    customer: "Sabu Thomas",
    phone: "+91 98951 77340",
    vehicle: "Tata Nexon EV",
    registration: "KL-08-AX-9021",
    service: "breakdown",
    status: "started",
    distanceKm: 0.8,
    location: "Panampilly Nagar, 4th Cross",
    price: 720,
    requestedAt: "Today, 09:41 AM",
    partnerId: "PTR-101",
  },
  {
    id: "REQ-88392",
    customer: "Fathima Rasheed",
    phone: "+91 97469 12088",
    vehicle: "Kia Seltos",
    registration: "KL-02-BN-6650",
    service: "fuel",
    status: "searching",
    distanceKm: 6.2,
    location: "Aroor Toll Plaza",
    price: 340,
    requestedAt: "Today, 11:03 AM",
  },
  {
    id: "REQ-88387",
    customer: "Anand Pillai",
    phone: "+91 99952 40011",
    vehicle: "Maruti Baleno",
    registration: "KL-11-CD-1187",
    service: "battery",
    status: "assigned",
    distanceKm: 2.1,
    location: "Kaloor Stadium Road",
    price: 390,
    requestedAt: "Today, 11:20 AM",
    partnerId: "PTR-103",
  },
];

export const ownerHistory = [
  {
    id: "SRV-77120",
    date: "18 Sep 2026",
    vehicle: "Toyota Innova Crysta",
    service: "breakdown",
    partner: "Raj Auto Care",
    amount: 650,
    status: "Completed",
  },
  {
    id: "SRV-76884",
    date: "02 Sep 2026",
    vehicle: "Maruti Swift VXi",
    service: "battery",
    partner: "Ansari Mobile Mechanics",
    amount: 380,
    status: "Completed",
  },
  {
    id: "SRV-76551",
    date: "21 Aug 2026",
    vehicle: "Royal Enfield Classic 350",
    service: "tyre",
    partner: "Nandhini Motors",
    amount: 320,
    status: "Cancelled",
  },
  {
    id: "SRV-76210",
    date: "09 Aug 2026",
    vehicle: "Toyota Innova Crysta",
    service: "towing",
    partner: "Sreekumar Towing Service",
    amount: 1450,
    status: "Completed",
  },
  {
    id: "SRV-75902",
    date: "27 Jul 2026",
    vehicle: "Maruti Swift VXi",
    service: "fuel",
    partner: "Deepak Fuel Express",
    amount: 340,
    status: "Completed",
  },
  {
    id: "SRV-75640",
    date: "14 Jul 2026",
    vehicle: "Toyota Innova Crysta",
    service: "breakdown",
    partner: "Raj Auto Care",
    amount: 890,
    status: "Pending",
  },
];

export const invoices = [
  {
    id: "INV-2026-0912",
    date: "18 Sep 2026",
    customer: "Arjun Menon",
    customerAddress: "42/B Skyline Residency, Kakkanad, Kochi 682030",
    vehicle: "Toyota Innova Crysta — KL-07-BX-1234",
    partner: "Raj Auto Care",
    service: "breakdown",
    serviceCharge: 650,
    additional: [
      { label: "Coolant top-up", amount: 180 },
      { label: "Night visit charge", amount: 100 },
    ],
    taxRate: 18,
    status: "Paid",
  },
  {
    id: "INV-2026-0874",
    date: "02 Sep 2026",
    customer: "Arjun Menon",
    customerAddress: "42/B Skyline Residency, Kakkanad, Kochi 682030",
    vehicle: "Maruti Swift VXi — KL-01-CA-8890",
    partner: "Ansari Mobile Mechanics",
    service: "battery",
    serviceCharge: 380,
    additional: [{ label: "Terminal cleaning", amount: 60 }],
    taxRate: 18,
    status: "Paid",
  },
  {
    id: "INV-2026-0790",
    date: "09 Aug 2026",
    customer: "Arjun Menon",
    customerAddress: "42/B Skyline Residency, Kakkanad, Kochi 682030",
    vehicle: "Toyota Innova Crysta — KL-07-BX-1234",
    partner: "Sreekumar Towing Service",
    service: "towing",
    serviceCharge: 1450,
    additional: [{ label: "Extra distance (8 km)", amount: 240 }],
    taxRate: 18,
    status: "Due",
  },
];

export const invoiceTotal = (inv) => {
  const extras = (inv.additional || []).reduce((s, a) => s + a.amount, 0);
  const subtotal = inv.serviceCharge + extras;
  const tax = Math.round((subtotal * (inv.taxRate || 18)) / 100);
  return { extras, subtotal, tax, total: subtotal + tax };
};

export const partnerJobs = [
  {
    id: "JOB-5521",
    date: "22 Sep 2026",
    vehicle: "Honda City",
    service: "towing",
    partner: "Meera Krishnan",
    amount: 1250,
    status: "Pending",
  },
  {
    id: "JOB-5518",
    date: "21 Sep 2026",
    vehicle: "Tata Nexon EV",
    service: "breakdown",
    partner: "Sabu Thomas",
    amount: 720,
    status: "Completed",
  },
  {
    id: "JOB-5510",
    date: "20 Sep 2026",
    vehicle: "Hyundai Creta",
    service: "battery",
    partner: "Nikhil Jose",
    amount: 420,
    status: "Completed",
  },
  {
    id: "JOB-5502",
    date: "19 Sep 2026",
    vehicle: "Maruti Ertiga",
    service: "tyre",
    partner: "Rekha Menon",
    amount: 390,
    status: "Cancelled",
  },
  {
    id: "JOB-5496",
    date: "18 Sep 2026",
    vehicle: "Toyota Innova Crysta",
    service: "breakdown",
    partner: "Arjun Menon",
    amount: 650,
    status: "Completed",
  },
  {
    id: "JOB-5488",
    date: "17 Sep 2026",
    vehicle: "Ford EcoSport",
    service: "fuel",
    partner: "Jithin Raj",
    amount: 310,
    status: "Completed",
  },
];

export const earningsSeries = [
  { label: "Mon", earnings: 3200, jobs: 6 },
  { label: "Tue", earnings: 4150, jobs: 8 },
  { label: "Wed", earnings: 2850, jobs: 5 },
  { label: "Thu", earnings: 5240, jobs: 11 },
  { label: "Fri", earnings: 6180, jobs: 12 },
  { label: "Sat", earnings: 7320, jobs: 14 },
  { label: "Sun", earnings: 4890, jobs: 9 },
];

export const adminUsers = [
  {
    id: "USR-1042",
    name: "Arjun Menon",
    email: "arjun.menon@gmail.com",
    phone: "+91 98470 21145",
    vehicles: 3,
    services: 14,
    status: "Active",
    registered: "12 Feb 2025",
  },
  {
    id: "USR-1088",
    name: "Priya Sankar",
    email: "priya.sankar@outlook.com",
    phone: "+91 99610 33471",
    vehicles: 1,
    services: 6,
    status: "Active",
    registered: "30 Apr 2025",
  },
  {
    id: "USR-1123",
    name: "Vishnu Prasad",
    email: "vishnu.prasad@gmail.com",
    phone: "+91 94470 51120",
    vehicles: 2,
    services: 9,
    status: "Suspended",
    registered: "18 Jun 2025",
  },
  {
    id: "USR-1190",
    name: "Fathima Rasheed",
    email: "fathima.r@gmail.com",
    phone: "+91 97469 12088",
    vehicles: 1,
    services: 3,
    status: "Active",
    registered: "07 Jan 2026",
  },
  {
    id: "USR-1244",
    name: "Sabu Thomas",
    email: "sabu.thomas@yahoo.in",
    phone: "+91 98951 77340",
    vehicles: 2,
    services: 11,
    status: "Active",
    registered: "22 Mar 2026",
  },
];

export const complaints = [
  {
    id: "CMP-3012",
    user: "Vishnu Prasad",
    partner: "Nandhini Motors",
    service: "tyre",
    date: "20 Sep 2026",
    issue: "Partner arrived 40 minutes later than the promised ETA.",
    detail:
      "Customer reported the partner accepted the request at 6:05 PM with an 18 minute ETA but reached the location only at 7:02 PM. Customer requests a partial refund of the arrival surcharge.",
    status: "Open",
  },
  {
    id: "CMP-2998",
    user: "Priya Sankar",
    partner: "Deepak Fuel Express",
    service: "fuel",
    date: "16 Sep 2026",
    issue: "Fuel quantity delivered was less than billed.",
    detail:
      "Customer billed for 5 litres but claims only 3 litres were delivered. Photo evidence of the fuel gauge attached to the complaint.",
    status: "Under Review",
  },
  {
    id: "CMP-2951",
    user: "Sabu Thomas",
    partner: "Raj Auto Care",
    service: "breakdown",
    date: "09 Sep 2026",
    issue: "Duplicate charge on the invoice.",
    detail:
      "Night visit charge applied twice. Adjustment of ₹100 was processed to the customer wallet.",
    status: "Resolved",
  },
];

export const notifications = [
  {
    id: "NTF-1",
    title: "Partner assigned",
    body: "Raj Auto Care accepted your request REQ-88421 and is on the way.",
    time: "2 min ago",
    unread: true,
    kind: "success",
  },
  {
    id: "NTF-2",
    title: "Service reminder",
    body: "Maruti Swift VXi is due for its periodic service this week.",
    time: "3 hours ago",
    unread: true,
    kind: "warning",
  },
  {
    id: "NTF-3",
    title: "Invoice available",
    body: "Invoice INV-2026-0912 for ₹1,098 is ready to download.",
    time: "Yesterday",
    unread: false,
    kind: "info",
  },
  {
    id: "NTF-4",
    title: "Rate your service",
    body: "How was your experience with Ansari Mobile Mechanics?",
    time: "2 days ago",
    unread: false,
    kind: "info",
  },
];

export const adminStats = {
  totalUsers: 18426,
  totalPartners: 1247,
  pendingVerifications: 32,
  activeRequests: 148,
  completedServices: 92430,
  totalRevenue: 18740500,
};

export const monthlySeries = [
  { label: "Apr", requests: 5820, completed: 5310, cancelled: 510, revenue: 1284000 },
  { label: "May", requests: 6140, completed: 5680, cancelled: 460, revenue: 1392000 },
  { label: "Jun", requests: 6720, completed: 6190, cancelled: 530, revenue: 1518000 },
  { label: "Jul", requests: 7310, completed: 6820, cancelled: 490, revenue: 1664000 },
  { label: "Aug", requests: 7980, completed: 7420, cancelled: 560, revenue: 1822000 },
  { label: "Sep", requests: 8640, completed: 8110, cancelled: 530, revenue: 1985000 },
];

export const serviceMix = [
  { label: "Breakdown", value: 34 },
  { label: "Towing", value: 24 },
  { label: "Battery", value: 18 },
  { label: "Flat Tire", value: 15 },
  { label: "Fuel", value: 9 },
];

export const topPartners = [
  { name: "Ansari Mobile Mechanics", jobs: 1640, rating: 4.9, earnings: 984000 },
  { name: "Raj Auto Care", jobs: 1284, rating: 4.8, earnings: 812000 },
  { name: "Sreekumar Towing Service", jobs: 902, rating: 4.6, earnings: 1032000 },
  { name: "Nandhini Motors", jobs: 118, rating: 4.1, earnings: 64000 },
];

export const partnerNotifications = [
  {
    id: "PNTF-1",
    title: "New Request Nearby",
    body: "Arjun Menon requested Breakdown Repair at NH-66 Kakkanad (1.2 km away).",
    time: "Just now",
    unread: true,
    kind: "warning",
  },
  {
    id: "PNTF-2",
    title: "Payment Credited",
    body: "₹650 for job SRV-77120 has been credited to your payout wallet.",
    time: "3 hours ago",
    unread: true,
    kind: "success",
  },
  {
    id: "PNTF-3",
    title: "Customer Review Received",
    body: "Sabu Thomas rated your breakdown service 5 stars.",
    time: "Yesterday",
    unread: false,
    kind: "info",
  },
  {
    id: "PNTF-4",
    title: "Platform Incentive",
    body: "You completed 10 jobs this week! Bonus of ₹500 will be added on Friday.",
    time: "2 days ago",
    unread: false,
    kind: "success",
  },
];

export const adminNotifications = [
  {
    id: "ANTF-1",
    title: "New Partner Verification Request",
    body: "Deepak Fuel Express uploaded new Aadhaar & Fuel handling license.",
    time: "10 min ago",
    unread: true,
    kind: "warning",
  },
  {
    id: "ANTF-2",
    title: "Dispute Escalated",
    body: "Complaint CMP-3012 (Vishnu Prasad vs Nandhini Motors) requires review.",
    time: "45 min ago",
    unread: true,
    kind: "info",
  },
  {
    id: "ANTF-3",
    title: "Daily Target Surpassed",
    body: "Kochi Region reached 148 active roadside dispatches today.",
    time: "3 hours ago",
    unread: false,
    kind: "success",
  },
];

export const initialPartnerServiceConfigs = [
  { serviceId: "breakdown", enabled: true, price: 650, durationMinutes: 30 },
  { serviceId: "towing", enabled: true, price: 1200, durationMinutes: 45 },
  { serviceId: "battery", enabled: true, price: 400, durationMinutes: 20 },
  { serviceId: "tyre", enabled: true, price: 450, durationMinutes: 25 },
  { serviceId: "fuel", enabled: false, price: 350, durationMinutes: 20 },
];

export const partnerTransactions = [
  {
    id: "TXN-9081",
    date: "22 Sep 2026",
    customer: "Meera Krishnan",
    service: "towing",
    amount: 1250,
    commission: 125,
    netPayout: 1125,
    status: "Settled",
  },
  {
    id: "TXN-9074",
    date: "21 Sep 2026",
    customer: "Sabu Thomas",
    service: "breakdown",
    amount: 720,
    commission: 72,
    netPayout: 648,
    status: "Settled",
  },
  {
    id: "TXN-9062",
    date: "20 Sep 2026",
    customer: "Nikhil Jose",
    service: "battery",
    amount: 420,
    commission: 42,
    netPayout: 378,
    status: "Settled",
  },
  {
    id: "TXN-9055",
    date: "18 Sep 2026",
    customer: "Arjun Menon",
    service: "breakdown",
    amount: 650,
    commission: 65,
    netPayout: 585,
    status: "Settled",
  },
  {
    id: "TXN-9040",
    date: "17 Sep 2026",
    customer: "Jithin Raj",
    service: "fuel",
    amount: 310,
    commission: 31,
    netPayout: 279,
    status: "Settled",
  },
];

export const defaultChatMessages = [
  {
    id: "msg-1",
    sender: "system",
    text: "Raj Auto Care has accepted your request and is en route.",
    time: "10:14 AM",
  },
  {
    id: "msg-2",
    sender: "partner",
    text: "Hello! I am on the NH-66 service road, reaching in about 7-8 minutes. Is your hazard light on?",
    time: "10:15 AM",
  },
  {
    id: "msg-3",
    sender: "customer",
    text: "Yes, hazard lights are on. Innova parked right opposite to the petrol pump.",
    time: "10:16 AM",
  },
  {
    id: "msg-4",
    sender: "partner",
    text: "Noted, I see you ahead. Arriving now.",
    time: "10:20 AM",
  },
];
