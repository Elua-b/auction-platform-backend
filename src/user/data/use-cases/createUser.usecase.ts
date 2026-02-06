import { Injectable, BadRequestException } from '@nestjs/common';
import { UserEntity } from '../../domains/entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../../dtos/createUser.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/infra/config/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async execute(dto: CreateUserDto): Promise<any> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    let roleName = dto.userType.toUpperCase();
    const role = await this.prisma.role.findFirst({
      where: {
        name: {
          equals: roleName,
          mode: 'insensitive'
        }
      }
    });

    let roleToUse = role;
    if (!roleToUse) {
      roleToUse = await this.prisma.role.create({
        data: {
          name: roleName
        }
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new UserEntity();
    user.name = dto.name;
    user.email = dto.email;
    user.password = hashedPassword;
    user.roleId = roleToUse.id;

    // Use prisma to create and get the auto-generated fields (id, createdAt)
    const createdUser = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        roleId: user.roleId,
      },
      include: { role: true },
    });

    const payload = {
      sub: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      roleId: createdUser.roleId,
      role: createdUser.role.name
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      userType: createdUser.role.name,
      role: createdUser.role.name,
      createdAt: createdUser.createdAt,
    };
  }
}
