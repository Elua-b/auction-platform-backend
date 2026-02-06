import { Module } from '@nestjs/common';
import { UserController } from './application/controllers/user.controllers';
import { UserRepository } from './data/repositories/user.repository';
import { CreateUserUseCase } from './data/use-cases/createUser.usecase';
import { GetUsersUseCase } from './data/use-cases/getUsers.usecase';
import { GetUserUseCase } from './data/use-cases/getUser.usecase';
import { UpdateUserUseCase } from './data/use-cases/updateUser.usecase';
import { DeleteUserUseCase } from './data/use-cases/deleteUser.usecase';
import { LoginUserUseCase } from './data/use-cases/loginUser.usecase';
import { PrismaModule } from '@/infra/config/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './application/auth/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UserController],
  providers: [
    JwtStrategy,
    UserRepository,
    CreateUserUseCase,
    GetUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    LoginUserUseCase,
  ],
})
export class UserModule { }
