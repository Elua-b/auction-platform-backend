import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../data/repositories/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userRepository: UserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'secret', // matching user.module
        });
    }

    async validate(payload: any) {
        const user = await this.userRepository.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        // Return user object which will be injected into request
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleId,
            role: user.role?.name
        };
    }
}
