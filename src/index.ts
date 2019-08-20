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
  ignoreElements
} from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

interface Todo {
  userId: number;
  text?: string;
}

interface User {
  userId: number;
}

function buildUrl(userId?: number): string {
  return `https://jsonplaceholder.typicode.com/todos?userId=${userId}`;
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
        fromFetch(buildUrl(user.userId)).pipe(mergeMap(res => res.json()))
      )
    )
  )
);

actions$.subscribe(data => {
  addToOutput(`With groupBy: User ${data[0].userId} complete`);
});

const actionsNoGroup$ = dispatcher.asObservable().pipe(
  filter(value => value !== null),
  exhaustMap(user =>
    fromFetch(buildUrl(user.userId)).pipe(mergeMap(res => res.json()))
  )
);

actionsNoGroup$.subscribe(data => {
  addToOutput(`Plain exhaustMap: User ${data[0].userId} complete`);
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
      fromFetch(buildUrl(user.userId)).pipe(mergeMap(res => res.json()))
  )
);

actions2$.subscribe(data => {
  addToOutput(`Using custom operator: User ${data[0].userId} complete`);
});
