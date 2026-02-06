import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { LoginUserDto } from '../../dtos/loginUser.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/infra/config/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class LoginUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) { }

    async execute(dto: LoginUserDto): Promise<any> {
        const user = await this.userRepository.findByEmail(dto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Fetch role name
        const role = await this.prisma.role.findUnique({
            where: { id: user.roleId }
        });

        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleId,
            role: role?.name || 'BUYER'
        };

        const token = this.jwtService.sign(payload);

        return {
            token,
            id: user.id,
            email: user.email,
            name: user.name,
            userType: role?.name || 'BUYER',
            role: role?.name || 'BUYER', // Keep for compatibility if needed
            avatar: user.avatar,
            createdAt: user.createdAt,
        };
    }
}
