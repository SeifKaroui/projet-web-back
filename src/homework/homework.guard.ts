import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Homework } from "./entities/homework.entity";
import { Teacher } from "src/users/entities/user.entity";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { JwtUser } from "src/auth/interfaces/jwt-user.interface";

@Injectable()
export class TeacherOwnershipGuard implements CanActivate {
    constructor() { }
    canActivate(
        @GetUser() user: JwtUser,
        context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const  homework:Partial<Homework> = request.body
        if (user &&  user.id === homework.course.teacher.id) {
            return true;
        }
        throw new ForbiddenException('Only teachers are allowed to access this resource');
        
    }
}