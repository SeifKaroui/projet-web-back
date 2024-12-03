import { NotFoundException } from '@nestjs/common';
import { DeepPartial, Repository, UpdateResult } from 'typeorm';
import { HasId, ID } from './has-id.interface';

export class CrudService<Entity extends HasId> {
  constructor(private repository: Repository<Entity>) {}

  findAll(): Promise<Entity[]> {
    return this.repository.find();
  }
  findOne(id: ID): Promise<Entity> {
    return this.repository.findOne({
      where: { id } as any,
    });
  }

  create(addDto: DeepPartial<Entity>): Promise<Entity> {
    return this.repository.save(addDto as any);
  }

  async update(id: ID, updateDto: DeepPartial<Entity>): Promise<Entity> {
    const newProduct = await this.repository.preload({ id, ...updateDto });
    if (!newProduct) throw new NotFoundException(`l'id ${id} n'existe pas`);
    return this.repository.save(newProduct);
  }

  async softDelete(id: ID): Promise<UpdateResult> {
    const result = await this.repository.softDelete(id);
    if (result.affected == 0)
      throw new NotFoundException(`l'id ${id} n'existe pas`);
    return result;
  }
  async restore(id: ID): Promise<UpdateResult> {
    const result = await this.repository.restore(id);
    if (result.affected == 0)
      throw new NotFoundException(`l'id ${id} n'existe pas`);
    return result;
  }
}
