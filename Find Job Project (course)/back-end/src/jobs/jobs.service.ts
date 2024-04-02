import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>
  ) { }

  async create(createJobDto: CreateJobDto, user: IUser) {
    let { name, location, skills, salary, quantity, level, description, company } = createJobDto;
    console.log(skills)
    let newJob = await this.jobModel.create({
      name, location, skills, salary, quantity, level, description, company
    })

    return {
      _id: newJob._id,
      createAt: newJob.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit)
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }

  }
  async findOne(id: string) {
    return await this.jobModel.findById(id);
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const result = await this.jobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    console.log(result)
    return result;
  }

  async remove(id: string, user: IUser) {
    const temp = await this.jobModel.updateOne({ _id: id },
      {
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
    const result = await this.jobModel.softDelete({ _id: id })
    return result;
  }
}
