import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BulkCreateResponse } from './dto/bulk-create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Validasi berdasarkan role
      if (createUserDto.role === 'siswa' && !createUserDto.kelas) {
        throw new BadRequestException('Kelas wajib diisi untuk siswa');
      }
      
      if (createUserDto.role === 'guru' && !createUserDto.mataPelajaran) {
        throw new BadRequestException('Mata pelajaran wajib diisi untuk guru');
      }

      // Untuk admin, hapus field kelas dan mataPelajaran jika ada
      if (createUserDto.role === 'admin') {
        delete createUserDto.kelas;
        delete createUserDto.mataPelajaran;
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

      const userData = {
        ...createUserDto,
        password: hashedPassword,
      };

      const createdUser = new this.userModel(userData);
      return await createdUser.save();
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ConflictException(`${field} sudah digunakan`);
      }
      throw error;
    }
  }

  async findAll(
    page: number,
    limit: number,
    role?: string,
    kelas?: string,
    mataPelajaran?: string,
    search?: string,
  ): Promise<{ data: User[]; count: number; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    // Build filter object with case-insensitive partial matching
    const filter: any = {};
    
    if (role) {
      filter.role = role; // Role should be exact match
    }
    
    if (kelas && kelas.trim() !== '') {
      // Case-insensitive partial match for kelas
      filter.kelas = { $regex: kelas.trim(), $options: 'i' };
    }
    
    if (mataPelajaran && mataPelajaran.trim() !== '') {
      // Case-insensitive partial match for mata pelajaran
      filter.mataPelajaran = { $regex: mataPelajaran.trim(), $options: 'i' };
    }

    // Global search across multiple fields
    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { username: searchRegex },
        { namaLengkap: searchRegex },
        { nipNim: searchRegex },
        { kelas: searchRegex },
        { mataPelajaran: searchRegex }
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter),
    ]);

    return { data, count: data.length, total, page, limit };
  }

  async findOne(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID "${id}" bukan format ObjectId yang valid`);
    }
    
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID "${id}" bukan format ObjectId yang valid`);
    }
    
    try {
      // Create a copy of updateUserDto to avoid modifying the original
      const updateData = { ...updateUserDto };

      // Handle password update - only hash if password is provided
      if (updateData.password && updateData.password.trim() !== '') {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      } else {
        // Remove password from update data if not provided or empty
        delete updateData.password;
      }

      // Jika role diubah, validasi field yang sesuai
      if (updateData.role) {
        if (updateData.role === 'siswa' && !updateData.kelas) {
          throw new BadRequestException('Kelas wajib diisi untuk siswa');
        }
        
        if (updateData.role === 'guru' && !updateData.mataPelajaran) {
          throw new BadRequestException('Mata pelajaran wajib diisi untuk guru');
        }

        // Untuk admin, hapus field kelas dan mataPelajaran
        if (updateData.role === 'admin') {
          updateData.kelas = undefined;
          updateData.mataPelajaran = undefined;
        }
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
      
      if (!updatedUser) {
        throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
      }
      
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ConflictException(`${field} sudah digunakan`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID "${id}" bukan format ObjectId yang valid`);
    }
    
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }
    return { message: `User ${deletedUser.username} berhasil dihapus` };
  }

  // Method khusus untuk mendapatkan siswa berdasarkan kelas
  async getSiswaByKelas(kelas: string): Promise<User[]> {
    return await this.userModel.find({ role: 'siswa', kelas }).exec();
  }

  // Method khusus untuk mendapatkan guru berdasarkan mata pelajaran
  async getGuruByMataPelajaran(mataPelajaran: string): Promise<User[]> {
    return await this.userModel.find({ role: 'guru', mataPelajaran }).exec();
  }

  // Method untuk mendapatkan semua kelas yang ada
  async getAllKelas(): Promise<string[]> {
    const kelas = await this.userModel.distinct('kelas', { role: 'siswa' }).exec();
    return kelas.filter(k => k); // Remove null/undefined values
  }

  // Method untuk mendapatkan semua mata pelajaran yang ada
  async getAllMataPelajaran(): Promise<string[]> {
    const mataPelajaran = await this.userModel.distinct('mataPelajaran', { role: 'guru' }).exec();
    return mataPelajaran.filter(mp => mp); // Remove null/undefined values
  }

  /**
   * Bulk create users from array
   * Creates multiple users at once with detailed error reporting
   * @param users - Array of user data to create
   * @returns Detailed response with success/failure information
   */
  async bulkCreate(users: CreateUserDto[]): Promise<BulkCreateResponse> {
    const results = {
      created: [] as Array<{ username: string; namaLengkap: string; role: string }>,
      failed: [] as Array<{ row: number; username?: string; namaLengkap?: string; error: string }>,
    };

    // Process each user sequentially to maintain row order
    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      const rowNumber = i + 2; // +2 because Excel starts at 1 and header is row 1

      try {
        // Validate required fields
        if (!userData.username || !userData.password || !userData.namaLengkap || !userData.nipNim || !userData.role) {
          throw new Error('Data tidak lengkap: username, password, namaLengkap, nipNim, dan role wajib diisi');
        }

        // Validate role
        if (!['admin', 'guru', 'siswa'].includes(userData.role)) {
          throw new Error('Role harus: admin, guru, atau siswa');
        }

        // Validate role-specific fields
        if (userData.role === 'siswa' && !userData.kelas) {
          throw new Error('Kelas wajib diisi untuk siswa');
        }

        if (userData.role === 'guru' && !userData.mataPelajaran) {
          throw new Error('Mata pelajaran wajib diisi untuk guru');
        }

        // Create user using existing create method
        const createdUser = await this.create(userData);
        
        results.created.push({
          username: createdUser.username,
          namaLengkap: createdUser.namaLengkap,
          role: createdUser.role,
        });
      } catch (error) {
        // Capture error with context
        let errorMessage = error.message || 'Unknown error';
        
        // Handle duplicate key errors more clearly
        if (error.code === 11000) {
          const field = Object.keys(error.keyPattern || {})[0] || 'field';
          errorMessage = `${field} sudah digunakan`;
        }

        results.failed.push({
          row: rowNumber,
          username: userData.username,
          namaLengkap: userData.namaLengkap,
          error: errorMessage,
        });
      }
    }

    const summary = {
      total: users.length,
      created: results.created.length,
      failed: results.failed.length,
    };

    return {
      success: summary.created > 0,
      message: summary.failed === 0 
        ? `Berhasil membuat ${summary.created} user`
        : `Berhasil membuat ${summary.created} user, ${summary.failed} gagal`,
      summary,
      results,
    };
  }
}