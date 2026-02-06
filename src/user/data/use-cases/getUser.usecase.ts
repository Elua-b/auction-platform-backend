import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../../domains/entities/user.entity';

@Injectable()
export class GetUserUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(id: string): Promise<UserEntity | null> {
        return await this.userRepository.findById(id);
    }
}
