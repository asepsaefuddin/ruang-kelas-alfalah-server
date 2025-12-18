import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    try {
      console.log('🔍 LocalStrategy validating user:', username);
      const user = await this.authService.validateUser(username, password);
      
      if (!user) {
        console.log('❌ User validation failed for:', username);
        throw new UnauthorizedException('Username atau password salah');
      }
      
      console.log('✅ User validation successful for:', username);
      return user;
    } catch (error) {
      console.error('❌ LocalStrategy error:', error);
      throw error;
    }
  }
}