import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import  { User } from '../../users/entities/user.entity';
  
  @Entity()
  export class Message {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.sentMessages)
    sender: User;
  
    @ManyToOne(() => User, (user) => user.receivedMessages)
    receiver: User;
  
    @Column({ type: 'text' })
    content: string;
  
    @CreateDateColumn()
    date: Date;
  }