import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User, UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  username: string;
  sub: string; // user id
  role: string;
  kelas?: string;
  mataPelajaran?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      console.log('🔍 AuthService validating user:', username);
      
      const user = await this.userModel.findOne({ username }).select('+password').exec();
      console.log('👤 User found in database:', user ? 'Yes' : 'No');
      
      if (user) {
        console.log('🔐 Comparing password...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('🔐 Password valid:', isPasswordValid);
        
        if (isPasswordValid) {
          const { password, ...result } = user.toObject();
          console.log('✅ User validation successful');
          return result;
        }
      }
      
      console.log('❌ User validation failed');
      return null;
    } catch (error) {
      console.error('❌ AuthService validateUser error:', error);
      throw error;
    }
  }

  async login(user: any) {
    const payload: JwtPayload = {
      username: user.username,
      sub: user._id,
      role: user.role,
      kelas: user.kelas,
      mataPelajaran: user.mataPelajaran,
    };

    return {
      success: true,
      message: 'Login berhasil',
      data: {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user._id,
          username: user.username,
          namaLengkap: user.namaLengkap,
          role: user.role,
          kelas: user.kelas,
          mataPelajaran: user.mataPelajaran,
          status: user.status,
        },
        expires_in: '7d',
      },
    };
  }

  async register(createUserDto: any) {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user with hashed password
    const userData = {
      ...createUserDto,
      password: hashedPassword,
      status: 'aktif', // Default status
    };

    const newUser = new this.userModel(userData);
    const savedUser = await newUser.save();

    // Remove password from response
    const { password, ...result } = savedUser.toObject();

    return {
      success: true,
      message: 'Registrasi berhasil',
      data: result,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password').exec();
    
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      success: true,
      message: 'Profile berhasil diambil',
      data: user,
    };
  }

  async updateProfile(userId: string, updateData: any) {
    // If password is being updated, hash it
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      success: true,
      message: 'Profile berhasil diupdate',
      data: updatedUser,
    };
  }
}