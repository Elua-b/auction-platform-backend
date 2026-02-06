import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(id: string): Promise<void> {
        await this.userRepository.delete(id);
    }
}
