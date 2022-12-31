export type TicTacToeMark = 'X' | 'O';
export type TicTacToeCell = TicTacToeMark | undefined;

export type TicTacToeBoard = [
  TicTacToeCell, TicTacToeCell, TicTacToeCell,
  TicTacToeCell, TicTacToeCell, TicTacToeCell,
  TicTacToeCell, TicTacToeCell, TicTacToeCell,
]
export type TicTacToeState = {
  board: TicTacToeBoard,
  turn: TicTacToeMark,
  gameOver?: [number, number, number]
};

export const initialState: Readonly<TicTacToeState> = Object.freeze({
  board: Object.freeze([
    undefined, undefined, undefined,
    undefined, undefined, undefined,
    undefined, undefined, undefined,
  ]) as TicTacToeBoard,
  turn: 'X',
});

export type TicTacToeAction = {type: 'RESET'} | {type: 'MOVE', position: 0|1|2|3|4|5|6|7|8};

const lines:[number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];
function isGameOver(board:TicTacToeBoard):[number, number, number]|undefined {
  return lines.find(([a, b, c]) => board[a] !== undefined
    && board[a] === board[b]
    && board[a] === board[c]);
}

export function makeTicTacToeReducer<
TState extends TicTacToeState = TicTacToeState,
>(
  // eslint-disable-next-line no-shadow
  initialState:TState,
) {
  return function reducer(state:TState, action:TicTacToeAction):TState {
    switch (action.type) {
      case 'RESET': return initialState;
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
          gameOver: isGameOver(newBoard),
        };
      }
      default: return state;
    }
  };
}

export const TicTacToeReducer = makeTicTacToeReducer(initialState);

export type TicTacToeUndoState = TicTacToeState & { moves: number[] };
export type TicTacToeUndoAction = TicTacToeAction | { type: 'UNDO' };
export const initialUndoState:TicTacToeUndoState = {
  ...initialState,
  moves: [],
};
export const TicTacToeUndoReducer = (() => {
  const baseReducer = makeTicTacToeReducer<TicTacToeUndoState>(initialUndoState);
  return function reducer(state:TicTacToeUndoState, action:TicTacToeUndoAction):TicTacToeUndoState {
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
        return newState as TicTacToeUndoState;
      }
      case 'MOVE': {
        const newState = baseReducer(state, action);
        if (newState === state) return state;
        return {
          ...newState,
          moves: [...state.moves, action.position],
        };
      }
      default: return baseReducer(state, action);
    }
  };
})();
