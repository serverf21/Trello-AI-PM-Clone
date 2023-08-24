import { database, ID, storage } from '@/appwrite';
import { getTodosGroupedByColumn } from '@/lib/getTodosGroupedByColumn';
import uploadImage from '@/lib/uploadImage';
import { Board, Image, Todo, TypedColumn } from '@/typings';
import { todo } from 'node:test';
import { create } from 'zustand';

interface BoardState {
  board: Board;
  getBoard: () => void;
  setBoardState: (board: Board) => void;
  updateTodoInDB: (todo: Todo, columnId: TypedColumn) => void;
  searchString: string;
  newTaskInput: string;
  setNewTaskInput: (input: string) => void;
  setSearchString: (searchString: string) => void;
  deleteTask: (taskIndex: number, todoId: Todo, id: TypedColumn) => void;
  setNewTaskType: (columnId: TypedColumn) => void;
  newTaskType: TypedColumn;
  image: File | null;
  setImage: (image: File | null) => void;
  addTask: (todo: string, columnId: TypedColumn, image?:File | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
    board: {
        columns: new Map<TypedColumn, Column>()
    },
    // Search bar logic
    searchString: "",
    newTaskInput: "",
    image: null,
    setSearchString: (searchString) => set({searchString}),
    newTaskType: "todo", 
    getBoard: async () => {
        const board = await getTodosGroupedByColumn();
        set({board});
    },
    // for shifting of entire column
    setBoardState: (board) => set({board}),

    deleteTask: async(taskIndex: number, todo: Todo, id: TypedColumn) => {
        const newColumns = new Map(get().board.columns);
        // delete todoID
        newColumns.get(id)?.todos.splice(taskIndex, 1);

        set({board: {columns: newColumns}});

        if(todo.image){
            await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
        }
        await database.deleteDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
            todo.$id
        );
    },

    updateTodoInDB: async(todo, columnId) => {
        await database.updateDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
            todo.$id,
            {
                title: todo.title,
                status: columnId
            }
        );
    },
    setNewTaskInput: (input: string) => set({newTaskInput: input}),
    setNewTaskType: (columnId: TypedColumn) => set({newTaskType: columnId}),
    setImage: (image: File | null) => set({image}),
    addTask: async(todo: string, columnId: TypedColumn, image?:File | null) => {
        let file: Image | undefined;

        if(image){
            const fileUploaded = await uploadImage(image);
            if(fileUploaded){
                file = {
                    bucketId: fileUploaded.bucketId,
                    fileId: fileUploaded.$id
                };
            }
        }
        const {$id} = await database.createDocument(
            process.env.NEXT_PUBLIC_DATABASE_ID!,
            process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
            ID.unique(),
            {
                title: todo,
                status: columnId,
                // include images if it exists
                ...(file && {image: JSON.stringify(file)}),
            }
        );
        set({newTaskInput: ""});
        set((state) => {
            const newColumns = new Map(state.board.columns);

            const newTodo: Todo = {
                $id,
                $createdAt: new Date().toISOString(),
                title: todo,
                status: columnId,
                // include image if it exists
                ...(file && {image: file}),
            };
            
            const column = newColumns.get(columnId);
            if(!column){
                newColumns.set(columnId, {
                    id: columnId,
                    todos: [newTodo],
                });
            } else {
                newColumns.get(columnId)?.todos.push(newTodo);
            }
            return {
                board: {
                    columns: newColumns,
                }
            }
        })
    },
}));
