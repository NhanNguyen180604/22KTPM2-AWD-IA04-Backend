import { UserRole } from "./user-role.enum";

export type User = {
    id: number;
    email: string;
    password: string;
    role: UserRole;
};

export const users: User[] = [
    {
        id: 1,
        email: "lucia@gmail.com",
        password: "123456789",
        role: UserRole.USER,
    },
    {
        id: 2,
        email: "liv@gmail.com",
        password: "123456789",
        role: UserRole.USER,
    },
    {
        id: 3,
        email: "lee@gmail.com",
        password: "123456789",
        role: UserRole.USER,
    },
    {
        id: 4,
        email: "nikola@gmail.com",
        password: "123456789",
        role: UserRole.ADMIN,
    },
];