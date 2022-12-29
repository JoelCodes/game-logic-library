# Reducers

What is a reducer?  And why is it a good way to describe the logic of an app?  How can I incorporate this "reducer" into my program?

## 5 Minute Reducers

At its most basic mechanical level, a reducer is just a simple function with the following type signature:

```typescript
type Reducer<TItem, TAggregate> = (runningState:A, currentItem:B) => A;
```

This is a great function for **iterating over a sequence of items and getting some running value**.

For instance, if you have an array of numbers that you want to add up, you might write something like this:

```typescript
const numbers = [12,54,237,-43];

let runningTotal = 0; // 0 is our starting point
for(const number of numbers){
  runningTotal += number
}

console.log('Final Total', runningTotal);
```

But this is also the sort of thing we could do with `Array.prototype.reduce` as well.  We just need a function that'll do what the body of that loop is doing, only instead of **changing a variable**, it will **return a new value**.

```typescript
const addup = (agg:number, item:number):number => agg + item

const runningTotal = numbers.reduce(addup, 0);
```

In fact, let's beef addup with console.logs so that we can see what's happening:

```typescript
const addup = (agg:number, item:number):number => {
  const nextTotal = agg + item;
  console.log(`Adding up ${agg} + ${item} = ${nextTotal}`);
  return nextTotal
}

console.log('Final Total', numbers.reduce(addup, 0));
```

And this would have the following console readout:

```text
Adding up 0 + 12 = 12
Adding up 12 + 54 = 66
Adding up 66 + 237 = 303
Adding up 303 + -43 = 260
Final Total 260
```

So there's three important components here:

1. The sequence of numbers,
2. The initial value ( `0` ), which is the starting point AND the correct response if the array is empty, and
3. The reducer

Here's another example: Imagine we have an array of student objects, and we want to figure out the student with the highest score (or `null` if the array is empty).  How can we do that?

Well, we start with our students.

```typescript
type Student = { name: string, score: number };
const students:Student[] = [
  { name: 'Jeff', score: 59 },
  { name: 'Priya', score: 73 },
  { name: 'Afrothiti', score: 89 },
  { name: 'Kenji', score: 80 }
]
```

Then we write our reducer.  Our aggregate type is `Student | null`, and our item type is `Student`.

```typescript
const studentWithHighestScore = (
  currentHighest:Student|null, 
  currentStudent:Student
) => {
  // If this is the first student, return them
  if(currentHighest === null) return currentStudent;
  // Otherwise, compare the students
  if(currentHighest.score > currentStudent.score) return currentHighest;
  return currentStudent;
}
```

If we ran the student list, we would end up calling `studentWithTheHighestScore` 4 times, as follows:

```text
(null, { name: 'Jeff', score: 59 }) => { name: 'Jeff', score: 59 }

({ name: 'Jeff', score: 59 }, { name: 'Priya', score: 73 }) => { name: 'Priya', score: 73 }

({ name: 'Priya', score: 73 }, { name: 'Afrothiti', score: 89 }) => { name: 'Afrothiti', score: 89 }

({ name: 'Afrothiti', score: 89 }, { name: 'Kenji', score: 80 }) => { name: 'Afrothiti', score: 89 }
```

Each time, the result of the last call becomes the first argument of the next call, until there are no more items.

So how does this pattern apply to applications?

### App Reducers

Okay, you may have noticed that I used the word "sequence" above.  That's really important.  An array is a sequential collection of items.  Unlike a set, where order isn't that important, an array iterates through each of its items, and the order matters.

Well, hold on to your hats, because I'm going to introduce a crazy idea: if an array is a sequence of items in *space* (that is, the space of memory), then we could think of the things that happen to an app as a sequence of actions over *time*.  And a reducer doesn't care whether this is a sequence over time or space.  It just cares that it's a sequence (and sometimes, not even that).

Here's an example.  Imagine a simple little HTML page with a counter and two buttons: Plus and Minus.

<svg viewBox="-150 -50 300 100" style='background: white;'>
  <rect fill='red' width='75' height='50' x='-125' y='-25' stroke='brown' stroke-width='5'/>
  <text font-size='50px' text-anchor='middle' x='-87.5' y='15' fill='white'>+</text>
  <text font-size='50px' text-anchor='middle' y='15'>0</text>
  <rect fill='red' width='75' height='50' x='50' y='-25' stroke='brown' stroke-width='5'/>
  <text font-size='50px' text-anchor='middle' x='87.5' y='15' fill='white'>-</text>
</svg>

```html
<button id='plus-button'>+</button>
<span id='counter'>0</span>
<button id='minus-button'>+</button>
<script>
  let currentCount = 0;
  
  const plusButton = document.querySelector('#plus-button');
  const minusButton = document.querySelector('#minus-button');
  const counter = document.querySelector('#counter');

  plusButton.addEventListener('click', () => {
    currentCount++;
    counter.innerText = currentCount.toString();
  })
  minusButton.addEventListener('click', () => {
    currentCount--;
    counter.innerText = currentCount.toString();
  })
</script>
```

In this example, we let the button handlers be responsible for everything from changing internal state to updating the UI.  So if I want to update more UI, or I want to change rules on how that count can be updated (e.g. forcing the number to stay between 0 and 10), I need to change that in several places.

So, I'm going to create one update function that will take an **action** object, and that action will look like one of the following:

* `{ type: 'PLUS' }`
* `{ type: 'MINUS' }`

```html
<script>
  let currentCount = 0;
  
  const plusButton = document.querySelector('#plus-button');
  const minusButton = document.querySelector('#minus-button');
  const counter = document.querySelector('#counter');

  function update(action){
    switch(action.type){
      case 'PLUS': 
        currentCount++;
        break;
      case 'MINUS':
        currentCount--;
        break;
    }
    counter.innerText = currentCount.toString();
  }

  plusButton.addEventListener('click', () => {
    update({type: 'PLUS' });
  })
  minusButton.addEventListener('click', () => {
    update({type: 'MINUS' });
  })
</script>
```

Okay, that's technically better, I guess.  But I want to be able to write tests to see if the rules of my logic make sense, and a reducer is great for testing.  So, I'm going to write a reducer that returns the correct state as needed, and use that in my update function.

```html
<script>
  let currentCount = 0;
  
  const plusButton = document.querySelector('#plus-button');
  const minusButton = document.querySelector('#minus-button');
  const counter = document.querySelector('#counter');

  function countReducer(currentCount, action){
    switch(action.type){
      case 'PLUS': return currentCount + 1;
      case 'MINUS': return currentCount - 1;
      default: return currentCount
    }
  }
  function update(action){
    currentCount = countReducer(currentCount, action);
    counter.innerText = currentCount.toString();
  }

  plusButton.addEventListener('click', () => {
    update({type: 'PLUS' });
  })
  minusButton.addEventListener('click', () => {
    update({type: 'MINUS' });
  })
</script>
```

Now, it becomes really easy to write a unit test around my app logic:

```ts
describe('countReducer', () => {
  describe('PLUS', () => {
    it('increments the count by 1', () => {
      expect(countReducer(0, {type: 'PLUS'})).toBe(1);
    })
  })
  describe('MINUS', () => {
    it('decrements the count by 1', () => {
      expect(countReducer(0, {type: 'MINUS'})).toBe(-1);
    })
  })
})
```

And if the boss comes around and says, "Make sure to cap the count at 10,"  That's really ease for me to write:

```typescript
describe('countReducer', () => {
  describe('PLUS', () => {
    it('increments the count by 1', () => {
      expect(countReducer(0, {type: 'PLUS'})).toBe(1);
    });
    it('stops at 10', () => {
      expect(countReducer(10, {type: 'PLUS'})).toBe(10);
      expect(countReducer(11, {type: 'PLUS'})).toBe(10);
    });
  });
  describe('MINUS', () => {
    it('decrements the count by 1', () => {
      expect(countReducer(0, {type: 'MINUS'})).toBe(-1);
    });
  });
});
```

```html
<script>
  let currentCount = 0;
  
  const plusButton = document.querySelector('#plus-button');
  const minusButton = document.querySelector('#minus-button');
  const counter = document.querySelector('#counter');

  function countReducer(currentCount, action){
    switch(action.type){
      case 'PLUS': return Math.min(10, currentCount + 1);
      case 'MINUS': return currentCount - 1;
      default: return currentCount
    }
  }
  function update(action){
    currentCount = countReducer(currentCount, action);
    counter.innerText = currentCount.toString();
  }

  plusButton.addEventListener('click', () => {
    update({type: 'PLUS' });
  })
  minusButton.addEventListener('click', () => {
    update({type: 'MINUS' });
  })
</script>
```

These actions are simple, but they also don't have a "payload", that is, some sort of data that goes along with it.  I'm going to rewrite my reducer so that only takes in one type of action.

```html
<script>
  let currentCount = 0;
  
  const plusButton = document.querySelector('#plus-button');
  const minusButton = document.querySelector('#minus-button');
  const counter = document.querySelector('#counter');

  function countReducer(currentCount, action){
    switch(action.type){
      case 'PLUS': return Math.min(10, currentCount + action.amount);
      default: return currentCount
    }
  }
  function update(action){
    currentCount = countReducer(currentCount, action);
    counter.innerText = currentCount.toString();
  }

  plusButton.addEventListener('click', () => {
    update({type: 'PLUS', amount: 1 });
  })
  minusButton.addEventListener('click', () => {
    update({type: 'PLUS', amount: -1 });
  })
</script>
```

Oof!  Now this code is even simpler!  Maybe I'll even make an **action creator**, a function that generates an action given a payload.

```html
<script>
  let currentCount = 0;
  
  const plusButton = document.querySelector('#plus-button');
  const minusButton = document.querySelector('#minus-button');
  const counter = document.querySelector('#counter');

  function countReducer(currentCount, action){
    switch(action.type){
      case 'PLUS': return Math.min(10, currentCount + action.amount);
      default: return currentCount
    }
  }

  function makePlusAction(amount){
    return { type: 'PLUS', amount };
  }

  function update(action){
    currentCount = countReducer(currentCount, action);
    counter.innerText = currentCount.toString();
  }

  plusButton.addEventListener('click', () => {
    update(makePlusAction(1));
  })
  minusButton.addEventListener('click', () => {
    update(makePlusAction(-1));
  })
</script>
```

Now we have a way of describing our application logic that can be easily ported from library to library, and run as well on the back end as the front end!

Also, if we're using action creators, only updating our state from a reducer, and starting with an approved initial state, we have a few guarantees:

1. All of our states and actions should be type-safe (especially if we're using TypeScript)
2. All of our states should be "semantically" correct (i.e., they are valid states given the rules of the reducer)

Unfortunately, we do have a really important limitation here.  A reducer is meant to be a **pure function**, one without any async, randomness, or side effects.  But don't we need to do that?  I mean, isn't an API call async, random, and a side effect?  And don't we... do a lot of those?  We need another tool.

### Middleware

There are a lot of different platforms and libraries that already use this reducer pattern: Redux, `useReducer` in React, `scan` and `reduce` in RxJS, and many, many more. But each of these have really specific app logic to do the other stuff, like middleware in Redux, the `useEffect` in React, and a bajillion other things in RxJS.  But while the code may be different, the general idea is the same: rather than code the impurities into the reducer, we perform the impurities outside, then create actions as a result of those operations and send them through the reducer.

Here's an example: let's say that we have a TodoApp and the first thing it needs to do is fetch all the Todo objects.  Well, we can have a reducer like the following:

```typescript
// todo-app-logic.ts
type Todo = { text:string, id: number, created: Date };
type TodoAppState = { todos: Todo[], loading: boolean };
const initialState:TodoAppState = { todos: [], loading: true, error?: string };

type TodoAppAction =
  | { type: 'FETCH_TODO_SUCCESS', todos: Todo[] }
  | { type: 'FETCH_TODO_FAILURE', error: string };

const makeFetchTodoSuccess = (todos: Todo[]) => ({ type: 'FETCH_TODO_SUCCESS', todos });
const makeFetchTodoFailure = (error: string) => ({ type: 'FETCH_TODO_FAILURE', error });

const TodoAppReducer = (state:TodoAppState, action:TodoAppAction): TodoAppState => {
  switch(action.type){
    case 'FETCH_TODO_SUCCESS': return { loading: false, todos: action.todos };
    case 'FETCH_TODO_FAILURE': return { loading: false, todos: [], error: action.error };
    default: return state;
  }
}
```

And then we might write UI logic like this:

```typescript
// todo-app-ui.ts
let currentState = initialState;

function update(action:TodoAppAction){
  currentState = TodoAppReducer(currentState, action);
  // UI Update Logic
}

fetchTodosFromAPI().then(
  (todos) => { update(makeFetchTodoSucess(todos)); },
  (error) => { update(makeFetchTodoFailure(error)); }
);
```

And that last line can be cleaned up to be even more... I don't know... reducer-y.

```typescript
// todo-app-ui.ts
let currentState = initialState;

function update(action:TodoAppAction){
  currentState = TodoAppReducer(currentState, action);
  // UI Update Logic
}

fetchTodosFromAPI().then(
  makeFetchTodoSuccess,
  makeFetchTodoFailure
).then(update);
```

But it's weird isn't it?  The API call being in our UI logic instead of our app logic?  Would there be a way to trigger this bit of impurity?

Well, there are a bunch of different ways to write this, but I'm going to introduce one that isn't necessarily used in any framework (so that this section doesn't get thrown in the garbage when a library changes).  I'm gonna call this a **chainer**

```typescript
type Chainer<TInput, TOutput> = (out:(output:TOutput) => void) => (input:TInput) => void;
```

And a simple "identity" chainer that did nothing but pass the item along might look like this:

```typescript
const identityChainer = <T>(out:(output:T) => void) => (input:T) => out(input);

// Or more simply...
const identityChainer = <T>(out:(output:T) => void) => out;
```

Then we could insert our chainer into our app like this:

```typescript
// todo-app-ui.ts
let currentState = initialState;

function updateState(action:TodoAppAction){
  currentState = TodoAppReducer(currentState, action);
  // UI Update Logic
}

const trigger = identityChainer(updateState)

fetchTodosFromAPI().then(
  makeFetchTodoSuccess,
  makeFetchTodoFailure
).then(trigger);
```

Rather than sending actions from our UI, we can now send actions through this clever little catcher, and that catcher has the choice to either pass an action along to the next step or intercept it and do something else, possibly creating some new actions in the process.

So, maybe an initial fetch chainer would look like this:

```typescript
// todo-app-logic.ts
function initialTodoFetchChainer(out: (output:TodoAppAction) => void){
  fetchTodosFromAPI().then(
    makeFetchTodoSuccess,
    makeFetchTodoFailure
  ).then(out)
  return out;
}

// todo-app-ui.ts
let currentState = initialState;

function updateState(action:TodoAppAction){
  currentState = TodoAppReducer(currentState, action);
  // UI Update Logic
}

const trigger = initialTodoFetchChainer(updateState);
```

But maybe we don't want this to happen immediately. Maybe we want to trigger this fetch when we're ready.  Okay, let's rewrite this:

```typescript
// todo-app-logic.ts
const TodoAppReducer = (state:TodoAppState, action:TodoAppAction): TodoAppState => {
  switch(action.type){
    case 'FETCH_TODO_SUCCESS': return { loading: false, todos: action.todos };
    case 'FETCH_TODO_FAILURE': return { loading: false, todos: [], error: action.error };
    case 'FETCH_TODO_START': return { loading: true, todos: [] }; // Include a start
    default: return state;
  }
}

function todoFetchChainer(out: (output:TodoAppAction) => void){
  return (input:TodoAppAction | { type: 'TRIGGER_FETCH' }) => {
    if(input.type === 'TRIGGER_FETCH'){
      out('FETCH_TODO_START');
      fetchTodosFromAPI().then(
        makeFetchTodoSuccess,
        makeFetchTodoFailure
      ).then(out);
    } else {
      out(input);
    }
  }
}

// todo-app-ui.ts
let currentState = initialState;

function updateState(action:TodoAppAction){
  currentState = TodoAppReducer(currentState, action);
  // UI Update Logic
}

const trigger = todoFetchChainer(updateState);
trigger({type: 'TRIGGER_FETCH'});
```

So the `'TRIGGER_FETCH'` action never reaches the reducer, but it *does* help create actions that get to the reducer.  Also, thanks to the rules of closure, these chainers can also have state.  Let's say that we wanted to ensure that we only had one fetch going at a time. We could keep track of that easily.

```typescript
function todoFetchChainer(out: (output:TodoAppAction) => void){
  let isFetching = false;

  return (input:TodoAppAction | { type: 'TRIGGER_FETCH' }) => {
    if(input.type === 'TRIGGER_FETCH'){
  
      if(isFetching) return;
      
      isFetching = true;
      out('FETCH_TODO_START');
      fetchTodosFromAPI().then(
        makeFetchTodoSuccess,
        makeFetchTodoFailure
      ).then(out)
      .then(() => { isFetching = false; });
    } else {
      out(input);
    }
  }
}
```

The possibilities are endless here, of course.

Now, you may be thinking, "Cool middleware.  But I'm using React.  What can I do here?"  Well, here's all that library-agnostic stuff in a React hook.

```tsx
const useTodo = () => {
  const [state, dispatch] = useReducer(TodoAppReducer, initialState);
  const trigger = useState(() => todoFetchChainer(dispatch))

function triggerFetch(){
    trigger({type: 'TRIGGER_FETCH'});
  }
  
  return {
    state,
    triggerFetch
  };
}
```

"All right," you say, "But what about a Redux Middleware?"

```ts
const todoFetchMiddleware = store => todoFetchChainer;
```

"Fine, tough guy.  What about a RxJS operator?"

```ts
const todoFetchOperator = (input:Observable<TodoAppAction | {type: 'TRIGGER_FETCH'}>) => new Observable<TodoAppAction>(subscriber => {
  const next = todoFetchChainer(val => subscriber.next(val));
  const sub = input.subscribe({
    next,
    complete(){ subscriber.complete(); },
    error(err){ subscriber.error(err); }
  });
  return () => sub.unsubscribe();
});

const state$ = new BehaviorSubject<TodoAppState>(initialState);
const trigger$ = new Subject<TodoAppAction | {type: 'TRIGGER_FETCH'}>();
trigger$.pipe(
  todoFetchOperator, 
  scan(TodoAppReducer, initialState)
).subscribe(state$);
```
