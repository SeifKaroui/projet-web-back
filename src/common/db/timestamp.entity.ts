import { Exclude } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export class TimeStampEntity {
  @CreateDateColumn({ name: 'created_at', update: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
