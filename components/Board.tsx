"use client";
import { useBoardStore } from '@/store/BoardStore';
// import { Column } from '@/typings';
import { useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import Column from './Column';

const Board = () => {
    const [board, getBoard, setBoardState, updateTodoInDB] = useBoardStore((state) => [
        state.board,
        state.getBoard,
        state.setBoardState,
        state.updateTodoInDB
    ]);
    
    useEffect(() => {
        getBoard();        
    }, [getBoard])
    // console.log(board);

    const handleOnDragEnd = (result: DropResult) => {
        const {destination, source, type} = result;
        // check if outside the box
        if(!destination) return;
        // handle entire column drag
        if(type === 'column'){
            const entries = Array.from(board.columns.entries());
            const [removed] = entries.splice(source.index, 1);
            entries.splice(destination.index, 0, removed);
            const rearrangedColumns = new Map(entries);
            setBoardState({
                ...board, columns: rearrangedColumns
            })
        }
        // handle tiles drag and drop
        // Indices are stored as numbers 0,1,2. Instead of ids with DND library.
        const columns = Array.from(board.columns);
        const startColIndex: any = columns[Number(source.droppableId)];
        const finishColIndex: any = columns[Number(destination.droppableId)];

        const startCol: Column = {
            id: startColIndex[0],
            todos: startColIndex[1].todos,
        }
        const finishCol: Column = {
            id: finishColIndex[0],
            todos: finishColIndex[1].todos,
        }
        if(!startCol || !finishCol) return;

        if(source.index === destination.index && startCol === finishCol)
            return;
        
        const newTodos = startCol.todos;
        const [todoMoved] = newTodos.splice(source.index, 1);
        if(startCol.id === finishCol.id){
            // Same column task drag
            newTodos.splice(destination.index, 0, todoMoved);
            const newCol = {
                id: startCol.id,
                todos: newTodos,
            };
            const newColumns = new Map(board.columns);
            newColumns.set(startCol.id, newCol);
            setBoardState({...board, columns: newColumns});

        } else {
            // to another column
            const finishTodos = Array.from(finishCol.todos);
            finishTodos.splice(destination.index, 0, todoMoved);
            const newColumns = new Map(board.columns);
            const newCol = {
                id: startCol.id,
                todos: newTodos
            };
            newColumns.set(startCol.id, newCol);
            newColumns.set(finishCol.id, {
                id: finishCol.id,
                todos: finishTodos
            })
            // TODO: Update in DB later
            updateTodoInDB(todoMoved, finishCol.id);
            
            setBoardState({...board, columns: newColumns});
        }
        
    }

  return (
    <div>
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="board" direction="horizontal" type="column">
                {
                    (provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto"
                        >   
                            {
                                Array.from(board.columns.entries()).map(([id, column], index) => (
                                    <Column 
                                        key={id}
                                        id={id}
                                        todos={column.todos}
                                        index={index}
                                    />
                                ))
                            }
                        </div>
                    )
                }
            </Droppable>    
        </DragDropContext>
    </div>
  )
}

export default Board