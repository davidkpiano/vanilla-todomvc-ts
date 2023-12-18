import { assign, setup, fromPromise, and, or, not } from 'xstate';

const fetchLogic = fromPromise(async ({ input }: { input: string }) => {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos');
  const json = await response.json();
  return json as Array<{}>;
});

interface Todo {
  completed: boolean;
}

export const tourMachine = setup({
  types: {
    events: {} as
      | { type: 'todo.added' }
      | { type: 'todo.updated'; todo: Todo }
      | { type: 'todo.removed' },
  },
  actors: {
    fetchLogic,
  },
  actions: {
    greet: (_, params: { message: string }) => {},
  },
  guards: {
    todoIsCompleted: (_, params: { todo: Todo }) => {
      return params.todo.completed;
    },
  },
}).createMachine({
  context: {
    count: 0,
  },
  entry: {
    type: 'greet',
    guard: and([
      {
        type: 'todoIsCompleted',
      },
      () => false,
    ]),
    params: { message: 'Hello, World!' },
  },
  id: 'tour',
  initial: 'start',
  states: {
    start: {
      description: `Let's get started. Add a todo first.`,
      on: {
        'todo.added': {
          target: 'todo added',
        },
      },
    },
    'todo added': {
      description: `Great! Now let's complete that todo.`,
      on: {
        'todo.updated': {
          guard: {
            type: 'todoIsCompleted',
            params: ({ event }) => ({ todo: event.todo }),
          },
          target: 'todo completed',
        },
      },
    },
    'todo completed': {
      description: `Wonderful! Now let's remove that todo.`,
      on: {
        'todo.removed': {
          target: 'todo removed',
        },
      },
    },
    'todo removed': {
      description: `Splendid! You have completed the tour.`,
      on: {
        'todo.added': {
          actions: assign({ count: ({ context }) => context.count + 1 }),
        },
      },
      always: {
        guard: ({ context }) => context.count >= 10,
        target: 'expert',
      },
      invoke: {
        src: 'fetchLogic',
        input: 'a string',
      },
    },
    expert: {
      description: `Wow, you are a todo expert!!!`,
    },
    'got stuff': {
      description: `I got a bunch of todos`,
    },
  },
});
