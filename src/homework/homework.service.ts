import {  Inject, Injectable, Req } from '@nestjs/common';
import { CrudService } from 'src/common/generics/crud.service';
import { Homework } from './entities/homework.entity';
import { DeepPartial, Repository } from 'typeorm';
import { ID } from 'src/common/generics/has-id.interface';
import { UploadsService } from 'src/uploads/uploads.service';
import { Upload } from 'src/uploads/entities/upload.entity';
import { InjectRepository } from '@nestjs/typeorm';



@Injectable()
export class HomeworkService extends CrudService<Homework> {
    constructor(
        private readonly uploadsService: UploadsService,
        @InjectRepository(Homework)
        public homeworkRepository: Repository<Homework>
    ) {
        super(homeworkRepository);
    }
    async create_hw(addDto: DeepPartial<Homework>,files:Express.Multer.File[]): Promise<Homework> {
        const uploads:Upload[]= await this.uploadsService.saveFiles(files);
        return super.create({...addDto,files:uploads});      
    }
    async update_hw(id: ID, updateDto: DeepPartial<Homework>,files:Express.Multer.File[]): Promise<Homework> {
        const uploads:Upload[]= await this.uploadsService.saveFiles(files);
        return super.update(id, {...updateDto, files: uploads});
    }
}

