import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Model } from 'mongoose';
import { User, UserDocument } from './users/schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';

async function createTestUsers() {
  console.log('🚀 Creating test users...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('admin123', saltRounds);

  // Create admin user
  const adminUser = {
    username: 'admin',
    password: hashedPassword,
    namaLengkap: 'Administrator',
    nipNim: 'ADM001',
    role: 'admin',
    status: 'aktif'
  };

  try {
    // Delete existing admin if exists
    await userModel.deleteOne({ username: 'admin' });
    
    // Create new admin
    const newAdmin = new userModel(adminUser);
    await newAdmin.save();
    
    console.log('✅ Admin user created successfully');
    console.log('📋 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }

  await app.close();
}

createTestUsers();