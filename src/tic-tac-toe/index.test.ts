import {
  initialState,
  initialUndoState,
  TicTacToeAction,
  TicTacToeReducer,
  TicTacToeUndoReducer,
  TicTacToeUndoState,
} from '.';

describe('Tic Tac Toe', () => {
  describe('Classic', () => {
    describe('MOVE', () => {
      it('Creates a move, switching the turn', () => {
        const afterFirstMove = TicTacToeReducer(initialState, { type: 'MOVE', position: 0 });
        expect(afterFirstMove).toEqual({
          board: ['X', ...new Array(8).fill(undefined)],
          turn: 'O',
        });
        const afterSecondMove = TicTacToeReducer(afterFirstMove, { type: 'MOVE', position: 1 });
        expect(afterSecondMove).toEqual({
          board: ['X', 'O', ...new Array(7).fill(undefined)],
          turn: 'X',
        });
      });
      it('Finds a finished game', () => {
        function hasAWinOn5(positions:number[]) {
          const moves = positions.map((position) => ({ type: 'MOVE', position }) as TicTacToeAction);
          const afterFourMoves = moves.slice(0, 4).reduce(TicTacToeReducer, initialState);
          const wins = positions.filter((x, i) => i % 2 === 0);
          expect(afterFourMoves.gameOver).toBeUndefined();
          expect(TicTacToeReducer(afterFourMoves, moves[4]).gameOver).toEqual(wins);
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
  describe('With Undo', () => {
    const afterFourMoves = [0, 3, 1, 4].map((position) => ({ type: 'MOVE', position }) as TicTacToeAction).reduce(TicTacToeUndoReducer, initialUndoState);
    const afterGameOver = TicTacToeUndoReducer(afterFourMoves, { type: 'MOVE', position: 2 });

    describe('MOVE', () => {
      it('captures a list of positions', () => {
        const afterOneMove = TicTacToeUndoReducer(initialUndoState, { type: 'MOVE', position: 0 });
        expect(afterOneMove).toEqual({
          board: ['X', ...new Array(8).fill(undefined)],
          moves: [0],
          turn: 'O',
        } as TicTacToeUndoState);
        expect(TicTacToeUndoReducer(afterOneMove, { type: 'MOVE', position: 1 })).toEqual({
          board: ['X', 'O', ...new Array(7).fill(undefined)],
          moves: [0, 1],
          turn: 'X',
        } as TicTacToeUndoState);
      });
      it('adds no position if the move was impossible', () => {
        const afterOneMove = TicTacToeUndoReducer(initialUndoState, { type: 'MOVE', position: 0 });
        expect(TicTacToeUndoReducer(afterOneMove, { type: 'MOVE', position: 0 })).toEqual(afterOneMove);
      });
      it('adds no position if the game is over', () => {
        expect(TicTacToeUndoReducer(afterGameOver, { type: 'MOVE', position: 7 })).toEqual(afterGameOver);
      });
    });
    describe('UNDO', () => {
      it('does nothing to the initial state', () => {
        expect(TicTacToeUndoReducer(initialUndoState, { type: 'UNDO' })).toEqual(initialUndoState);
      });
      it('removes the last mark, pops the last position, and switches back turns', () => {
        const afterOneMove = TicTacToeUndoReducer(initialUndoState, { type: 'MOVE', position: 0 });
        const afterTwoMoves = TicTacToeUndoReducer(afterOneMove, { type: 'MOVE', position: 1 });
        expect(TicTacToeUndoReducer(afterOneMove, { type: 'UNDO' })).toEqual(initialUndoState);
        expect(TicTacToeUndoReducer(afterTwoMoves, { type: 'UNDO' })).toEqual(afterOneMove);
      });
      it('removes a gameOver condition if the game was over', () => {
        expect(TicTacToeUndoReducer(afterGameOver, { type: 'UNDO' })).toEqual(afterFourMoves);
      });
    });
    describe('SKIP', () => {
      it('ignores a finished game', () => {
        expect(TicTacToeUndoReducer(afterGameOver, { type: 'SKIP' })).toEqual(afterGameOver);
      });
      it('switches turns', () => {
        const afterSkip = TicTacToeUndoReducer(initialUndoState, { type: 'SKIP' });
        expect(afterSkip).toEqual({ ...initialUndoState, turn: 'O' });
        expect(TicTacToeUndoReducer(afterSkip, { type: 'SKIP' })).toEqual(initialUndoState);
      });
    });
    describe('RESET', () => {
      it('returns the initial undo state', () => {
        expect(TicTacToeUndoReducer(afterGameOver, { type: 'RESET' })).toEqual(initialUndoState);
      });
    });
  });
});
