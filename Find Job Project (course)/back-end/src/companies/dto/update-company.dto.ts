import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
    @IsNotEmpty({ message: 'name không được để trống', })
    name: string;

    @IsNotEmpty({ message: 'address không được để trống', })
    address: string;

    @IsNotEmpty({ message: 'description không được để trống', })
    description: string;

    // @IsNotEmpty({ message: 'logo không được để trống', })
    // logo: string;
}
