# Phase 10 Scorekeeper

A React-based scorekeeper for the card game Phase 10. Keep track of scores, phases, and achievements while playing Phase 10 with friends.

## Features

- Track scores and phases for multiple players
- Mark phase completion status for each round
- View detailed round history
- Statistics tracking for each player
- Achievement system for gameplay milestones
- Quick reference for card point values
- Mobile-friendly design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm start
```

## How to Use

1. **Start a Game**
   - Click "Add Player" to add players to the game
   - First player added will be the initial dealer
   
2. **During Each Round**
   - Click "Enter scores for Round X" to begin score entry
   - Enter points for each player's remaining cards
   - Check the box if a player completed their current phase
   - Use the card points reference guide if needed
   
3. **Scoring Reference**
   - Regular Cards (1-9): 5 points
   - Face Cards (10-12): 10 points
   - Skip: 15 points
   - Wild: 25 points

4. **Winning the Game**
   - First player to complete Phase 10 wins
   - If multiple players complete Phase 10 in the same round, lowest total score wins

## Achievements

Players can earn achievements during gameplay:

- **Low Baller** 🔄: Completed a phase with 5 points or less
- **First Blood** 🎯: First player to complete a phase in the game
- **Speed Runner** ⚡: Completed 3 consecutive phases in 3 rounds
- **Efficient Player** 🎯: Completed a phase with exactly the required cards
- **Comeback Queen** 👑: Advanced after being stuck on the same phase for 3+ rounds
- **Perfect Round** ✨: Completed a phase and went out first with 0 points
- **Phase Master** 🌟: Completed phases 7, 8, and 9 in consecutive rounds
- **Strong Start** 🚀: Completed phases 1 and 2 in the first two rounds
- **Early Lead** 🏃: First player to reach phase 3

## Built With

- React
- Tailwind CSS
- Lucide Icons

## License

This project is private and not licensed for public distribution.