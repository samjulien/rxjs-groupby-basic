import { Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

export let globalButtonState = {
  button1: false,
  button2: false
};

export const setButtonEmoji = (movieId: number) => {
  let buttonState = globalButtonState[`button${movieId}`];
  let buttonEl = document.querySelector(`#movie${movieId}`);
  buttonEl.innerHTML = buttonState ? '😃' : '😩';
};

export const addToOutput = (text: string) => {
  var node = document.createElement('LI');
  var textnode = document.createTextNode(text);
  node.appendChild(textnode);
  document.getElementById('output').appendChild(node);
};

export const clearOutput = () => {
  let list = document.getElementById('output'); // Get the <ul> element with id="myList"
  list.innerHTML = '';
};

export interface Movie {
  movieId: number;
}

export const fakeEndpoint = (movieId?: number): Observable<Movie> => {
  return of({ movieId }).pipe(
    tap(({ movieId }) => {
      let button = `button${movieId}`;
      globalButtonState[button] = !globalButtonState[button];
    }),
    delay(800)
  );
};
