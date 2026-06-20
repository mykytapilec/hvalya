import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@hvalya/types';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/user/user.repository.interface';
import { SubscriptionsService } from '../../subscriptions/application/subscriptions.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { IJwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) throw new ConflictException('Email already in use');

    const existingUsername = await this.userRepository.findByUsername(dto.username);
    if (existingUsername) throw new ConflictException('Username already taken');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
    });

    await this.subscriptionsService.createDefault(user.id);

    return this.generateToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user.id, user.email, user.role);
  }

  private generateToken(userId: string, email: string, role: UserRole): { accessToken: string } {
    const payload: IJwtPayload = { sub: userId, email, role };
    return { accessToken: this.jwtService.sign(payload) };
  }
}