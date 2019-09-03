import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

let globalButtonState = {
  button1: false,
  button2: false
};

export let databaseState = {
  button1: false,
  button2: false
};

export const setButtonEmoji = (movieId: number) => {
  globalButtonState[`button${movieId}`] = !globalButtonState[`button${movieId}`];
  let buttonEl = document.querySelector(`#movie${movieId}`);
  buttonEl.innerHTML = globalButtonState[`button${movieId}`] ? '😃' : '😩';
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
  status?: boolean;
}

export const toggleStatus = (movieId: number): Observable<Movie> => {
  const button = `button${movieId}`;
  const randomDelay = Math.floor(Math.random() * 2000);
  databaseState[button] = !databaseState[button];

  return of({ movieId, status: databaseState[button] }).pipe(delay(randomDelay));
};
