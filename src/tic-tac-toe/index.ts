export type TicTacToeMark = 'X' | 'O';
export type TicTacToeCell = TicTacToeMark | undefined;

export type TicTacToeBoard = TicTacToeCell[];

export type TicTacToeState = {
  board: TicTacToeBoard,
  turn: TicTacToeMark,
  gameOver?: [number, number, number],
  moves: number[]
};

export const initialState: Readonly<TicTacToeState> = Object.freeze({
  board: Object.freeze([...new Array(9)]) as TicTacToeBoard,
  turn: 'X',
  moves: [],
});

export type TicTacToeAction = {type: 'RESET'} | {type: 'MOVE', position: number} | { type: 'UNDO' } | {type: 'SKIP'};

function* makeFace(
  offset:number,
  small:number,
  large:number,
):IterableIterator<[number, number, number]> {
  function makeRow(start:number, interval:number):[number, number, number] {
    return [start, start + interval, start + interval + interval];
  }
  yield makeRow(offset, small);
  yield makeRow(large + offset, small);
  yield makeRow(large + large + offset, small);
  yield makeRow(offset, large);
  yield makeRow(small + offset, large);
  yield makeRow(small + small + offset, large);
  yield makeRow(offset, small + large);
  yield makeRow(offset + small + small, large - small);
}
const lines2d:[number, number, number][] = [...makeFace(0, 1, 3)];

function makeTicTacToeReducer(_initialState:TicTacToeState, _lines:[number, number, number][]) {
  function isGameOver(board:TicTacToeBoard):[number, number, number]|undefined {
    return _lines.find(([a, b, c]) => board[a] !== undefined
    && board[a] === board[b]
    && board[a] === board[c]);
  }
  return function reducer(state:TicTacToeState, action:TicTacToeAction):TicTacToeState {
    switch (action.type) {
      case 'UNDO': {
        const newMoves = [...state.moves];
        const lastMove = newMoves.pop();
        if (lastMove === undefined) return state;
        const newBoard = [...state.board];
        newBoard[lastMove] = undefined;
        const newState = {
          ...state,
          board: newBoard as TicTacToeBoard,
          moves: newMoves,
          turn: state.turn === 'O' ? 'X' : 'O',
        };
        delete newState.gameOver;
        return newState as TicTacToeState;
      }
      case 'SKIP': {
        if (state.gameOver) return state;
        return {
          ...state,
          turn: state.turn === 'X' ? 'O' : 'X',
        };
      }
      case 'MOVE': {
        if (state.gameOver) return state;
        if (
          action.position < 0
            || action.position >= state.board.length
            || Math.floor(action.position) !== action.position
        ) return state;
        if (state.board[action.position] !== undefined) return state;
        const newBoard = [...state.board] as TicTacToeBoard;
        newBoard[action.position] = state.turn;
        const newTurn:TicTacToeMark = state.turn === 'O' ? 'X' : 'O';
        return {
          ...state,
          board: newBoard,
          turn: newTurn,
          moves: [...state.moves, action.position],
          gameOver: isGameOver(newBoard),
        };
      }
      case 'RESET': return _initialState;

      default: return state;
    }
  };
}

export const TicTacToeReducer = makeTicTacToeReducer(initialState, lines2d);
