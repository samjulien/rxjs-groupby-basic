import { Observable, fromEvent, BehaviorSubject, EMPTY } from 'rxjs';
import {
  tap,
  filter,
  mergeMap,
  groupBy,
  timeoutWith,
  ignoreElements,
  switchMap
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

const actions$ = dispatcher.asObservable().pipe(
  filter(value => value !== null),
  groupBy(
    movie => movie.movieId,
    movie => movie,
    actionsByGroup$ =>
      actionsByGroup$.pipe(
        timeoutWith(15000, EMPTY),
        ignoreElements() /* filter(() => false), */
      )
  ),
  mergeMap(group$ =>
    group$.pipe(
      switchMap(movie =>
        fakeEndpoint(movie.movieId).pipe(
          tap(({ movieId }) => setButtonEmoji(movieId))
        )
      )
    )
  )
);

actions$.subscribe((data: Movie) => {
  let button = `button${data.movieId}`;
  addToOutput(
    `groupBy & switchMap: Movie ${data.movieId} complete; state: ${globalButtonState[button]}`
  );
});
