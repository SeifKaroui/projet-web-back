import { Controller, Post, Body, Delete, Param, Get, Put, ParseIntPipe } from '@nestjs/common';
import { CommentService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtUser } from 'src/auth/interfaces/jwt-user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('courses/posts')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    // Add a comment to a post by a user
    @Post(":postId/comments")
    async addComment(@Param("postId", ParseIntPipe) postId: number, @GetUser() user: JwtUser, @Body() createCommentDto: CreateCommentDto) {
        return this.commentService.createComment(createCommentDto, user.id, postId);
    }

    // Get all comments for a specific post
    @Get('comments/:postId')
    async getCommentsForPost(@Param('postId') postId: number) {
        return this.commentService.findAllByPost(postId);
    }


    @Delete(':postId/comments/:id')
    async deleteComment(
        @Param('postId', ParseIntPipe) postId: number,
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.commentService.deleteComment(id);
        return { message: 'Comment deleted successfully' };
    }
}