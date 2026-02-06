import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../domains/entities/user.entity';
import { PrismaService } from '@/infra/config/prisma/prisma.service';
import { UserRepositoryInterface } from '../../domains/repositories/UserRepositoryInterface';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(private prisma: PrismaService) { }

  async create(user: UserEntity): Promise<void> {
    try {
      await this.prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
          roleId: user.roleId,
          avatar: user.avatar,
        },
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany();
    return users as UserEntity[];
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) return null;

    // Map Prisma result to UserEntity
    return {
      ...user,
      roleId: user.roleId,
      role: user.role // Determine if UserEntity needs this property added? Yes, likely.
    } as any; // Temporary cast if UserEntity doesn't have role yet, I should check UserEntity.
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    return user as UserEntity | null;
  }

  async update(id: string, user: Partial<UserEntity>): Promise<UserEntity> {
    // Remove properties that shouldn't be updated loosely or mismatch types
    const { role, ...updateData } = user as any;

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    return updated as UserEntity;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
