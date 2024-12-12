import { TimeStampEntity } from 'src/common/db/timestamp.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('uploads')
export class Upload extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalname: string;

  @Column()
  filename: string;

  @Column()
  size: number;

  @Column()
  mimetype: string;
}
