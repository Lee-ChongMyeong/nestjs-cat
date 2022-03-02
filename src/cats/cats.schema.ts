import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Document, SchemaOptions } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Comments } from 'src/comments/comments.schema';

const options: SchemaOptions = {
  timestamps: true, // db 에서 하나가 만들어질때 타임스탬프 찍어줌.
};

@Schema(options)
export class Cat extends Document {
  @ApiProperty({
    example: 'amamov@kakao.com',
    description: 'email',
    required: true,
  })
  @Prop({
    required: true,
    unique: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'amamov',
    description: 'name',
    required: true,
  })
  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '23760',
    description: 'password',
    required: true,
  })
  @Prop({
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @Prop({
    default:
      'https://raw.githubusercontent.com/amamov/teaching-nestjs-a-to-z/main/images/1.jpeg',
  })
  @IsString()
  imgUrl: string;

  readonly readOnlyData: {
    id: string;
    email: string;
    name: string;
    imgUrl: string;
  };

  readonly comments: Comments[];
}

export const _CatSchema = SchemaFactory.createForClass(Cat);

_CatSchema.virtual('readOnlyData').get(function (this: Cat) {
  return {
    id: this.id,
    email: this.email,
    name: this.name,
    imgUrl: `https://nestjscat.s3.us-east-2.amazonaws.com/${this.imgUrl}`,
    comments: this.comments,
  };
});

_CatSchema.virtual('comments', {
  // populate 와 연결되는 이름
  ref: 'comments', // 스키마 이름(collection name)
  localField: '_id',
  foreignField: 'info',
});
// populate 사용하기 위한 옵션 2개
_CatSchema.set('toObject', { virtuals: true }); // 객체로 변환 가능
_CatSchema.set('toJSON', { virtuals: true }); // Json 형태로 변환 가능 하다.

export const CatSchema = _CatSchema;
