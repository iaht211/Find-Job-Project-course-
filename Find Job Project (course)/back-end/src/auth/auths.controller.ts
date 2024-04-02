import { Controller, Post, UseGuards, Get, Body, Res, Req } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { Response, Request } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth') //  route /
export class AuthController {
    constructor(
        private authService: AuthService,
        private rolesService: RolesService
    ) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @UseGuards(ThrottlerGuard)
    @ApiBody({ type: UserLoginDto, })
    @Post('/login')
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }

    // @UseGuards(JwtAuthGuard)

    @Get('profile')
    getProfile(@Req() req) {
        return req.user;
    }

    // register user
    @Public()
    @ResponseMessage("Register a new user")
    @Post('/register')
    registerUser(@Body() createUserDto: RegisterUserDto) {
        return this.authService.register(createUserDto);
    }

    @ResponseMessage("Get user information")
    @Get('/account')
    async handleGetAccount(@User() user: IUser) {
        const temp = await this.rolesService.findOne(user.role._id) as any;
        user.permissions = temp.permissions;
        return { user };
    }

    @Public()
    @ResponseMessage("Get user information")
    @Get('/refresh')
    handleFreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies["refresh_token"];
        return this.authService.precessNewToken(refreshToken, response);
        //return { refreshToken };
    }

    @ResponseMessage("Logout user")
    @Post('/logout')
    handleLogout(@Res({ passthrough: true }) response: Response, @User() user: IUser) {
        return this.authService.logout(response, user);

    }
}
