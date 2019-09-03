import { Observable, fromEvent, Subject, OperatorFunction, EMPTY } from 'rxjs';
import {
  tap,
  groupBy,
  timeoutWith,
  ignoreElements,
  map,
  switchMap,
  mergeAll
} from 'rxjs/operators';
import { setButtonEmoji, clearOutput, addToOutput, Movie, toggleStatus } from './helpers';

document.querySelector('#clear-output').addEventListener('click', clearOutput);

const button1 = document.querySelector('#movie1');
const button2 = document.querySelector('#movie2');

const movie1$: Observable<Event> = fromEvent(button1, 'click');
movie1$.subscribe(() => dispatcher.next({ movieId: 1 }));

const movie2$: Observable<Event> = fromEvent(button2, 'click');
movie2$.subscribe(() => dispatcher.next({ movieId: 2 }));

const dispatcher = new Subject<Movie>();

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
  tap(({ movieId }) => setButtonEmoji(movieId)),
  switchMapByKey((movie: Movie) => movie.movieId, (movie: Movie) => toggleStatus(movie.movieId))
);

actions$.subscribe((data: Movie) => {
  addToOutput(`Custom operator: Movie ${data.movieId} complete; state: ${data.status}`);
});
