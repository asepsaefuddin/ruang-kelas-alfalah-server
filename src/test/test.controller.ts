import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Controller('test')
export class TestController {
  constructor(private readonly usersService: UsersService) {}

  @Get('status')
  getStatus() {
    return { status: 'OK', message: 'Test endpoint working' };
  }

  @Post('create-user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}