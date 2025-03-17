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
      customer_key: "dTJK7SKiZbOlpSSN",
      developer_key: "wmOlQPFzPER6YasT"
    },
    {
      name: "Relaxation Dental",
      address: "123 Main Street",
      city: "Denver",
      state: "CO",
      zip: "80010",
      customer_key: "b2n8TVS5k1xdpkI1",
      developer_key: "wmOlQPFzPER6YasT"
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
  //Users for Longhorn Dental (locationIds[0])
    {
      name: "Ethan Truong",
      dob: "1982-05-01",
      email: "ethan.ldtx@gmail.com",
      password: hashedPassword,
      role: "owner",
      location_id: locationIds[0]
    },
    {
      name: "Mary Jane",
      dob: "1985-05-15",
      email: "mary.jane@gmail.com",
      password: hashedPassword,
      role: "admin",
      location_id: locationIds[0]
    },
    {
      name: "Cuong Ho",
      dob: "1975-10-20",
      email: "cuong.ho@gmail.com",
      password: hashedPassword,
      role: "owner",
      location_id: locationIds[0]
    },
    {
      name: "Beth Johnson",
      dob: "1990-03-25",
      email: "beth.johnson@gmail.com",
      password: hashedPassword,
      role: "staff",
      location_id: locationIds[0]
    },
    {
      name: "Alan Smith",
      dob: "1988-07-12",
      email: "alan.smith@gmail.com",
      password: hashedPassword,
      role: "hygienist",
      location_id: locationIds[0]
    },
    {
      name: "Greg Neil",
      dob: "1982-11-30",
      email: "greg.neil@gmail.com",
      password: hashedPassword,
      role: "hygienist",
      location_id: locationIds[0]
    },
    {
      name: "Denise Nguyen",
      dob: "1982-11-30",
      email: "denise.nguyen@gmail.com",
      password: hashedPassword,
      role: "hygienist",
      location_id: locationIds[0]
    },
    {
      name: "Amber To",
      dob: "1982-11-30",
      email: "amber.to@gmail.com",
      password: hashedPassword,
      role: "staff",
      location_id: locationIds[0]
    }
  ];
  // //Users for Relaxation Dental (locationIds[1])
  // const relaxationUsers = [
  //   {
  //     name: "Chase Kliment",
  //     dob: "1982-10-24",
  //     email: "chase.kliment@gmail.com",
  //     password: hashedPassword,
  //     role: "owner",
  //     location_id: locationIds[1]
  //   },

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
    // Owner to Admin communication
    {
      sender_id: userIds["ethan.ldtx@gmail.com"],
      receiver_id: userIds["mary.jane@gmail.com"],
      message: "Mary, can you set up the OpenDental API connection for our office?"
    },
    {
      sender_id: userIds["mary.jane@gmail.com"],
      receiver_id: userIds["ethan.ldtx@gmail.com"],
      message: "I'll get that configured today. The customer key and developer key are already in the system."
    },

    // Between owners
    {
      sender_id: userIds["ethan.ldtx@gmail.com"],
      receiver_id: userIds["cuong.ho@gmail.com"],
      message: "We need to discuss the new equipment purchase at tomorrow's meeting."
    },
    {
      sender_id: userIds["cuong.ho@gmail.com"],
      receiver_id: userIds["ethan.ldtx@gmail.com"],
      message: "I'll prepare the budget report and options for review."
    },

    // Staff communications
    {
      sender_id: userIds["beth.johnson@gmail.com"],
      receiver_id: userIds["alan.smith@gmail.com"],
      message: "Alan, Mrs. Rodriguez needs a deep cleaning next week. What's your availability?"
    },
    {
      sender_id: userIds["alan.smith@gmail.com"],
      receiver_id: userIds["beth.johnson@gmail.com"],
      message: "I can schedule her on Thursday at 2pm or Friday morning."
    },

    // Staff to owner
    {
      sender_id: userIds["amber.to@gmail.com"],
      receiver_id: userIds["ethan.ldtx@gmail.com"],
      message: "Dr. Truong, we have a supply order ready for approval."
    },

    // Hygienists communication
    {
      sender_id: userIds["greg.neil@gmail.com"],
      receiver_id: userIds["denise.nguyen@gmail.com"],
      message: "Can you cover my afternoon appointments next Friday? I have a continuing education course."
    },
    {
      sender_id: userIds["denise.nguyen@gmail.com"],
      receiver_id: userIds["greg.neil@gmail.com"],
      message: "Yes, I can cover those appointments. Just make sure they're noted in my schedule."
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
