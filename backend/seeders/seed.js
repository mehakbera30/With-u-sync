const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const Report = require("../models/Report");
const Message = require("../models/Message");
const Vital = require("../models/Vital");
const Notification = require("../models/Notification");

const seedDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/careconnect";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Check if destroy flag is passed
    if (process.argv[2] === "-d") {
      await User.deleteMany();
      await Appointment.deleteMany();
      await Prescription.deleteMany();
      await Report.deleteMany();
      await Message.deleteMany();
      await Vital.deleteMany();
      await Notification.deleteMany();
      console.log("Data Destroyed successfully!");
      process.exit();
    }

    // Clear existing data
    await User.deleteMany();
    await Appointment.deleteMany();
    await Prescription.deleteMany();
    await Report.deleteMany();
    await Message.deleteMany();
    await Vital.deleteMany();
    await Notification.deleteMany();
    console.log("Cleared existing collections.");

    // 1. Create Admin
    const admin = await User.create({
      name: "WithUSync Admin",
      email: "admin@withusync.com",
      password: "admin123",
      role: "admin",
      notificationsEnabled: true,
    });

    console.log("Created admin account.");

    // 2. Create Doctors
    const doctorsData = [
      {
        name: "Dr. Sarah Wilson",
        email: "sarah.wilson@withusync.com",
        password: "password123",
        role: "doctor",
        phone: "+91 9811122233",
        gender: "Female",
        specialization: "Cardiology",
        qualifications: "MBBS, MD - Cardiology",
        experience: 12,
        clinicLocation: "WithUSync Clinic, Room 302",
        consultationFee: 700,
        about: "Experienced cardiologist specializing in preventive cardiology and cardiovascular diseases.",
      },
      {
        name: "Dr. Michael Brown",
        email: "michael.brown@withusync.com",
        password: "password123",
        role: "doctor",
        phone: "+91 9822233344",
        gender: "Male",
        specialization: "General Physician",
        qualifications: "MBBS, MD - General Medicine",
        experience: 9,
        clinicLocation: "WithUSync Clinic, Room 105",
        consultationFee: 500,
        about: "Dedicated general physician focused on comprehensive family healthcare and chronic disease management.",
      },
      {
        name: "Dr. Emily Davis",
        email: "emily.davis@withusync.com",
        password: "password123",
        role: "doctor",
        phone: "+91 9833344455",
        gender: "Female",
        specialization: "Dermatology",
        qualifications: "MBBS, MD - Dermatology",
        experience: 8,
        clinicLocation: "WithUSync Clinic, Room 204",
        consultationFee: 600,
        about: "Expert in clinical and aesthetic dermatology, acne, psoriasis, and skin care treatments.",
      },
      {
        name: "Dr. James Wilson",
        email: "james.wilson@withusync.com",
        password: "password123",
        role: "doctor",
        phone: "+91 9844455566",
        gender: "Male",
        specialization: "Neurology",
        qualifications: "MBBS, DM - Neurology",
        experience: 15,
        clinicLocation: "WithUSync Clinic, Room 401",
        consultationFee: 800,
        about: "Senior neurologist treating neurological disorders, migraines, and nerve health.",
      },
    ];

    const createdDoctors = [];
    for (const doc of doctorsData) {
      const created = await User.create(doc);
      createdDoctors.push(created);
    }
    // Add 26 more doctors so the demo database always contains 30 doctor accounts.
    const extraDoctorFirstNames = [
      "Olivia", "Daniel", "Ava", "Noah", "Mia", "Ethan", "Isabella", "Lucas",
      "Amelia", "Mason", "Harper", "Leo", "Ella", "Arjun", "Grace", "Henry",
      "Sofia", "Liam", "Chloe", "Aarav", "Lily", "Kabir", "Zoe", "Rohan",
      "Nora", "Aditya",
    ];
    const extraSpecializations = [
      "Orthopedics", "Pediatrics", "ENT", "Psychiatry", "Gynecology", "Ophthalmology",
      "Gastroenterology", "Nephrology", "Pulmonology", "Oncology", "Endocrinology",
      "Urology", "Rheumatology",
    ];

    for (let i = 0; i < 26; i += 1) {
      const doctorNumber = i + 5;
      const firstName = extraDoctorFirstNames[i];
      const lastName = [
        "Anderson", "Taylor", "Clark", "Lewis", "Walker", "Hall", "Young", "King",
        "Wright", "Scott", "Green", "Baker", "Adams", "Sharma", "Patel", "Mehta",
        "Kapoor", "Singh", "Verma", "Gupta", "Malhotra", "Nair", "Joshi", "Rao",
        "Iyer", "Chopra",
      ][i];
      const specialization = extraSpecializations[i % extraSpecializations.length];

      const created = await User.create({
        name: `Dr. ${firstName} ${lastName}`,
        email: `${firstName}.${lastName}${doctorNumber}@withusync.com`.toLowerCase(),
        password: "password123",
        role: "doctor",
        phone: String(7000000000 + doctorNumber),
        gender: i % 2 === 0 ? "Female" : "Male",
        specialization,
        qualifications: "MBBS, MD",
        experience: 3 + (i % 15),
        clinicLocation: `WithUSync Clinic, Room ${200 + doctorNumber}`,
        consultationFee: 450 + (i % 8) * 50,
        about: `WithUSync ${specialization.toLowerCase()} specialist focused on patient-centred care.`,
        phoneVerified: true,
      });
      createdDoctors.push(created);
    }

    console.log(`Created ${createdDoctors.length} doctors.`);

    const drSarah = createdDoctors[0];
    const drMichael = createdDoctors[1];
    const drEmily = createdDoctors[2];

    // 2. Create Patients
    const patientsData = [
      {
        name: "John Doe",
        email: "johndoe@email.com",
        password: "password123",
        role: "patient",
        phone: "+91 9876543210",
        gender: "Male",
        age: 42,
        bloodGroup: "B+",
        condition: "Diabetes",
        allergies: "Penicillin",
        diagnosis: "Type 2 Diabetes",
        treatment: "Continue prescribed medication and maintain a healthy diet.",
        notes: "Patient is responding well to the current treatment.",
        emergencyContact: {
          name: "Jane Doe",
          phone: "+91 9876543299",
          relationship: "Spouse",
        },
      },
      {
        name: "Emma Smith",
        email: "emma.smith@email.com",
        password: "password123",
        role: "patient",
        phone: "+91 9876543211",
        gender: "Female",
        age: 35,
        bloodGroup: "O+",
        condition: "Hypertension",
        allergies: "None",
        diagnosis: "Stage 1 Essential Hypertension",
        treatment: "Low sodium diet and regular BP checks.",
      },
      {
        name: "Rahul Kumar",
        email: "rahul.kumar@email.com",
        password: "password123",
        role: "patient",
        phone: "+91 9876543212",
        gender: "Male",
        age: 29,
        bloodGroup: "A+",
        condition: "Fever",
        allergies: "Sulfa drugs",
        diagnosis: "Viral fever, recovering",
      },
      {
        name: "Sophia Williams",
        email: "sophia.williams@email.com",
        password: "password123",
        role: "patient",
        phone: "+91 9876543213",
        gender: "Female",
        age: 31,
        bloodGroup: "AB+",
        condition: "Asthma",
        allergies: "Dust, Pollen",
        diagnosis: "Mild intermittent asthma",
      },
    ];

    const createdPatients = [];
    for (const pat of patientsData) {
      const created = await User.create(pat);
      createdPatients.push(created);
    }
    // Add 46 more patients so the demo database always contains 50 patient accounts.
    const extraPatientFirstNames = [
      "Ananya", "Vihaan", "Ishita", "Karan", "Diya", "Manav", "Riya", "Dev",
      "Meera", "Yash", "Aisha", "Aryan", "Nisha", "Varun", "Kavya", "Ritvik",
      "Tanya", "Advik", "Sneha", "Nikhil", "Pihu", "Samar", "Ira", "Aman",
      "Anika", "Dhruv", "Shreya", "Raghav", "Myra", "Ayaan", "Neha", "Arnav",
      "Simran", "Krish", "Manya", "Harsh", "Avni", "Ved", "Tanvi", "Aditi",
      "Reyansh", "Palak", "Ishaan", "Kiara", "Siddharth", "Navya",
    ];
    const extraPatientLastNames = [
      "Bansal", "Saxena", "Chaudhary", "Sethi", "Agarwal", "Mishra", "Tiwari", "Jain",
      "Bhatt", "Khan", "Shah", "Goyal", "Mittal", "Arora", "Bhatia", "Sood",
      "Puri", "Khanna", "Dutta", "Bose", "Roy", "Das", "Menon", "Pillai",
      "Reddy", "Kulkarni", "Desai", "Naidu", "Pandey", "Srivastava", "Tripathi", "Yadav",
      "Dubey", "Madan", "Saini", "Thakur", "Rastogi", "Vohra", "Ahuja", "Wadhwa",
      "Goel", "Bajaj", "Chawla", "Bedi", "Kohli", "Batra",
    ];
    const conditions = [
      "Routine wellness", "Migraine", "Seasonal allergy", "Hypertension", "Thyroid follow-up",
      "Vitamin deficiency", "Back pain", "Asthma", "Gastritis", "Diabetes monitoring",
    ];
    const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-"];

    for (let i = 0; i < 46; i += 1) {
      const patientNumber = i + 5;
      const firstName = extraPatientFirstNames[i];
      const lastName = extraPatientLastNames[i];
      const created = await User.create({
        name: `${firstName} ${lastName}`,
        email: `${firstName}.${lastName}${patientNumber}@withusync.com`.toLowerCase(),
        password: "password123",
        role: "patient",
        phone: `98${String(10000000 + patientNumber).padStart(8, "0")}` ,
        gender: i % 2 === 0 ? "Female" : "Male",
        age: 18 + (i % 55),
        bloodGroup: bloodGroups[i % bloodGroups.length],
        condition: conditions[i % conditions.length],
        allergies: i % 5 === 0 ? "Dust" : "None",
        diagnosis: "Under routine follow-up",
        treatment: "Continue regular follow-up and prescribed care plan.",
        assignedDoctor: createdDoctors[i % createdDoctors.length]._id,
        phoneVerified: true,
      });
      createdPatients.push(created);
    }

    console.log(`Created ${createdPatients.length} patients.`);

    // Seeded/demo accounts are already trusted, so they do not need an OTP step.
    await User.updateMany({}, { $set: { phoneVerified: true } });

    const johnDoe = createdPatients[0];
    const emmaSmith = createdPatients[1];
    const rahulKumar = createdPatients[2];
    const sophiaWilliams = createdPatients[3];

    // Assign demo patients to Dr. Sarah so the doctor-side patient list
    // demonstrates the new assignment rule.
    await User.updateMany(
      {
        _id: {
          $in: [
            johnDoe._id,
            emmaSmith._id,
            rahulKumar._id,
            sophiaWilliams._id,
          ],
        },
      },
      {
        $set: {
          assignedDoctor: drSarah._id,
        },
      }
    );

    // 3. Create Appointments
    const appointmentsData = [
      {
        patient: johnDoe._id,
        patientName: johnDoe.name,
        doctor: drSarah._id,
        doctorName: drSarah.name,
        specialization: "Cardiology",
        date: "30 Sep 2026",
        time: "10:30 AM",
        type: "General Consultation",
        location: "WithUSync Clinic",
        reason: "Routine cardiovascular checkup and ECG review",
        status: "Confirmed",
      },
      {
        patient: johnDoe._id,
        patientName: johnDoe.name,
        doctor: drMichael._id,
        doctorName: drMichael.name,
        specialization: "General Physician",
        date: "04 Oct 2026",
        time: "02:00 PM",
        type: "Follow-up",
        location: "WithUSync Clinic",
        reason: "Follow-up on blood sugar levels and diet review",
        status: "Confirmed",
      },
      {
        patient: johnDoe._id,
        patientName: johnDoe.name,
        doctor: drEmily._id,
        doctorName: drEmily.name,
        specialization: "Dermatology",
        date: "18 Sep 2026",
        time: "11:00 AM",
        type: "Consultation",
        location: "WithUSync Clinic",
        reason: "Skin allergy consultation",
        status: "Completed",
      },
      {
        patient: emmaSmith._id,
        patientName: emmaSmith.name,
        doctor: drSarah._id,
        doctorName: drSarah.name,
        specialization: "Cardiology",
        date: "30 Sep 2026",
        time: "11:30 AM",
        type: "Follow-up",
        location: "WithUSync Clinic",
        reason: "Blood pressure monitor review",
        status: "Pending",
      },
      {
        patient: rahulKumar._id,
        patientName: rahulKumar.name,
        doctor: drSarah._id,
        doctorName: drSarah.name,
        specialization: "Cardiology",
        date: "30 Sep 2026",
        time: "01:00 PM",
        type: "Health Checkup",
        location: "WithUSync Clinic",
        reason: "Annual health physical",
        status: "Confirmed",
      },
      {
        patient: sophiaWilliams._id,
        patientName: sophiaWilliams.name,
        doctor: drSarah._id,
        doctorName: drSarah.name,
        specialization: "Cardiology",
        date: "01 Oct 2026",
        time: "10:00 AM",
        type: "Consultation",
        location: "WithUSync Clinic",
        reason: "Asthma assessment and chest clearance",
        status: "Completed",
      },
    ];

    await Appointment.insertMany(appointmentsData);
    console.log(`Created ${appointmentsData.length} appointments.`);

    // 4. Create Prescriptions
    const prescriptionsData = [
      {
        patient: johnDoe._id,
        patientName: johnDoe.name,
        doctor: drSarah._id,
        doctorName: drSarah.name,
        medicine: "Atorvastatin 10 mg",
        dosage: "1 tablet once daily",
        duration: "30 days",
        frequency: "Once daily",
        instructions: "Take after dinner",
        date: "18 Sep 2026",
        status: "Active",
      },
      {
        patient: johnDoe._id,
        patientName: johnDoe.name,
        doctor: drMichael._id,
        doctorName: drMichael.name,
        medicine: "Vitamin D3 60K",
        dosage: "1 tablet once a week",
        duration: "8 weeks",
        frequency: "Weekly",
        instructions: "Take with warm milk or after lunch",
        date: "12 Sep 2026",
        status: "Active",
      },
      {
        patient: johnDoe._id,
        patientName: johnDoe.name,
        doctor: drEmily._id,
        doctorName: drEmily.name,
        medicine: "Azithromycin 500 mg",
        dosage: "1 tablet once daily",
        duration: "5 days",
        frequency: "Once daily",
        instructions: "Complete full 5-day course before meals",
        date: "05 Sep 2026",
        status: "Completed",
      },
    ];

    await Prescription.insertMany(prescriptionsData);
    console.log(`Created ${prescriptionsData.length} prescriptions.`);

    // 5. Create Reports
    const reportsData = [
      {
        patient: johnDoe._id,
        patientName: johnDoe.name,
        doctor: drSarah._id,
        doctorName: drSarah.name,
        name: "Blood Test Report",
        type: "Blood Test",
        date: "25 Sep 2026",
        status: "Reviewed",
        findings: "Blood sugar level is slightly elevated.",
        doctorNotes: "Monitor fasting levels and avoid processed sugars.",
      },
      {
        patient: johnDoe._id,
        patientName: johnDoe.name,
        doctor: drMichael._id,
        doctorName: drMichael.name,
        name: "General Health Checkup",
        type: "Health Checkup",
        date: "12 Sep 2026",
        status: "Reviewed",
        findings: "Normal vitals. Mild Vitamin D insufficiency.",
        doctorNotes: "Supplementation initiated.",
      },
      {
        patient: johnDoe._id,
        patientName: johnDoe.name,
        doctor: drEmily._id,
        doctorName: drEmily.name,
        name: "ECG Report",
        type: "ECG",
        date: "05 Sep 2026",
        status: "Reviewed",
        findings: "Normal sinus rhythm, heart rate 72 bpm.",
      },
      {
        patient: emmaSmith._id,
        patientName: emmaSmith.name,
        doctor: drSarah._id,
        doctorName: drSarah.name,
        name: "ECG Report",
        type: "ECG",
        date: "24 Sep 2026",
        status: "Pending Review",
        findings: "",
      },
      {
        patient: rahulKumar._id,
        patientName: rahulKumar.name,
        doctor: drSarah._id,
        doctorName: drSarah.name,
        name: "X-Ray Report",
        type: "X-Ray",
        date: "20 Sep 2026",
        status: "Reviewed",
        findings: "No significant abnormality detected.",
      },
      {
        patient: sophiaWilliams._id,
        patientName: sophiaWilliams.name,
        doctor: drSarah._id,
        doctorName: drSarah.name,
        name: "Blood Test Report",
        type: "Blood Test",
        date: "18 Sep 2026",
        status: "Pending Review",
        findings: "",
      },
    ];

    await Report.insertMany(reportsData);
    console.log(`Created ${reportsData.length} reports.`);

    // 6. Create Messages
    const messagesData = [
      {
        sender: johnDoe._id,
        receiver: drSarah._id,
        senderRole: "patient",
        senderName: johnDoe.name,
        receiverName: drSarah.name,
        text: "Hello doctor, I have a question about my medicine.",
        read: true,
      },
      {
        sender: drSarah._id,
        receiver: johnDoe._id,
        senderRole: "doctor",
        senderName: drSarah.name,
        receiverName: johnDoe.name,
        text: "Sure John, what would you like to know?",
        read: true,
      },
      {
        sender: johnDoe._id,
        receiver: drSarah._id,
        senderRole: "patient",
        senderName: johnDoe.name,
        receiverName: drSarah.name,
        text: "Should I take it after meals?",
        read: true,
      },
      {
        sender: drSarah._id,
        receiver: johnDoe._id,
        senderRole: "doctor",
        senderName: drSarah.name,
        receiverName: johnDoe.name,
        text: "Yes, take it after meals.",
        read: true,
      },
      {
        sender: johnDoe._id,
        receiver: drSarah._id,
        senderRole: "patient",
        senderName: johnDoe.name,
        receiverName: drSarah.name,
        text: "Thank you, doctor.",
        read: true,
      },
      // Emma Smith & Dr. Sarah
      {
        sender: drSarah._id,
        receiver: emmaSmith._id,
        senderRole: "doctor",
        senderName: drSarah.name,
        receiverName: emmaSmith.name,
        text: "Your follow-up appointment is tomorrow.",
        read: true,
      },
      {
        sender: emmaSmith._id,
        receiver: drSarah._id,
        senderRole: "patient",
        senderName: emmaSmith.name,
        receiverName: drSarah.name,
        text: "I will come tomorrow.",
        read: true,
      },
      // Rahul Kumar & Dr. Sarah
      {
        sender: rahulKumar._id,
        receiver: drSarah._id,
        senderRole: "patient",
        senderName: rahulKumar.name,
        receiverName: drSarah.name,
        text: "My fever is better now.",
        read: true,
      },
      {
        sender: drSarah._id,
        receiver: rahulKumar._id,
        senderRole: "doctor",
        senderName: drSarah.name,
        receiverName: rahulKumar.name,
        text: "That's good. Continue your medication.",
        read: true,
      },
    ];

    for (const msg of messagesData) {
      await Message.create(msg);
    }
    console.log(`Created ${messagesData.length} messages.`);

    // 7. Create Vitals for John Doe
    await Vital.create({
      patient: johnDoe._id,
      recordedBy: drSarah._id,
      hemoglobin: { value: 13.8, unit: "g/dL", status: "Normal" },
      bloodPressure: { systolic: 120, diastolic: 80, reading: "120/80", unit: "mmHg", status: "Normal" },
      bloodSugar: { value: 110, unit: "mg/dL", status: "Normal" },
      heartRate: { value: 72, unit: "bpm", status: "Normal" },
      temperature: { value: 98.4, unit: "°F", status: "Normal" },
      oxygenSaturation: { value: 98, unit: "%", status: "Normal" },
      weight: { value: 68, unit: "kg" },
      height: { value: 172, unit: "cm" },
      recordedAt: new Date("2026-09-25T10:30:00"),
      notes: "Baseline vitals in healthy parameters.",
    });

    await Vital.create({
      patient: johnDoe._id,
      recordedBy: drMichael._id,
      hemoglobin: { value: 13.7, unit: "g/dL", status: "Normal" },
      bloodPressure: { systolic: 118, diastolic: 78, reading: "118/78", unit: "mmHg", status: "Normal" },
      bloodSugar: { value: 106, unit: "mg/dL", status: "Normal" },
      heartRate: { value: 75, unit: "bpm", status: "Normal" },
      temperature: { value: 98.2, unit: "°F", status: "Normal" },
      oxygenSaturation: { value: 99, unit: "%", status: "Normal" },
      weight: { value: 67.5, unit: "kg" },
      height: { value: 172, unit: "cm" },
      recordedAt: new Date("2026-09-28T14:00:00"),
      notes: "Follow-up general health check.",
    });

    await Vital.create({
      patient: johnDoe._id,
      recordedBy: drEmily._id,
      hemoglobin: { value: 13.9, unit: "g/dL", status: "Normal" },
      bloodPressure: { systolic: 119, diastolic: 79, reading: "119/79", unit: "mmHg", status: "Normal" },
      bloodSugar: { value: 108, unit: "mg/dL", status: "Normal" },
      heartRate: { value: 73, unit: "bpm", status: "Normal" },
      temperature: { value: 98.1, unit: "°F", status: "Normal" },
      oxygenSaturation: { value: 98, unit: "%", status: "Normal" },
      weight: { value: 67.2, unit: "kg" },
      height: { value: 172, unit: "cm" },
      recordedAt: new Date("2026-09-30T11:00:00"),
      notes: "Recent specialist consultation.",
    });

    console.log("Created multi-doctor vital history for John Doe.");

    // 8. Create Notifications
    await Notification.create({
      user: johnDoe._id,
      title: "Appointment Confirmed",
      message: "Your appointment with Dr. Sarah Wilson on 30 Sep 2026 is confirmed.",
      type: "appointment",
      link: "/patient/appointments",
    });

    await Notification.create({
      user: drSarah._id,
      title: "New Appointment Request",
      message: "Emma Smith has scheduled a follow-up appointment.",
      type: "appointment",
      link: "/doctor/appointments",
    });

    console.log("\n==========================================");
    console.log(" WITHUSYNC DATABASE SEEDING COMPLETE! ");
    console.log("==========================================");
    console.log("Seeded records: 1 admin, 30 doctors, 50 patients.");
    console.log("\nTest Logins:");
    console.log("ADMIN LOGIN:");
    console.log("Email:    admin@withusync.com");
    console.log("Password: admin123\n");
    console.log("DOCTOR LOGIN:");
    console.log("Email:    sarah.wilson@withusync.com");
    console.log("Password: password123\n");
    console.log("PATIENT LOGIN:");
    console.log("Email:    johndoe@email.com");
    console.log("Password: password123\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDatabase();
