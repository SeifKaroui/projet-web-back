import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/common/generics/crud.service';
import { Homework } from './entities/homework.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class HomeworkService extends CrudService<Homework> {
    constructor(
        @InjectRepository(Homework)
        public homeworkRepository: Repository<Homework>
    ) {
        super(homeworkRepository);
    }
    

}
