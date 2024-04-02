import { BadRequestException, Get, Injectable, Query } from '@nestjs/common';
import { CreateResumeCvDto, CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>
  ) { }

  async create(createResumeCvDto: CreateResumeCvDto, user: IUser) {
    const result = await this.resumeModel.create({
      ...createResumeCvDto,
      email: user.email,
      userId: user._id,
      status: "PENDING",
      createdBy: {
        _id: user._id,
        email: user.email
      },
      history: [
        {
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ]
    })
    return {
      _id: result.id,
      createdAt: result.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit)
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`not found comany with id`)
    }
    return await this.resumeModel.findById(id);
  }

  async update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    return await this.resumeModel.updateOne({ _id: id }, {
      status: updateResumeDto.status,
      updatedBy: {
        _id: user._id,
        email: user.email
      },
      $push: {
        history: {
          status: updateResumeDto.status,
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            emaiol: user.email
          }
        }
      }
    })
  }

  remove(id: string) {
    return this.resumeModel.softDelete({ _id: id })
  }

  async findByUsers(user: IUser) {
    return await this.resumeModel.find({ userId: user._id })
      .sort("-createdAt")
      .populate([
        {
          path: "companyId",
          select: { name: 1 }
        },
        {
          path: "jobId",
          select: { name: 1 }
        }
      ])
  }
}
