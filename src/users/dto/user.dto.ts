import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProfileDto {
  @ApiProperty({
    example: 'P-002',
    description: 'Código de perfil del usuario',
  })
  @IsString()
  code: string;

  @ApiProperty({ example: 'basic', description: 'Nombre del perfil' })
  @IsString()
  profileName: string;
}

export class CreateUserDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'rodri22@example.com',
    description: 'Correo electrónico',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 25, description: 'Edad del usuario' })
  @IsNumber()
  age: number;

  @ApiProperty({
    type: ProfileDto,
    description: 'Información del perfil del usuario',
  })
  @ValidateNested()
  @Type(() => ProfileDto)
  profile: ProfileDto;
}
