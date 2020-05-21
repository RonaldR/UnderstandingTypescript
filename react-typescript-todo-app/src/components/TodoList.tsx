import React from 'react';

import { Todo } from '../todo.model';

import './TodoList.css';

interface Props {
    items: Todo[];
    removeTodo: (id: string) => void;
}

const TodoList: React.FC<Props> = ({items, removeTodo}) => {
    return <ul>
        {items.map(todo => (
            <li key={todo.id}>
                <span>{todo.text}</span>
                <button onClick={() => removeTodo(todo.id)}>Remove</button>
            </li>
        ))}
    </ul>;
};

export default TodoList