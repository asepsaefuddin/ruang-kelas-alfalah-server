import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard, JwtAuthGuard } from './guards/auth.guard';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    try {
      console.log('🔐 Login attempt for user:', loginDto.username);
      console.log('🔍 User from LocalAuthGuard:', req.user ? 'Found' : 'Not found');
      
      if (!req.user) {
        throw new HttpException('Username atau password salah', HttpStatus.UNAUTHORIZED);
      }
      
      const result = await this.authService.login(req.user);
      console.log('✅ Login successful for user:', loginDto.username);
      return result;
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Log the full error for debugging
      console.error('❌ Unexpected login error:', {
        message: error.message,
        stack: error.stack,
        name: error.constructor.name
      });
      
      throw new HttpException('Terjadi kesalahan saat login', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // Pindahkan validasi ini ke dalam DTO atau service untuk konsistensi
    if (registerDto.role === 'siswa' && !registerDto.kelas) {
      throw new HttpException('Kelas wajib diisi untuk siswa', HttpStatus.BAD_REQUEST);
    }

    if (registerDto.role === 'guru' && !registerDto.mataPelajaran) {
      throw new HttpException('Mata pelajaran wajib diisi untuk guru', HttpStatus.BAD_REQUEST);
    }

    // Biarkan service yang menangani error duplikasi (ConflictException)
    return await this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    // Biarkan service yang melempar NotFoundException jika user tidak ada
    return await this.authService.getProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    return await this.authService.updateProfile(user.userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  async verifyToken(@CurrentUser() user: any) {
    return {
      success: true,
      message: 'Token valid',
      data: {
        userId: user.userId,
        username: user.username,
        role: user.role,
        kelas: user.kelas,
        mataPelajaran: user.mataPelajaran,
      },
    };
  }
}