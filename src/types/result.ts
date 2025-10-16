export type Failure<E = unknown> = {
  ok: false;
  error: E;
};

export type Success<T = void> = {
  ok: true;
  data: T;
};

export type Result<T = void, E = unknown> = Failure<E> | Success<T>;
