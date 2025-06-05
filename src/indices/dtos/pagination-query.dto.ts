// import { Transform } from 'class-transformer';
// import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDTO {
  // @Transform(({ value }) => parseInt(value))
  // @IsOptional()
  // @IsNumber()
  // @Min(1)
  page: number = 1;

  // @Transform(({ value }) => parseInt(value))
  // @IsOptional()
  // @IsNumber()
  // @Min(1)
  // @Max(50)
  limit: number = 10;
}

// Không dùng vì deploy bị out memory
