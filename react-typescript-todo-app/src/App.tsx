import React, { useState } from 'react';

import TodoList from './components/TodoList';
import NewTodo from './components/NewTodo';
import { Todo } from './todo.model';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    // OK sollution
    // setTodos([...todos, {id: Math.random().toString(), text}]);

    // Better sollution
    setTodos(prevTodos => [...prevTodos, {id: Math.random().toString(), text}]);
  };

  const removeTodo = (todoId: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
  };

  return (
    <div className="App">
      <NewTodo addTodo={addTodo} />
      <TodoList items={todos} removeTodo={removeTodo} />
    </div>
  );
}

export default App;
