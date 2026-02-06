import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UpdateUserDto } from '../../dtos/updateUser.dto';
import { UserEntity } from '../../domains/entities/user.entity';

@Injectable()
export class UpdateUserUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        const userPatch: Partial<UserEntity> = { ...updateUserDto };
        return await this.userRepository.update(id, userPatch);
    }
}
