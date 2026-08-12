import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

/**
 * 요청 body/query를 Zod 스키마로 파싱하는 범용 검증 파이프.
 * class-validator 대신 Zod로 통일 — 라우트별로 형태가 다른 쿼리 파라미터(콤마 다중값 등)를
 * 스키마 단위로 재사용 가능하게 다루기 위함.
 * 컨트롤러 핸들러에 `@UsePipes(new ZodValidationPipe(schema))`로 스키마별 바인딩한다.
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      // 에러 규약: { statusCode, error, message } — message에 필드별 사유를 압축해 담는다.
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`)
        .join(', ');
      throw new BadRequestException(message);
    }
    return result.data;
  }
}
