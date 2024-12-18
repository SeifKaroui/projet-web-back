import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { CrudService } from 'src/common/generics/crud.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService extends CrudService<Comment> {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super(commentRepository);
    }

    // Create a comment
    async createComment(createCommentDto: CreateCommentDto, userId: string, postId: number): Promise<Comment> {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const comment = this.commentRepository.create({
            content: createCommentDto.content,
            post: post,
            author: user,
        });

        return super.create(comment)
    }

    // Get all comments for a specific post
    async findAllByPost(postId: number): Promise<Comment[]> {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');

        return this.commentRepository.find({
            where: { post: post },
            relations: ['author'],
        });
    }
}