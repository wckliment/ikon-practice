// seedDatabase.js
const ikonDB = require("./config/db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Clear existing data
    await clearExistingData();

    // Seed locations
    const locationIds = await seedLocations();

    // Seed users
    const userIds = await seedUsers(locationIds);

    // Seed messages
    await seedMessages(userIds);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Helper function for database queries
function queryPromise(sql, params = []) {
  return new Promise((resolve, reject) => {
    ikonDB.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function clearExistingData() {
  // Delete messages first (depends on users)
  await queryPromise("DELETE FROM messages");

  // Delete users (depends on locations)
  await queryPromise("DELETE FROM users");

  // Delete locations
  await queryPromise("DELETE FROM locations");

  console.log("Existing data cleared");
}

async function seedLocations() {
  const locations = [
    {
      name: "Longhorn Dental",
      address: "7995 Bellfort St",
      city: "Houston",
      state: "TX",
      zip: "77036",
      customer_key: "your_actual_customer_key",
      developer_key: "your_actual_developer_key"
    },
    // Add more locations if needed
    {
      name: "Relaxation Dental",
      address: "456 Another St",
      city: "Other City",
      state: "OS",
      zip: "67890",
      customer_key: "second_customer_key",
      developer_key: "second_developer_key"
    }
  ];

  const locationIds = [];

  for (const location of locations) {
    const result = await queryPromise(
      "INSERT INTO locations (name, address, city, state, zip, customer_key, developer_key) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [location.name, location.address, location.city, location.state, location.zip, location.customer_key, location.developer_key]
    );
    locationIds.push(result.insertId);
  }

  console.log(`Seeded ${locations.length} locations`);
  return locationIds;
}

async function seedUsers(locationIds) {
  // Create password hash - same password for all test users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = [
    {
      name: "Your Name",
      dob: "1980-01-01",
      email: "owner@example.com",
      password: hashedPassword,
      role: "owner",
      location_id: locationIds[0]
    },
    {
      name: "Admin User",
      dob: "1985-05-15",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      location_id: locationIds[0]
    },
    {
      name: "Dr. Dentist",
      dob: "1975-10-20",
      email: "dentist@example.com",
      password: hashedPassword,
      role: "dentist",
      location_id: locationIds[0]
    },
    {
      name: "Staff Member",
      dob: "1990-03-25",
      email: "staff@example.com",
      password: hashedPassword,
      role: "staff",
      location_id: locationIds[0]
    },
    {
      name: "Hygienist",
      dob: "1988-07-12",
      email: "hygienist@example.com",
      password: hashedPassword,
      role: "hygienist",
      location_id: locationIds[0]
    },
    {
      name: "Second Owner",
      dob: "1982-11-30",
      email: "owner2@example.com",
      password: hashedPassword,
      role: "owner",
      location_id: locationIds[1]
    }
  ];

  const userIds = {};

  for (const user of users) {
    const result = await queryPromise(
      "INSERT INTO users (name, dob, email, password, role, location_id) VALUES (?, ?, ?, ?, ?, ?)",
      [user.name, user.dob, user.email, user.password, user.role, user.location_id]
    );
    userIds[user.email] = result.insertId;
  }

  console.log(`Seeded ${users.length} users`);
  return userIds;
}

async function seedMessages(userIds) {
  const messages = [
    {
      sender_id: userIds["owner@example.com"],
      receiver_id: userIds["admin@example.com"],
      message: "Welcome to the practice management system!"
    },
    {
      sender_id: userIds["admin@example.com"],
      receiver_id: userIds["owner@example.com"],
      message: "Thanks! I'm getting everything set up now."
    },
    {
      sender_id: userIds["dentist@example.com"],
      receiver_id: userIds["staff@example.com"],
      message: "Please schedule a follow-up for Mrs. Johnson next week."
    },
    {
      sender_id: userIds["staff@example.com"],
      receiver_id: userIds["dentist@example.com"],
      message: "Appointment scheduled for Tuesday at 2pm."
    }
  ];

  for (const message of messages) {
    await queryPromise(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [message.sender_id, message.receiver_id, message.message]
    );
  }

  console.log(`Seeded ${messages.length} messages`);
}

// Run the seeding function
seedDatabase();
