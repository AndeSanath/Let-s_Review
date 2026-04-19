const mongoose = require('mongoose');
const User = require('./models/User');

const critics = [
  { username: "Raja Sens", email: "raja@critics.com", password: "password123", role: "critic", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Raja" },
  { username: "Film Companion", email: "fc@critics.com", password: "password123", role: "critic", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=FC" },
  { username: "Taran Adarsh", email: "taran@critics.com", password: "password123", role: "critic", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taran" }
];

mongoose.connect('mongodb://127.0.0.1:27017/letsreview').then(async () => {
  console.log('Seeding critics...');
  for (const c of critics) {
    const existing = await User.findOne({ email: c.email });
    if (!existing) {
      await new User(c).save();
    }
  }
  console.log('Critics seeded successfully');
  mongoose.connection.close();
}).catch(console.error);
