import { type User } from "src/user/mock-users";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}