export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

export interface TemplateOptions {
    title: string;
    includeHeaders: boolean;
    dateFormat: string;
}