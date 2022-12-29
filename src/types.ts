export type Reducer<TState, TAction> = (state:TState, action:TAction) => TState;
export type Chainer<A, B> = (out:(b:B) => void) => (a:A) => void;
