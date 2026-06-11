import { Module } from '@nestjs/common';
import { UsersPrismaRepository } from './infrastructure/users.prisma.repository';
import { USER_REPOSITORY } from '../../domain/user/user.repository.interface';
import { UsersService } from '../auth/application/users.service';

@Module({
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: UsersPrismaRepository,
    },
  ],
  exports: [UsersService, USER_REPOSITORY],
})
export class UsersModule {}