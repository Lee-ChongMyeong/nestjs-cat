import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Body,
  Req,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { Controller, Get, Post, Put } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';
import { SuccessInterceptor } from 'src/common/interceptors/success.interceptor';
import { CatsService } from '../services/cats.service';
import { CatRequestDto } from '../dto/cats.request.dto';
import { ReadOnlyCatDto } from '../dto/cat.dto';
import { AuthService } from 'src/auth/auth.service';
import { LoginRequestDto } from 'src/auth/dto/login.request.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/utils/multer.options';
import { Cat } from '../cats.schema';
import { AmazonS3FileInterceptor } from 'nestjs-multer-extended';

@Controller('cats')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class CatsController {
  constructor(
    // dependency injection
    private readonly catsService: CatsService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: '현재고양이 가져오기' })
  @UseGuards(JwtAuthGuard) // 인증처리를 해줌
  @Get()
  getCurrentCat(@CurrentUser() cat) {
    // cat 이 request.user 가 됨.
    return cat.readOnlyData;
  }

  @ApiResponse({
    status: 500,
    description: 'Server Error...',
  })
  @ApiResponse({
    status: 200,
    description: '성공!',
    type: ReadOnlyCatDto,
  })
  @ApiOperation({ summary: '회원가입' })
  @Post()
  async signUp(@Body() body: CatRequestDto) {
    console.log(body);
    return await this.catsService.signUp(body);
  }

  @ApiOperation({ summary: '로그인' })
  @Post('login')
  logIn(@Body() data: LoginRequestDto) {
    return this.authService.jwtLogIn(data);
  }

  @ApiOperation({ summary: '고양이 이미지 업로드' })
  // @UseInterceptors(FilesInterceptor('image', 10, multerOptions('cats'))) // 최대 10개, cats 폴더안에 생성
  @UseInterceptors(
    // s3
    AmazonS3FileInterceptor('image', {
      dynamicPath: 'cats',
    }),
  )
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  uploadCatImg(
    // @UploadedFiles() files: Array<Express.Multer.File>,
    @UploadedFile() file: any,
    @CurrentUser() cat: Cat, // 현재 로그인된 고양이에 대한 정보 가져올수 있게 됨.
  ) {
    console.log(file);
    // return 'uploadImg';
    // return { image: `http://localhost:8000/media/cats/${files[0].filename}` };
    return this.catsService.uploadImg(cat, file); // cat : 현재 내 정보
  }

  @ApiOperation({ summary: '모든 고양이 가져오기 ' })
  @Get('all')
  getAllCat() {
    return this.catsService.getAllCat();
  }
}
