import { BadRequestException } from '@nestjs/common';

export class DocxImportService {
  async convertDocxToHtml() {
    throw new BadRequestException(
      'DOCX import is not available in this OSS build.',
    );
  }
}
