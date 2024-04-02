import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // tạO jwt global thay cho phần hướng dẫn import ở trong app module
  // nếu như mà không có @Public thì cần kiểm tra jwt để lấy thông tin từ đó gán vào req.user
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  // để có thể trả ra dữ liệu với khuôn dạng 
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // config versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2']
  });

  // somewhere in your initialization file 
  //config cookie
  app.use(cookieParser());

  app.useStaticAssets(join(__dirname, '..', 'public')); //js, css, images
  app.setBaseViewsDir(join(__dirname, '..', 'views')); //view 
  app.setViewEngine('ejs');


  //lấy ra phần dữ liệu ở phần req
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));

  // config cors
  app.enableCors({
    "origin": true,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    credentials: true
  });

  //config swagger 

  const config = new DocumentBuilder()
    .setTitle('NestJs Series APIs Document')
    .setDescription('All module APIs')
    .setVersion('1.0')
    //.addTag('cats')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(configService.get<string>('PORT'));
}
bootstrap();
