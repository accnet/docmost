import { BadRequestException } from '@nestjs/common';

export class ConfluenceImportService {
  async processConfluenceImport() {
    throw new BadRequestException(
      'Confluence import is not available in this OSS build.',
    );
  }
}
