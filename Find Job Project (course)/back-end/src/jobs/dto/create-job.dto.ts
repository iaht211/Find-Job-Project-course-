import { Transform, Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';


class Company {
    @IsNotEmpty({ message: "..." })
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: "..." })
    name: string;

    @IsNotEmpty({ message: "..." })
    logo: string;
}

export class CreateJobDto {
    @IsNotEmpty({ message: 'Name không được để trống', })
    name: string;

    @IsNotEmpty({ message: 'Location không được để trống', })
    location: string;

    @IsNotEmpty({ message: 'Description không được để trống', })
    description: string;

    @IsNotEmpty({ message: 'Skill không được để trống', })
    skills: string[];

    @IsNotEmpty({ message: 'Salary không được để trống', })
    salary: number;

    @IsNotEmpty({ message: 'Quality không được để trống', })
    quantity: number;

    @IsNotEmpty({ message: 'Level không được để trống', })
    level: string;

    @IsNotEmpty({ message: 'startDate không được để trống', })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: "startDate không có định dang là date" })
    startDate: string;

    @IsNotEmpty({ message: 'endDate không được để trống', })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: "endDate không có định dang là date" })
    endDate: string;

    // @IsNotEmpty({ message: 'logo không được để trống', })
    // logo: string;


    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}
