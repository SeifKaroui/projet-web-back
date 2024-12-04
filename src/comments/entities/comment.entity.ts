import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
  import { Post } from '../../posts/entities/post.entity';
  
  @Entity()
  export class Comment {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'text' })
    content: string;
  
    @CreateDateColumn()
    date: Date;
  
    @ManyToOne(() => User, (user) => user.comments)
    author: User;
  
    @ManyToOne(() => Post, (post) => post.comments)
    post: Post;
  }