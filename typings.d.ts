import { Models } from "./node_modules/appwrite/types/models";

interface Board { 
    columns: Map<TypedColumn, Column> 
}

type TypedColumn = "todo" | "inprogress" | "done"

interface Column {
    id: TypedColumn;
    todos: Todo[];
}

interface Todo {
    $id: string;
    $createdAt: String;
    title: string;
    status: TypedColumn;
    image?: string;
}

interface Image {
    bucketId: string;
    fileId: string;
}

