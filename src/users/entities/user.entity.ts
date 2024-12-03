import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TimeStampEntity } from 'src/common/db/timestamp.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User extends TimeStampEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Exclude()
  @Column()
  password: string;
}
