import { IsArray, IsEmail, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";
export class CreateSubscriberDto {
    @IsNotEmpty({ message: 'Name không được để trống', })
    name: string;

    @IsNotEmpty({ message: 'email không được để trống', })
    @IsEmail({}, {message: 'email khong dung dinh dang '})
    email: string;

    @IsNotEmpty({ message: 'email không được để trống', })
    @IsArray({message: 'can co dinh dang la array'})
    skills: string[];

}
