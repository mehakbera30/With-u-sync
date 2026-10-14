# 🏥 WithUSync Backend REST API

A production-ready Node.js, Express, and MongoDB backend for the **WithUSync** Healthcare Portal. This backend powers role-based access for Doctors and Patients, appointment booking, medical records, digital prescriptions, lab reports, vital signs tracking, doctor-patient messaging, and aggregate dashboard metrics.

---

## 🚀 Key Features

- **Authentication & Security**:
  - JWT (JSON Web Token) authentication with bearer tokens.
  - Password hashing with `bcryptjs` (salt rounds: 10).
  - Role-based authorization (`patient`, `doctor`, `admin`).
  - Request logging with `morgan` and CORS support.

- **Doctor & Patient Management**:
  - Multi-specialty doctor directory (Cardiology, General Medicine, Dermatology, Neurology).
  - Detailed patient health profiles, clinical diagnoses, medical allergies, and emergency contacts.
  - Doctor patient notes and treatment management.

- **Appointment Scheduling**:
  - Patient appointment booking with doctor selection, date/time slots, and symptoms.
  - Doctor review queue: Confirm, Reschedule, Complete, or Cancel appointments.
  - Automated status notifications sent between doctor and patient.

- **Prescription System**:
  - Doctors issue structured prescriptions (medicine, dosage, duration, frequency, instructions).
  - Patients can track active vs. completed medication schedules.

- **Lab & Medical Reports**:
  - Management for Blood Tests, ECGs, X-Rays, Health Checkups, MRIs, and Ultrasounds.
  - Doctor review workflow with diagnostic findings and clinical notes.

- **Chat & Messaging**:
  - Direct communication threads between patients and doctors.
  - Unread message tracking and instant conversations summary.

- **Vital Signs & Health Trends**:
  - Metrics tracking: Hemoglobin, Blood Pressure (systolic/diastolic), Blood Sugar, Heart Rate, and Temperature.
  - Historical health log and latest status summary.

- **Aggregated Dashboards**:
  - **Patient Dashboard**: Upcoming appointments, active prescriptions, latest vitals, and reports count.
  - **Doctor Dashboard**: Total patients, today's appointment list, pending reviews, and consultation counts.

---

## 📁 Project Architecture

```
backend/
├── config/
│   └── db.js                 # MongoDB connection using Mongoose
├── controllers/
│   ├── authController.js     # Register, Login, Me, Update Password
│   ├── userController.js     # Doctor directory, Patient management, Profiles
│   ├── appointmentController.js # Booking, Doctor approval, Cancellation
│   ├── prescriptionController.js # Prescription creation, Patient view, Status update
│   ├── reportController.js   # Lab report management, Doctor findings review
│   ├── messageController.js  # Chat messaging and conversation threads
│   ├── vitalController.js    # Patient vitals logging & latest metrics
│   ├── dashboardController.js# Aggregate statistics for Patient & Doctor dashboards
│   └── notificationController.js # Notification alerts and read status
├── middleware/
│   ├── authMiddleware.js     # JWT verification & role authorization
│   └── errorMiddleware.js    # 404 handler and central error response
├── models/
│   ├── User.js               # User accounts (Doctors & Patients)
│   ├── Appointment.js        # Appointment bookings and status
│   ├── Prescription.js       # Prescriptions issued by doctors
│   ├── Report.js             # Lab & diagnostic reports
│   ├── Message.js            # Doctor-patient messages
│   ├── Vital.js              # Patient vital signs
│   └── Notification.js       # User notifications
├── routes/
│   ├── authRoutes.js         # /api/auth
│   ├── userRoutes.js         # /api/users
│   ├── appointmentRoutes.js  # /api/appointments
│   ├── prescriptionRoutes.js # /api/prescriptions
│   ├── reportRoutes.js       # /api/reports
│   ├── messageRoutes.js      # /api/messages
│   ├── vitalRoutes.js        # /api/vitals
│   ├── dashboardRoutes.js    # /api/dashboard
│   └── notificationRoutes.js # /api/notifications
├── seeders/
│   └── seed.js               # Database seeder with realistic demo data
├── utils/
│   └── generateToken.js      # JWT generator utility
├── .env                      # Environment configuration
├── .env.example              # Sample environment template
├── app.js                    # Express app configuration & middleware pipeline
├── package.json              # NPM scripts and dependencies
└── server.js                 # HTTP server entrypoint
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local MongoDB Community Server running on `localhost:27017` or MongoDB Atlas URI)

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/careconnect
JWT_SECRET=careconnect_jwt_super_secret_key_2026_xyz
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
```

### 4. Seed the Database
Populate initial demo doctors, patients, appointments, prescriptions, reports, messages, and vitals:
```bash
npm run seed
```

To wipe and reset the database:
```bash
npm run seed:destroy
```

### 5. Start the Server
Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```
The server will run on **http://localhost:5000**.

---

## 🔑 Demo Login Accounts

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Doctor** | Dr. Sarah Wilson | `sarah.wilson@withusync.com` | `password123` |
| **Doctor** | Dr. Michael Brown | `michael.brown@withusync.com` | `password123` |
| **Doctor** | Dr. Emily Davis | `emily.davis@withusync.com` | `password123` |
| **Doctor** | Dr. James Wilson | `james.wilson@withusync.com` | `password123` |
| **Patient** | John Doe | `johndoe@email.com` | `password123` |
| **Patient** | Emma Smith | `emma.smith@email.com` | `password123` |
| **Patient** | Rahul Kumar | `rahul.kumar@email.com` | `password123` |
| **Patient** | Sophia Williams | `sophia.williams@email.com` | `password123` |

---

## 📡 Complete API Reference

All protected endpoints require the HTTP header:
`Authorization: Bearer <YOUR_JWT_TOKEN>`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new patient or doctor account |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT token |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |
| `PUT` | `/api/auth/update-password` | Private | Update current user password |

### 2. Users & Profiles (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/doctors` | Public | List all doctors (supports `?specialty=&search=`) |
| `GET` | `/api/users/doctors/:id` | Public | Get single doctor details |
| `GET` | `/api/users/patients` | Doctor | List all patients (supports `?search=`) |
| `GET` | `/api/users/patients/:id` | Private | Get single patient details & medical history |
| `PUT` | `/api/users/patients/:id` | Doctor | Update patient condition, diagnosis, and treatment |
| `PUT` | `/api/users/profile` | Private | Update current user's profile |

### 3. Appointments (`/api/appointments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/appointments` | Private | Book appointment (`doctorName`/`doctorId`, `date`, `time`, `specialization`, `reason`) |
| `GET` | `/api/appointments` | Private | List appointments for user (returns `upcoming` and `past`) |
| `GET` | `/api/appointments/:id` | Private | Get detailed appointment information |
| `PATCH` | `/api/appointments/:id/status`| Private | Update appointment status (`Pending`, `Confirmed`, `Completed`, `Cancelled`) |
| `DELETE` | `/api/appointments/:id` | Private | Cancel appointment |

### 4. Prescriptions (`/api/prescriptions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/prescriptions` | Doctor | Issue prescription (`patientId`, `medicine`, `dosage`, `duration`, `frequency`, `instructions`) |
| `GET` | `/api/prescriptions` | Private | Get user prescriptions (filter by `?status=Active/Completed`) |
| `GET` | `/api/prescriptions/:id` | Private | Get prescription details |
| `PATCH` | `/api/prescriptions/:id/status` | Doctor | Update status (`Active`, `Completed`, `Discontinued`) |

### 5. Medical Reports (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reports` | Private | Upload/create report (`name`, `type`, `date`, `fileUrl`) |
| `GET` | `/api/reports` | Private | Get reports (filter by `?type=`, `?status=`, `?search=`) |
| `GET` | `/api/reports/:id` | Private | Get report details |
| `PUT` | `/api/reports/:id/review` | Doctor | Review report and save findings/notes |

### 6. Messages / Chat (`/api/messages`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/messages` | Private | Send message (`receiverId`, `text`) |
| `GET` | `/api/messages/conversations` | Private | Get all conversation threads with latest messages |
| `GET` | `/api/messages/:userId` | Private | Get all chat messages with a specific user |

### 7. Health Vitals (`/api/vitals`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/vitals` | Private | Record new vitals reading |
| `GET` | `/api/vitals/latest` | Private | Get most recent vital metrics (Hemoglobin, BP, Sugar, Heart Rate, Temp) |
| `GET` | `/api/vitals/history` | Private | Get historical log for charting |

### 8. Dashboards (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/patient` | Patient | Aggregate data: stats, upcoming appointments, active medicines, vitals |
| `GET` | `/api/dashboard/doctor` | Doctor | Aggregate data: patient count, appointment queue, pending reports |

### 9. Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Private | Get user notifications & unread count |
| `PATCH` | `/api/notifications/:id/read` | Private | Mark single notification as read |
| `PATCH` | `/api/notifications/read-all` | Private | Mark all notifications as read |

---

## 🛠️ Verification & Test Command Examples

### Login as Patient
```powershell
$body = @{ email = "johndoe@email.com"; password = "password123" } | ConvertTo-Json
$res = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $res.token
```

### Fetch Patient Dashboard with Token
```powershell
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/patient" -Method Get -Headers $headers
```

### Book an Appointment
```powershell
$apt = @{
  doctorName = "Dr. Sarah Wilson"
  date = "08 Oct 2026"
  time = "11:00 AM"
  specialization = "Cardiology"
  reason = "Chest discomfort consultation"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/appointments" -Method Post -Body $apt -Headers $headers -ContentType "application/json"
```


## Admin setup

The admin panel is available at:

`/admin/dashboard`

Create the admin account without deleting existing MongoDB data:

```bash
npm run create-admin
```

Default demo admin:

- Email: `admin@withusync.com`
- Password: `admin123`

The admin can:
- View doctors and patients
- Add a new patient
- Assign/reassign a patient to a doctor
- View system-wide appointments
- See unassigned-patient counts

## Patient assignment

Each patient has an `assignedDoctor` field.

- A doctor can only see patients assigned to that doctor.
- Patient details, reports and vitals are protected by the same assignment rule.
- If a patient has no assigned doctor, their first appointment can assign the selected doctor automatically.
- If a patient is already assigned to a doctor, they must use that assigned doctor unless an admin changes the assignment.

## Notifications

Each user has a `notificationsEnabled` setting stored in MongoDB.

The notification bell reads notification documents from:

`/api/notifications`

New appointment, prescription, report and assignment notifications respect the user's notification preference.
