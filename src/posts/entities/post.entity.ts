import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
  } from 'typeorm';
  import { Teacher } from '../../users/entities/user.entity';
  import { Course } from '../../courses/entities/course.entity';
  import { Comment } from '../../comments/entities/comment.entity';
  
  @Entity()
  export class Post {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'text' })
    content: string;
  
    @CreateDateColumn()
    date: Date;
  
    @ManyToOne(() => Teacher, (teacher) => teacher.posts)
    author: Teacher;
  
    @ManyToOne(() => Course, (course) => course.posts)
    course: Course;
  
    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];
  }