import {
  initialState,
  TicTacToeAction,
  TicTacToeReducer,
} from '.';

describe('Tic Tac Toe', () => {
  const afterFourMoves = [0, 3, 1, 4].map((position) => ({ type: 'MOVE', position }) as TicTacToeAction).reduce(TicTacToeReducer, initialState);
  const afterGameOver = TicTacToeReducer(afterFourMoves, { type: 'MOVE', position: 2 });

  describe('MOVE', () => {
    it('Creates a move, switching the turn', () => {
      const afterFirstMove = TicTacToeReducer(initialState, { type: 'MOVE', position: 0 });
      expect(afterFirstMove).toEqual({
        board: ['X', ...new Array(8).fill(undefined)],
        turn: 'O',
        moves: [0],
      });
      const afterSecondMove = TicTacToeReducer(afterFirstMove, { type: 'MOVE', position: 1 });
      expect(afterSecondMove).toEqual({
        board: ['X', 'O', ...new Array(7).fill(undefined)],
        turn: 'X',
        moves: [0, 1],
      });
    });
    it('Finds a finished game', () => {
      function hasAWinOn5(positions:number[]) {
        const moves = positions.map((position) => ({ type: 'MOVE', position }) as TicTacToeAction);
        const afterFirstFourMoves = moves.slice(0, 4)
          .reduce(TicTacToeReducer, initialState);
        const wins = positions.filter((x, i) => i % 2 === 0);
        expect(afterFirstFourMoves.gameOver).toBeUndefined();
        expect(TicTacToeReducer(afterFirstFourMoves, moves[4]).gameOver).toEqual(wins);
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
      expect(TicTacToeReducer(afterFirstMove, { type: 'MOVE', position: -1 })).toEqual(afterFirstMove);
      expect(TicTacToeReducer(afterFirstMove, { type: 'MOVE', position: 9 })).toEqual(afterFirstMove);
      expect(TicTacToeReducer(afterFirstMove, { type: 'MOVE', position: 3.5 })).toEqual(afterFirstMove);
    });
    it('ignores moves on a finished match', () => {
      const afterWin = [0, 3, 1, 4, 2].map((position) => ({ type: 'MOVE', position }) as TicTacToeAction).reduce(TicTacToeReducer, initialState);
      expect(TicTacToeReducer(afterWin, { type: 'MOVE', position: 5 })).toEqual(afterWin);
    });
  });
  describe('UNDO', () => {
    it('does nothing to the initial state', () => {
      expect(TicTacToeReducer(initialState, { type: 'UNDO' })).toEqual(initialState);
    });
    it('removes the last mark, pops the last position, and switches back turns', () => {
      const afterOneMove = TicTacToeReducer(initialState, { type: 'MOVE', position: 0 });
      const afterTwoMoves = TicTacToeReducer(afterOneMove, { type: 'MOVE', position: 1 });
      expect(TicTacToeReducer(afterOneMove, { type: 'UNDO' })).toEqual(initialState);
      expect(TicTacToeReducer(afterTwoMoves, { type: 'UNDO' })).toEqual(afterOneMove);
    });
    it('removes a gameOver condition if the game was over', () => {
      expect(TicTacToeReducer(afterGameOver, { type: 'UNDO' })).toEqual(afterFourMoves);
    });
  });
  describe('SKIP', () => {
    it('ignores a finished game', () => {
      expect(TicTacToeReducer(afterGameOver, { type: 'SKIP' })).toEqual(afterGameOver);
    });
    it('switches turns', () => {
      const afterSkip = TicTacToeReducer(initialState, { type: 'SKIP' });
      expect(afterSkip).toEqual({ ...initialState, turn: 'O' });
      expect(TicTacToeReducer(afterSkip, { type: 'SKIP' })).toEqual(initialState);
    });
  });
  describe('RESET', () => {
    it('returns the initial undo state', () => {
      expect(TicTacToeReducer(afterGameOver, { type: 'RESET' })).toEqual(initialState);
    });
  });
});
