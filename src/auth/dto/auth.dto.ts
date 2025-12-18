import { IsString, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  namaLengkap: string;

  @IsString()
  @IsNotEmpty()
  nipNim: string;

  @IsEnum(['admin', 'guru', 'siswa'])
  role: string;

  @IsOptional()
  @IsString()
  kelas?: string; // Required for siswa

  @IsOptional()
  @IsString()
  mataPelajaran?: string; // Required for guru
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  namaLengkap?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  kelas?: string;

  @IsOptional()
  @IsString()
  mataPelajaran?: string;
}