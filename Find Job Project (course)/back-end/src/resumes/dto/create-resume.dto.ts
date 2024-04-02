import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
    @IsNotEmpty({ message: 'Email không được để trống', })
    email: string;

    @IsNotEmpty({ message: 'userId không được để trống', })
    userId: string;

    @IsNotEmpty({ message: 'url không được để trống', })
    url: string;

    @IsNotEmpty({ message: 'status không được để trống', })
    status: string;

    @IsNotEmpty({ message: 'companyId không được để trống', })
    companyId: string;

    @IsNotEmpty({ message: 'jobId không được để trống', })
    jobId: string;

    @IsNotEmpty({ message: 'history không được để trống', })
    history: any[];

}

export class CreateResumeCvDto {
    @IsNotEmpty({ message: 'url không được để trống', })
    url: string;

    @IsNotEmpty({ message: 'companyId không được để trống', })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'jobId không được để trống', })
    jobId: mongoose.Schema.Types.ObjectId;

}