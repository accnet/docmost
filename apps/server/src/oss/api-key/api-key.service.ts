import { UnauthorizedException } from '@nestjs/common';

export class ApiKeyService {
  async validateApiKey() {
    throw new UnauthorizedException('API keys are not available');
  }
}
