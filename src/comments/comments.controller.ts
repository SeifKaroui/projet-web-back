import { Controller, Post, Body, Delete, Param, Get, Put } from '@nestjs/common';
import { CommentService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    // Add a comment to a post by a user
    @Post()
    async addComment(@Body() createCommentDto: CreateCommentDto) {
        const userId = "107fcda6-ebfc-4135-a1dd-e1003e608619";
        const postId = 7
        return this.commentService.createComment(createCommentDto, userId, postId);
    }

    // Get all comments for a specific post
    @Get('comments/:postId')
    async getCommentsForPost(@Param('postId') postId: number) {
        return this.commentService.findAllByPost(postId);
    }

    // Delete a comment
    @Delete(':id')
    async deleteComment(@Param('id') id: number) {
        await this.commentService.softDelete(id);
        return { message: 'Comment deleted successfully' };
    }
}