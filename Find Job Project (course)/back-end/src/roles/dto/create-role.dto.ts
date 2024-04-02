import { IsArray, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: 'Name không được để trống', })
    name: string;

    @IsNotEmpty({ message: 'description không được để trống', })
    description: string;

    @IsNotEmpty({ message: 'isActive không được để trống', })
    isActive: boolean;

    @IsArray({ message: "permission co phai la array" })
    @IsNotEmpty({ message: 'permissions không được để trống', })
    permissions: mongoose.Schema.Types.ObjectId[];

}
