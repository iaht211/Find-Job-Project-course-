import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeCvDto, CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  @ResponseMessage("Create a new resume")
  @Post()
  create(@Body() createResumeCvDto: CreateResumeCvDto, @User() user: IUser) {
    return this.resumesService.create(createResumeCvDto, user);
  }

  @ResponseMessage("Fetch all resumes with paginate")
  @Get()
  findAll(@Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string) {
    return this.resumesService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage("Fetch a resume by id")
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update status resume")
  update(@Param('id') id: string, @Body() updateResumeDto: UpdateResumeDto, @User() user: IUser) {
    return this.resumesService.update(id, updateResumeDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a resume by id")
  remove(@Param('id') id: string) {
    return this.resumesService.remove(id);
  }

  @ResponseMessage("get a resume by id")
  @Post('by-user')
  getResumesByUser(@User() user: IUser) {
    return this.resumesService.findByUsers(user);
  }
}
