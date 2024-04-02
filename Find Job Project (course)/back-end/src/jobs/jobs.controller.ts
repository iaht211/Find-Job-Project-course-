import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @ResponseMessage("Create a job")
  @Post()
  create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return this.jobsService.create(createJobDto, user);
  }

  @ResponseMessage("Fetch job with paginate")
  @Get()
  @Public()
  findAll(@Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string) {
    return this.jobsService.findAll(+currentPage, +limit, qs);
  }


  @ResponseMessage("Fetch job by id")
  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @ResponseMessage("Update a job")
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @User() user: IUser) {
    console.log("sdfgsdfgsd")
    const result = await this.jobsService.update(id, updateJobDto, user);
    return result
  }

  @ResponseMessage("Delete a job")
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.jobsService.remove(id, user);
  }
}
