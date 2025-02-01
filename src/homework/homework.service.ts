import {  ForbiddenException, Inject, Injectable, Logger, NotFoundException, Req } from '@nestjs/common';
import { CrudService } from 'src/common/generics/crud.service';
import { Homework } from './entities/homework.entity';
import { DeepPartial, Repository, UpdateResult } from 'typeorm';
import { ID } from 'src/common/generics/has-id.interface';
import { UploadsService } from 'src/uploads/uploads.service';
import { Upload } from 'src/uploads/entities/upload.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Teacher, User } from 'src/users/entities/user.entity';
import { log } from 'console';
import { CoursesService } from 'src/courses/courses.service';



@Injectable()
export class HomeworkService extends CrudService<Homework> {
    
    constructor(
        private readonly uploadsService: UploadsService,
        private  coursesService: CoursesService,
        @InjectRepository(Homework)
        public homeworkRepository: Repository<Homework>
    ) {
        super(homeworkRepository);
    }
    async create_hw(teacher:Teacher,addDto: DeepPartial<Homework>,files:Express.Multer.File[]): Promise<Homework> {
        const course=await this.coursesService.findOne(addDto["courseId"]);
        if (course['teacher']["id"].localeCompare( teacher['id'])!=0){
            throw new ForbiddenException('You are not the teacher of this course');
        }
        if (files == undefined){
            return super.create({...addDto,teacher:teacher,course:course});
        }
        const uploads:Upload[]= await this.uploadsService.saveFiles(files);
        return super.create({...addDto,teacher:teacher,course:course,files:uploads});      
    }
    //need to be checked
    async update_hw(id: ID, teacher: User, updateDto: DeepPartial<Homework>,files:Express.Multer.File[]): Promise<Homework> {
         const inDb= await this.findOne_(teacher,id);
         if (!inDb){
            throw new ForbiddenException('You are not the teacher of this course');
        }
        if (inDb == undefined){
            throw new NotFoundException('Homework not found');
            
        }
        if (files == undefined){
            return super.update(id, updateDto);
        }
        const uploads:Upload[]= await this.uploadsService.saveFiles(files);
        return super.update(id, {...updateDto, files: uploads});
    }

    async delete_hw(id: ID, teacher: User): Promise<UpdateResult> {
        const inDb= await this.findOne_(teacher,id);
        if (!inDb){
            throw new ForbiddenException('You are not the teacher of this course');
        }
        return super.softDelete(id);
    }

    findAll_(user:User,courseId?:number): Promise<Homework[]> {
        if (user['type'] == 'teacher'){
            return this.findAll_teacher(user['id'],courseId);
        }
        
        return this.findAll_student(user['id'],courseId);
    }
    findAll_student(StudentId: string,courseId?: number): Promise<Homework[]> {
        const qb = this.homeworkRepository.createQueryBuilder('h');
        qb.leftJoinAndSelect('h.files','f');
        qb.leftJoinAndSelect('h.course','c');
        qb.leftJoin('c.students','s');
        qb.andWhere('s.id = :StudentId',{StudentId});
        qb.andWhere("h.deleted_at IS NULL");
        if (courseId){
            qb.andWhere('c.id = :courseId',{courseId});
        }
        return qb.getMany();
    }
    findAll_teacher(teacherId: string,courseId?:number): Promise<Homework[]> {
        const qb = this.homeworkRepository.createQueryBuilder('h');
        qb.leftJoinAndSelect('h.files','f');
        qb.leftJoinAndSelect('h.course','c');
        qb.andWhere("h.teacherId = :teacherId", { teacherId });
        qb.andWhere("h.deleted_at IS NULL");
        if (courseId){
            qb.andWhere('h.courseId = :courseId',{courseId});
        }
        return qb.getMany();
    }
    findOne_(user:User,id: ID): Promise<Homework> {
        if (user['type'] == 'teacher'){
            return this.findOne_teacher(user['id'],id);
        }
        return this.findOne_student(user['id'],id);

    }
    findOne_student(StudentId: string, id: ID): Promise<Homework> {
        const qb = this.homeworkRepository.createQueryBuilder('h');
        qb.leftJoinAndSelect('h.files','f');
        qb.leftJoin('h.course','c');
        qb.leftJoin('c.students','s');
        qb.andWhere('s.id = :StudentId',{StudentId});
        qb.andWhere('h.id = :id',{id});
        qb.andWhere("h.deleted_at IS NULL");
        
        return qb.getOne();

    }
    findOne_teacher(teacherId: string, id: ID): Promise<Homework> {
        const qb=this.homeworkRepository.createQueryBuilder('h');
        qb.leftJoinAndSelect('h.files','f');
        qb.andWhere("h.teacherId = :teacherId", { teacherId });
        qb.andWhere("h.id = :id", { id });
        qb.andWhere("h.deleted_at IS NULL");
        return qb.getOne();
    }
}
