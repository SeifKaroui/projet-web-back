import { Repository, FindOneOptions, FindManyOptions, DeepPartial, In } from 'typeorm';
import { NotFoundException,Injectable } from '@nestjs/common';
@Injectable()
export class BaseCrudService<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async findOne(options: FindOneOptions<T>): Promise<T> {
    const item = await this.repository.findOne(options);
    if (!item) throw new NotFoundException();
    return item;
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: any, data: DeepPartial<T>): Promise<T> {
    await this.repository.update(id, data as any);
    return this.findOne({ where: { id } as any });
  }

  async softDelete(id: any): Promise<void> {
    const result = await this.repository.softDelete(id);
    if (!result.affected) throw new NotFoundException();
  }
}
