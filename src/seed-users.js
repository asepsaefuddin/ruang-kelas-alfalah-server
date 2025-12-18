import { connect } from 'mongoose';
import * as bcrypt from 'bcryptjs';
const { User } = require('../users/schemas/user.schema');

async function seedUsers() {
  try {
    // Connect to MongoDB
    await connect('mongodb://localhost:27017/ruangkelas');
    console.log('Connected to MongoDB');

    // Clear existing users (optional)
    // await User.deleteMany({});

    const saltRounds = 10;

    // Create test users
    const testUsers = [
      {
        username: 'admin',
        password: await bcrypt.hash('admin123', saltRounds),
        namaLengkap: 'Administrator',
        nipNim: 'ADM001',
        role: 'admin',
        status: 'aktif'
      },
      {
        username: 'guru1',
        password: await bcrypt.hash('guru123', saltRounds),
        namaLengkap: 'Bapak Guru Matematika',
        nipNim: 'GRU001',
        role: 'guru',
        status: 'aktif',
        mataPelajaran: 'Matematika'
      },
      {
        username: 'siswa1',
        password: await bcrypt.hash('siswa123', saltRounds),
        namaLengkap: 'Ahmad Siswa',
        nipNim: 'SIS001',
        role: 'siswa',
        status: 'aktif',
        kelas: '10A'
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✓ Created user: ${userData.username} (${userData.role})`);
      } else {
        console.log(`- User ${userData.username} already exists`);
      }
    }

    console.log('\n🎉 Seeding completed!');
    console.log('\nTest credentials:');
    console.log('Admin: admin / admin123');
    console.log('Guru: guru1 / guru123');
    console.log('Siswa: siswa1 / siswa123');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    process.exit(0);
  }
}

seedUsers();