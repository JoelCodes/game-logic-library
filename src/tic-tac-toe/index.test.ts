import { initialState, TicTacToeAction, TicTacToeReducer } from '.';

describe('Tic Tac Toe', () => {
  describe('MOVE', () => {
    it('Creates a move, switching the turn', () => {
      const afterFirstMove = TicTacToeReducer(initialState, { type: 'MOVE', position: 0 });
      expect(afterFirstMove).toEqual({
        board: ['X', ...new Array(8).fill(undefined)],
        turn: 'O',
        gameOver: false,
      });
      const afterSecondMove = TicTacToeReducer(afterFirstMove, { type: 'MOVE', position: 1 });
      expect(afterSecondMove).toEqual({
        board: ['X', 'O', ...new Array(7).fill(undefined)],
        turn: 'X',
        gameOver: false,
      });
    });
    it('Finds a finished game', () => {
      function hasAWinOn5(positions:number[]) {
        const moves = positions.map((position) => ({ type: 'MOVE', position }) as TicTacToeAction);
        const afterFourMoves = moves.slice(0, 4).reduce(TicTacToeReducer, initialState);
        expect(afterFourMoves.gameOver).toBe(false);
        expect(TicTacToeReducer(afterFourMoves, moves[4]).gameOver).toBe(true);
      }

      // Rows
      hasAWinOn5([0, 3, 1, 4, 2]);
      hasAWinOn5([3, 6, 4, 7, 5]);
      hasAWinOn5([6, 0, 7, 1, 8]);

      // Columns
      hasAWinOn5([0, 1, 3, 4, 6]);
      hasAWinOn5([1, 2, 4, 5, 7]);
      hasAWinOn5([2, 0, 5, 3, 8]);

      // Diagonals
      hasAWinOn5([0, 1, 4, 2, 8]);
      hasAWinOn5([2, 1, 4, 3, 6]);
    });
    it('ignores moves on spots that are already taken', () => {
      const take0: TicTacToeAction = { type: 'MOVE', position: 0 };
      const afterFirstMove = TicTacToeReducer(initialState, take0);
      expect(TicTacToeReducer(afterFirstMove, take0)).toEqual(afterFirstMove);
    });
    it('ignores moves on spots not available on the board', () => {
      const afterFirstMove = TicTacToeReducer(initialState, { type: 'MOVE', position: 0 });
      expect(TicTacToeReducer(afterFirstMove, { type: 'MOVE', position: -1 } as any as TicTacToeAction)).toEqual(afterFirstMove);
      expect(TicTacToeReducer(afterFirstMove, { type: 'MOVE', position: 9 } as any as TicTacToeAction)).toEqual(afterFirstMove);
      expect(TicTacToeReducer(afterFirstMove, { type: 'MOVE', position: 3.5 } as any as TicTacToeAction)).toEqual(afterFirstMove);
    });
    it('ignores moves on a finished match', () => {
      const afterWin = [0, 3, 1, 4, 2].map((position) => ({ type: 'MOVE', position }) as TicTacToeAction).reduce(TicTacToeReducer, initialState);
      expect(TicTacToeReducer(afterWin, { type: 'MOVE', position: 5 })).toEqual(afterWin);
    });
  });

  describe('RESET', () => {
    it('Returns the initial state', () => {
      const result = TicTacToeReducer(initialState, { type: 'RESET' });
      expect(result).toEqual(initialState);
    });
  });
});
