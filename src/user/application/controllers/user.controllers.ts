import { Controller, Post, Body, Get, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { CreateUserUseCase } from '../../data/use-cases/createUser.usecase';
import { GetUsersUseCase } from '../../data/use-cases/getUsers.usecase';
import { GetUserUseCase } from '../../data/use-cases/getUser.usecase';
import { UpdateUserUseCase } from '../../data/use-cases/updateUser.usecase';
import { DeleteUserUseCase } from '../../data/use-cases/deleteUser.usecase';
import { CreateUserDto } from 'src/user/dtos/createUser.dto';
import { UpdateUserDto } from 'src/user/dtos/updateUser.dto';
import { UserEntity } from '../../domains/entities/user.entity';
import { LoginUserDto } from 'src/user/dtos/loginUser.dto';
import { LoginUserUseCase } from '../../data/use-cases/loginUser.usecase';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) { }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    return await this.loginUserUseCase.execute(loginUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<any> {
    return await this.createUserUseCase.execute(createUserDto);
  }


  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll(): Promise<UserEntity[]> {
    return await this.getUsersUseCase.execute();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<UserEntity | null> {
    return await this.getUserUseCase.execute(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return await this.updateUserUseCase.execute(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }
}
