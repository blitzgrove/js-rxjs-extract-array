const { Observable, from } = require('rxjs');
const { take, filter, reduce } = require('rxjs/operators');

const input = [null, null, '*', 1, 2, 3, '*', 3, '*', 4, '*'];

export const onlyIfFirst = predicate => {
  let first = true;
  return source =>
    new Observable(subscriber =>
      source.subscribe({
        next(value) {
          if (first) {
            first = false;
            if (predicate(value)) {
              subscriber.next(value);
            } else {
              subscriber.next([]);
              subscriber.complete();
            }
          } else {
            subscriber.next(value);
          }
        },
        complete() {
          subscriber.complete();
        }
      })
    );
};

export const toArrayWhen = (predicate, count) => {
  let id = 0;
  let times = count * 2;
  return source =>
    source.pipe(
      reduce((acc, curr) => {
        if (!!id) {
          if (predicate(curr)) id++;
          if (id < times && !predicate(curr)) {
            acc = [...acc, curr];
          }
        } else {
          if (predicate(curr)) id++;
        }
        return acc;
      }, [])
    );
};

from(input)
  .pipe(
    take(10),
    filter(value => value !== null),
    onlyIfFirst(value => value === '*'),
    toArrayWhen(value => value === '*', 1)
  )
  .subscribe({
    next: value => console.log('Next:', value),
    error: error => console.log('Error:', error),
    complete: () => console.log('Complete')
  });
