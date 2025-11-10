import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAccessTokenGuard } from './guards/jwt-access_token.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAccessTokenGuard)
  @Get('protected')
  protectedRoute(): string {
    return "This route is protected";
  }
}
