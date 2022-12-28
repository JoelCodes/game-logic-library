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
  gameOver: boolean
};

export const initialState: Readonly<TicTacToeState> = Object.freeze({
  board: Object.freeze([
    undefined, undefined, undefined,
    undefined, undefined, undefined,
    undefined, undefined, undefined,
  ]) as TicTacToeBoard,
  turn: 'X',
  gameOver: false,
});
export type TicTacToeAction = {type: 'RESET'} | {type: 'MOVE', position: 0|1|2|3|4|5|6|7|8};

const lines:[number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];
function isGameOver(board:TicTacToeBoard):boolean {
  return lines.some(([a, b, c]) => board[a] !== undefined
    && board[a] === board[b]
    && board[a] === board[c]);
}

export function TicTacToeReducer(state:TicTacToeState, action:TicTacToeAction):TicTacToeState {
  switch (action.type) {
    case 'RESET': return initialState;
    case 'MOVE': {
      if (state.gameOver) return state;
      if (state.board[action.position] !== undefined) return state;
      const newBoard = [...state.board] as TicTacToeState['board'];
      newBoard[action.position] = state.turn;
      const newTurn:TicTacToeMark = state.turn === 'O' ? 'X' : 'O';
      return {
        board: newBoard,
        turn: newTurn,
        gameOver: isGameOver(newBoard),
      };
    }
    default: { return state; }
  }
}
