import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users') // => /users
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ResponseMessage("Create a new user")
  @Post()
  create(@Body() hoidanit: CreateUserDto, @User() user: IUser) {

    return this.usersService.create(hoidanit, user);
  }

  @ResponseMessage("fetch user with pagnite")
  @Get()
  findAll(@Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage("Fetch user by id")
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }


  @ResponseMessage("Update a User")
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @ResponseMessage("Delete a User")
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
