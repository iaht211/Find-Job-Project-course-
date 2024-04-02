import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber } from 'rxjs';
import { SubscriberDocument } from './schemas/subscriber.schemas';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subcribersModel: SoftDeleteModel<SubscriberDocument>
  ) { }

  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    const { name, email, skills } = createSubscriberDto;
    const isExist = await this.subcribersModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`email: ${email} da ton tai tren he thong`)
    }
    let newSubs = await this.subcribersModel.create({
      name, email, skills,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: newSubs._id,
      createdAt: newSubs.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * limit;
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.subcribersModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subcribersModel.find(filter)
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("not found subcribers")
    }
    return (await this.subcribersModel.findById(id));

  }

  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    const updated = await this.subcribersModel.updateOne({ email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      },
      {
        upsert: true
      })
    return updated;
  }

  async remove(id: string, user: IUser) {
    const foundSub = await this.subcribersModel.findById(id);

    await this.subcribersModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return this.subcribersModel.softDelete({ _id: id });
  }
  async getSkills(user: IUser) {
    const { email } = user;
    return await this.subcribersModel.findOne({ email }, { skills: 1 })
  }
}
