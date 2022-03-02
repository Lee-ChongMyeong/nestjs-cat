import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsController } from './controller/cats.controller';
import { Cat, CatSchema } from './cats.schema';
import { CatsService } from './services/cats.service';
import { CatsRepository } from './cats.repository';
import { AuthModule } from 'src/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { Comments, CommentsSchema } from 'src/comments/comments.schema';
import { MulterExtendedModule } from 'nestjs-multer-extended';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MulterModule.register({
      dest: './upload',
    }),
    MulterExtendedModule.register({
      awsConfig: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY,
        region: process.env.AWS_S3_REGION,
        // ... any options you want to pass to the AWS instance
      },
      bucket: process.env.AWS_S3_BUCKET_NAME,
      basePath: 'cis',
      fileSize: 1 * 1024 * 1024,
    }),

    MongooseModule.forFeature([
      { name: Comments.name, schema: CommentsSchema }, // Cat 안에서 comment 사용할것임.
      { name: Cat.name, schema: CatSchema },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [CatsController],
  providers: [CatsService, CatsRepository],
  exports: [CatsService, CatsRepository],
})
export class CatsModule {}
