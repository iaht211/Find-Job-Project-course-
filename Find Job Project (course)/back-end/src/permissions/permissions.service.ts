import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>
  ) { }
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    let { name, apiPath, method, module } = createPermissionDto;
    const isExist = await this.permissionModel.findOne({ apiPath, method });
    if (isExist) {
      throw new BadRequestException(`Permissions voi apiPath=${apiPath} , method=${method} da ton tai`)
    }
    const newPermission = await this.permissionModel.create({
      name, apiPath, method, module,
      createdBy: {
        _id: user.name,
        email: user.email
      }
    })
    return {
      _id: newPermission?._id,
      createdAt: newPermission?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize
    let offset = (+currentPage - 1) * (+limit)
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel.find(filter)
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
      throw new BadRequestException("not found permission")
    }
    return await this.permissionModel.findById(id);
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("not found permsion")
    }
    const { name, apiPath, method, module } = updatePermissionDto
    const updated = await this.permissionModel.updateOne(
      { _id: id },
      {
        name, apiPath, method, module,
        updatedBy: {
          _id: user._id,
          email: user.email
        },

      }
    )
    return updated;
  }

  async remove(id: string, user: IUser) {
    await this.permissionModel.updateOne({ _id: id },
      {
        updatedAt: new Date,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
    const deleted = await this.permissionModel.softDelete({ _id: id })
    return deleted;
  }
}
