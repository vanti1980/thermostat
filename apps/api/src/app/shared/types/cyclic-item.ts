export interface CyclicItem<T> {
  key: string;
  props: T;
}

export interface CyclicCollection<T> {
  results: CyclicItem<T>[];
}
