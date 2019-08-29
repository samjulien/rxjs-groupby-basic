import {
  Observable,
  fromEvent,
  BehaviorSubject,
  OperatorFunction,
  EMPTY
} from 'rxjs';
import {
  tap,
  filter,
  groupBy,
  timeoutWith,
  ignoreElements,
  map,
  switchMap,
  mergeAll
} from 'rxjs/operators';
import {
  setButtonEmoji,
  globalButtonState,
  clearOutput,
  addToOutput,
  Movie,
  fakeEndpoint
} from './helpers';

document.querySelector('#clear-output').addEventListener('click', clearOutput);

const button1 = document.querySelector('#movie1');
const button2 = document.querySelector('#movie2');

const movie1$: Observable<Event> = fromEvent(button1, 'click');
movie1$.subscribe(() => dispatcher.next({ movieId: 1 }));

const movie2$: Observable<Event> = fromEvent(button2, 'click');
movie2$.subscribe(() => dispatcher.next({ movieId: 2 }));

const dispatcher = new BehaviorSubject<Movie>(null as any);

function switchMapByKey<T, V>(
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
      map((itemGroup$: Observable<T>) => itemGroup$.pipe(switchMap(mapFn))),
      mergeAll()
    );
}

const actions$ = dispatcher.asObservable().pipe(
  filter(value => value !== null),
  switchMapByKey(
    (movie: Movie) => movie.movieId,
    (movie: Movie) =>
      fakeEndpoint(movie.movieId).pipe(
        tap(({ movieId }) => setButtonEmoji(movieId))
      )
  )
);

actions$.subscribe((data: Movie) => {
  let button = `button${data.movieId}`;
  addToOutput(
    `Custom operator: Movie ${data.movieId} complete; state: ${globalButtonState[button]}`
  );
});
