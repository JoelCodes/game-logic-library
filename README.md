# game-logic-library

Library of Game Logic (expressed as Reducers)

## Welcome to the Library

Every want to create a common board or card game in JavaScript, and find yourself figuring out how to write the rules?  Well, here's a quick shortcut!  This is a library of common (and hopefully public domain) games, presented without any user interface You'll find an ever-growing library of game rules, presented as reducers, as well as any other util functions.

Not sure what a reducer is?  A reducer is a platform- and library-agnostic way of describing application logic.  That means that the logic of these app can be used in any library (or even without one), and can be used on the front end, back end, or even in an AI algorithm!

Some of the following components to describe logic:

* State - an object describing important information we're keeping track of
* Action - an object describing a "move" or other action we want to take
* Reducer - a pure function that, given a current state and an action, returns the next state.

```typescript
type Reducer<TState, TAction> = (state:TState, action:TAction) => TState;
type Chainer<TInput, TOutput = TAction> = (out:(action:TOutput) => void) => (input:TInput) => void;
```

* Selector - a function that gives a slice of information from the state
* Chainer - a "middleware" function that can perform asynchrony, randomness, and side effects (keeping the reducer pure)

For more information on Reducers and how they represent app logic, [click here](./reducers.md).

## Games (Present & Future)

* [X] Tic-Tac-Toe
  * [X] Standard
  * [ ] Whoops! All X's!
  * [ ] 4D+
* [ ] Quatri
* [ ] Checkers
* [ ] Chess
* [ ] Go
* [ ] Dice Games
  * [ ] Liar's Dice
* [ ] Card Games
  * [ ] Solitaire Games
  * [ ] Poker
  * [ ] Gin / Rummy / Gin Rummy
  * [ ] Kings in the Corner
