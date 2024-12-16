import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Homework } from "./entities/homework.entity";
import { Teacher } from "src/users/entities/user.entity";

@Injectable()
export class TeacherOwnershipGuard implements CanActivate {
    constructor() { }
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const  homework:Partial<Homework> = request.body
        const user = request.user;
        if (user instanceof Teacher &&  user.id === homework.course.teacher.id) {
            return true;
        }
        throw new ForbiddenException('Only teachers are allowed to access this resource');
        
    }
}