import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../../domains/entities/user.entity';

@Injectable()
export class GetUsersUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(): Promise<UserEntity[]> {
        return await this.userRepository.findAll();
    }
}
