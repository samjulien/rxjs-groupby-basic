import {
  Observable,
  Operator,
  fromEvent,
  from,
  interval,
  of,
  BehaviorSubject,
  EMPTY,
  OperatorFunction
} from 'rxjs';
import {
  take,
  map,
  groupBy,
  mergeMap,
  mergeAll,
  concatMap,
  exhaustMap,
  toArray,
  switchMap,
  tap,
  zip,
  filter,
  timeoutWith,
  ignoreElements,
  delay
} from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

interface Todo {
  userId: number;
  text?: string;
}

interface User {
  userId: number;
}

let globalButtonState = {
  button1: false,
  button2: false
};

function buildUrl(userId?: number): string {
  return `https://jsonplaceholder.typicode.com/todos?userId=${userId}`;
}

function setButtonEmoji(userId) {
  let buttonState = globalButtonState[`button${userId}`];
  let buttonEl = document.querySelector(`#user${userId}`);
  buttonEl.innerHTML = buttonState ? '😃' : '😩';
}

function fakeEndpoint(userId?: number): Observable<User> {
  let randomDelay = Math.floor(Math.random() * 1000);
  return of({ userId }).pipe(
    tap(({ userId }) => {
      let button = `button${userId}`;
      globalButtonState[button] = !globalButtonState[button];
      // setButtonEmoji(userId);
    }),
    delay(800)
  );
}

function addToOutput(text: string) {
  var node = document.createElement('LI'); // Create a <li> node
  var textnode = document.createTextNode(text); // Create a text node
  node.appendChild(textnode); // Append the text to <li>
  document.getElementById('output').appendChild(node);
}

function clearOutput() {
  let list = document.getElementById('output'); // Get the <ul> element with id="myList"
  list.innerHTML = '';
}

document.querySelector('#clear-output').addEventListener('click', clearOutput);

const button1 = document.querySelector('#user1');
const button2 = document.querySelector('#user2');
const user1$: Observable<Event> = fromEvent(button1, 'click');
user1$.subscribe(() => dispatcher.next({ userId: 1 }));

const user2$: Observable<Event> = fromEvent(button2, 'click');
user2$.subscribe(() => dispatcher.next({ userId: 2 }));

const dispatcher = new BehaviorSubject<User>(null as any);

const actions$ = dispatcher.asObservable().pipe(
  filter(value => value !== null),
  groupBy(
    user => user.userId,
    user => user,
    actionsByGroup$ =>
      actionsByGroup$.pipe(
        timeoutWith(15000, EMPTY),
        ignoreElements() /* filter(() => false), */
      )
  ),
  mergeMap(group$ =>
    group$.pipe(
      exhaustMap(user =>
        fakeEndpoint(user.userId).pipe(
          tap(({ userId }) => setButtonEmoji(userId))
        )
      )
    )
  )
);

// actions$.subscribe((data: User) => {
//   let button = `button${data.userId}`;
//   addToOutput(
//     `With groupBy: User ${data.userId} complete; state: ${
//       globalButtonState[button]
//     }`
//   );
// });

const actionsNoGroup$ = dispatcher.asObservable().pipe(
  filter(value => value !== null),
  exhaustMap(user =>
    fakeEndpoint(user.userId).pipe(tap(({ userId }) => setButtonEmoji(userId)))
  )
);

actionsNoGroup$.subscribe((data: User) => {
  let button = `button${data.userId}`;
  addToOutput(
    `Plain exhaustMap: User ${data.userId} complete; state: ${
      globalButtonState[button]
    }`
  );
});

function exhaustMapByKey<T, V>(
  keySelector: (item: T) => number,
  mapFn: (item: T) => Observable<V>
): OperatorFunction<T, V> {
  return observable$ =>
    observable$.pipe(
      groupBy(
        keySelector,
        item => item,
        itemsByGroup$ =>
          itemsByGroup$.pipe(
            timeoutWith(15000, EMPTY),
            ignoreElements()
          )
      ),
      map((itemGroup$: Observable<T>) => itemGroup$.pipe(exhaustMap(mapFn))),
      mergeAll()
    );
}

const actions2$ = dispatcher.asObservable().pipe(
  filter(value => value !== null),
  exhaustMapByKey(
    (user: User) => user.userId,
    (user: User) =>
      fakeEndpoint(user.userId).pipe(
        tap(({ userId }) => setButtonEmoji(userId))
      )
  )
);

// actions2$.subscribe((data: User) => {
//   let button = `button${data.userId}`;
//   addToOutput(
//     `Using custom operator: User ${data.userId} complete; state: ${
//       globalButtonState[button]
//     }`
//   );
// });
