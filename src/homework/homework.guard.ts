import { CanActivate, ExecutionContext, ForbiddenException, Get, Injectable, Logger } from "@nestjs/common";
import { Homework } from "./entities/homework.entity";

@Injectable()
export class TeacherGuard implements CanActivate {
    constructor() { }
    canActivate(context: ExecutionContext): boolean {
        Logger.log('TeacherGuard');
        const request = context.switchToHttp().getRequest();
        const  homework:Partial<Homework> = request.body
        const user = request.user;
        if (user['type'] == "teacher" ) {
            return true;
        }
        throw new ForbiddenException('Only teachers are allowed to access this resource');
        
    }
}
