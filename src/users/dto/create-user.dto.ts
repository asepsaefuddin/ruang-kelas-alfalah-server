import { IsString, IsNotEmpty, IsEnum, IsOptional, ValidateIf, MinLength } from 'class-validator';

export class CreateUserDto {
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

  @IsString()
  @IsEnum(['admin', 'guru', 'siswa'])
  role: string;

  @IsString()
  @IsEnum(['aktif', 'tidak aktif'])
  @IsOptional()
  status?: string = 'aktif';

  // Field khusus untuk siswa - wajib jika role = siswa
  @ValidateIf(o => o.role === 'siswa')
  @IsString()
  @IsNotEmpty({ message: 'Kelas wajib diisi untuk siswa' })
  kelas?: string;

  // Field khusus untuk guru - wajib jika role = guru
  @ValidateIf(o => o.role === 'guru')
  @IsString()
  @IsNotEmpty({ message: 'Mata pelajaran wajib diisi untuk guru' })
  mataPelajaran?: string;
}