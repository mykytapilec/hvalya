import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionsService } from './application/subscriptions.service';
import { UpdateSubscriptionDto } from './application/dto/update-subscription.dto';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  getMySubscription(@Request() req: any) {
    return this.subscriptionsService.getMySubscription(req.user.id);
  }

  @Post('me')
  createDefault(@Request() req: any) {
    return this.subscriptionsService.createDefault(req.user.id);
  }

  @Patch('me')
  upgrade(@Request() req: any, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionsService.upgrade(req.user.id, dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.subscriptionsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.subscriptionsService.delete(id);
  }
}