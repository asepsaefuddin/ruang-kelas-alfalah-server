import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO for bulk user creation from Excel file
 * Contains an array of user data to be created
 */
export class BulkCreateUserDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users: CreateUserDto[];
}

/**
 * Response structure for bulk create operation
 * Provides detailed information about success and failures
 */
export interface BulkCreateResponse {
  success: boolean;
  message: string;
  summary: {
    total: number;
    created: number;
    failed: number;
  };
  results: {
    created: Array<{
      username: string;
      namaLengkap: string;
      role: string;
    }>;
    failed: Array<{
      row: number;
      username?: string;
      namaLengkap?: string;
      error: string;
    }>;
  };
}
