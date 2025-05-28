const bcrypt = require("bcryptjs");

bcrypt.hash("test1234", 10).then(console.log);
