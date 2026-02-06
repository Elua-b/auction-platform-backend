import { UserEntity } from '../entities/user.entity';

export interface UserRepositoryInterface {
  create(user: UserEntity): Promise<void>;
  findAll(): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  update(id: string, user: Partial<UserEntity>): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
