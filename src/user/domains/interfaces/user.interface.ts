export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  roleId: string;
  avatar?: string;
  createdAt?: Date;
}
