import React, { useState, useEffect } from 'react';
import { AlertCircle, PlusCircle, Trash2, Trophy, TrendingUp, Award } from 'lucide-react';

const PhasetenScorekeeper = () => {
  // State management
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentDealer, setCurrentDealer] = useState(null);
  const [isAddPlayerModalVisible, setIsAddPlayerModalVisible] = useState(false);
  const [isEnterScoresModalVisible, setIsEnterScoresModalVisible] = useState(false);
  const [isGameOverModalVisible, setIsGameOverModalVisible] = useState(false);
  const [currentRoundScores, setCurrentRoundScores] = useState({});
  const [currentRoundPhaseCompleted, setCurrentRoundPhaseCompleted] = useState({});
  const [playerStats, setPlayerStats] = useState({});
  const [achievements, setAchievements] = useState({});
  const [isScoringGuideOpen, setIsScoringGuideOpen] = useState(false);

  const ACHIEVEMENT_DESCRIPTIONS = {
    'Low Baller 📉': 'Completed a phase with 5 points or less',
    'First Blood 🎯': 'First player to complete a phase in the game',
    'Speed Runner ⚡': 'Completed 3 consecutive phases in 3 rounds',
    'Efficient Player 🎯': 'Completed a phase with exactly the required cards (no extra sets/runs)',
    'Comeback Queen 👑': 'Advanced to the next phase after being stuck on the same phase for 3+ rounds',
    'Perfect Round ✨': 'Completed a phase and went out first with 0 points',
    'Phase Master 🌟': 'Completed phases 7, 8, and 9 in consecutive rounds',
    'Perseverance 💪': 'Completed a phase despite having over 50 points in the previous round',
    'Strong Start 🚀': 'Completed phases 1 and 2 in the first two rounds',
    'Early Lead 🏃': 'First player to reach phase 3'
  };

  const CARD_POINTS = {
    'Regular Cards (1-9)': 5,
    'Face Cards (10-12)': 10,
    'Skip': 15,
    'Wild': 25
  };

  // Add a new player
  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer = {
        id: Math.random().toString(),
        name: newPlayerName.trim(),
        totalScore: 0,
        currentPhase: 1
      };
      setPlayers([...players, newPlayer]);
      
      if (players.length === 0) {
        setCurrentDealer(newPlayer);
      }
      
      setNewPlayerName('');
      setIsAddPlayerModalVisible(false);
      
      setPlayerStats(prev => ({
        ...prev,
        [newPlayer.id]: {
          avgScore: 0,
          bestRound: Infinity,
          worstRound: -1,
          phaseCompletions: 0,
          consecutiveCompletions: 0,
          currentConsecutiveCompletions: 0
        }
      }));
      setAchievements(prev => ({
        ...prev,
        [newPlayer.id]: []
      }));
    }
  };

  // Remove a player
  const removePlayer = (playerId) => {
    setPlayers(players.filter(player => player.id !== playerId));
  };

  // Reset the entire game
  const resetGame = () => {
    setPlayers([]);
    setRounds([]);
    setCurrentRound(1);
    setCurrentDealer(null);
    setIsGameOverModalVisible(false);
  };

  // Start entering scores for the current round
  const beginRoundScoring = () => {
    const initialScores = {};
    const initialPhaseCompleted = {};
    players.forEach(player => {
      initialScores[player.id] = '';
      initialPhaseCompleted[player.id] = false;
    });
    setCurrentRoundScores(initialScores);
    setCurrentRoundPhaseCompleted(initialPhaseCompleted);
    setIsEnterScoresModalVisible(true);
  };

  // Update score and phase completion for a specific player
  const updatePlayerScore = (playerId, score) => {
    setCurrentRoundScores(prev => ({
      ...prev,
      [playerId]: score
    }));
  };

  const togglePhaseCompletion = (playerId) => {
    setCurrentRoundPhaseCompleted(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }));
  };

  // Finalize round scores
  const finishRound = () => {
    // Convert scores to numbers and update phases
    const processedScores = players.map(player => {
      const roundScore = parseInt(currentRoundScores[player.id] || '0', 10);
      const phaseCompleted = currentRoundPhaseCompleted[player.id];
      const newPhase = phaseCompleted ? player.currentPhase + 1 : player.currentPhase;
      
      return {
        ...player,
        roundScore,
        totalScore: player.totalScore + roundScore,
        currentPhase: newPhase,
        phaseCompleted,
        previousPhase: player.currentPhase // Store the phase they were on during this round
      };
    });

    // Add round to history
    setRounds([...rounds, {
      roundNumber: currentRound,
      dealer: currentDealer?.name || 'Not specified',
      scores: processedScores
    }]);

    // Update players' scores and phases
    setPlayers(processedScores);

    // Check if anyone has completed phase 10
    const phase10Completers = processedScores.filter(p => p.currentPhase > 10);
    if (phase10Completers.length > 0) {
      // Sort by total score among phase 10 completers (lowest wins)
      const winner = phase10Completers.sort((a, b) => a.totalScore - b.totalScore)[0];
      setCurrentDealer(winner);
      setIsGameOverModalVisible(true);
      return;
    }

    // Reset for next round
    setCurrentRound(prev => prev + 1);
    
    // Move dealer to next player
    const currentDealerIndex = players.findIndex(p => p.id === currentDealer?.id);
    setCurrentDealer(players[(currentDealerIndex + 1) % players.length]);
    
    // Close scoring modal
    setIsEnterScoresModalVisible(false);
    updatePlayerStats(processedScores);
  };

  // Calculate statistics after each round
  const updatePlayerStats = (roundScores) => {
    const newStats = { ...playerStats };
    
    // Find if this is the first completion in the game
    const isFirstCompletion = rounds.length === 0 && roundScores.some(s => s.phaseCompleted);
    const firstCompleter = isFirstCompletion ? roundScores.find(s => s.phaseCompleted) : null;
    
    roundScores.forEach(score => {
      const playerRounds = rounds.filter(r => 
        r.scores.find(s => s.id === score.id)
      );
      
      const stats = newStats[score.id];
      const roundScore = score.roundScore;
      
      // Update averages
      const sumOfScores = playerRounds.reduce((sum, r) => 
        sum + r.scores.find(s => s.id === score.id).roundScore, 0
      );
      stats.avgScore = playerRounds.length > 0 ? sumOfScores / playerRounds.length : 0;
      if (isNaN(stats.avgScore)) stats.avgScore = 0;

      // Update best/worst rounds
      stats.bestRound = Math.min(stats.bestRound, roundScore);
      stats.worstRound = Math.max(stats.worstRound, roundScore);

      // Phase completion tracking
      if (score.phaseCompleted) {
        stats.phaseCompletions++;
        stats.currentConsecutiveCompletions++;
        stats.consecutiveCompletions = Math.max(stats.consecutiveCompletions, stats.currentConsecutiveCompletions);
      } else {
        stats.currentConsecutiveCompletions = 0;
      }

      // Check for achievements
      const newAchievements = [];
      
      // Perfect round achievement
      if (score.phaseCompleted && roundScore === 0) {
        newAchievements.push('Perfect Round ✨');
      }

      // Phase completion achievements
      if (score.phaseCompleted) {
        if (roundScore < 5) {
          newAchievements.push('Low Baller 📉');
        }
        
        // First Blood achievement
        if (firstCompleter && firstCompleter.id === score.id) {
          newAchievements.push('First Blood 🎯');
        }

        // Strong Start achievement
        if (rounds.length <= 1 && score.previousPhase === 2) {
          const previousRound = rounds[0]?.scores.find(s => s.id === score.id);
          if (previousRound?.phaseCompleted) {
            newAchievements.push('Strong Start 🚀');
          }
        }

        // Early Lead achievement
        const otherPlayersPhases = players
          .filter(p => p.id !== score.id)
          .map(p => p.currentPhase);
        if (score.currentPhase === 3 && otherPlayersPhases.every(phase => phase < 3)) {
          newAchievements.push('Early Lead 🏃');
        }
        
        // Check for consecutive phase completions
        if (stats.currentConsecutiveCompletions === 3 && roundScore < 15) {
          newAchievements.push('Speed Runner ⚡');
        }

        // Check for late-game mastery
        const isLatePhase = [7, 8, 9].includes(score.previousPhase);
        if (isLatePhase && stats.currentConsecutiveCompletions > 0) {
          newAchievements.push('Phase Master 🌟');
        }
      }

      // Check for comeback after being stuck
      const stuckOnPhase = rounds.slice(-3).every(r => 
        r.scores.find(s => s.id === score.id)?.previousPhase === score.previousPhase
      );
      if (stuckOnPhase && score.phaseCompleted) {
        newAchievements.push('Comeback Queen 👑');
      }

      // Check for efficient phase completion (based on low score)
      if (score.phaseCompleted && roundScore < 20) {
        newAchievements.push('Efficient Player 🎯');
      }

      // Check for perseverance after a bad round
      const previousRound = rounds[rounds.length - 1]?.scores.find(s => s.id === score.id);
      if (previousRound?.roundScore > 50 && score.phaseCompleted) {
        newAchievements.push('Perseverance 💪');
      }

      if (newAchievements.length > 0) {
        setAchievements(prev => ({
          ...prev,
          [score.id]: [...new Set([...prev[score.id], ...newAchievements])]
        }));
      }
    });

    setPlayerStats(newStats);
  };

  // Predict final rankings
  const predictFinalRankings = () => {
    if (rounds.length < 3) return null;

    return players.map(player => {
      const recentScores = rounds.slice(-3).map(round => 
        round.scores.find(s => s.id === player.id).roundScore
      );
      const trend = recentScores.reduce((a, b) => a + b, 0) / 3;
      const remainingRounds = 10 - currentRound;
      const predictedFinal = player.totalScore + (trend * remainingRounds);
      
      return {
        name: player.name,
        predictedScore: Math.round(predictedFinal)
      };
    }).sort((a, b) => a.predictedScore - b.predictedScore);
  };

  // Add Statistics Section to render method
  const renderStatistics = () => {
    if (players.length === 0) return null;
    
    const predictions = predictFinalRankings();

    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <TrendingUp className="mr-2" /> Statistics
        </h2>
        {players.map(player => (
          <div key={player.id} className="bg-white shadow rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-2">{player.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>Average Score: {playerStats[player.id]?.avgScore.toFixed(1)}</p>
                <p>Best Round: {playerStats[player.id]?.bestRound === Infinity ? '-' : playerStats[player.id]?.bestRound}</p>
                <p>Worst Round: {playerStats[player.id]?.worstRound === -1 ? '-' : playerStats[player.id]?.worstRound}</p>
              </div>
              <div>
                <p>Perfect Rounds: {playerStats[player.id]?.perfectRounds}</p>
                <p>Longest Low Streak: {playerStats[player.id]?.lowStreak}</p>
                <p>Current Low Streak: {playerStats[player.id]?.currentLowStreak}</p>
              </div>
            </div>
            {achievements[player.id]?.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold flex items-center">
                  <Award className="mr-2" /> Achievements:
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {achievements[player.id].map(achievement => (
                    <span 
                      key={achievement} 
                      className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded cursor-help"
                      title={ACHIEVEMENT_DESCRIPTIONS[achievement]}
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {predictions && (
          <div className="bg-white shadow rounded-lg p-4 mt-4">
            <h3 className="font-bold text-lg mb-2">Predicted Final Rankings</h3>
            {predictions.map((pred, index) => (
              <div key={pred.name} className="flex justify-between items-center py-1">
                <span>{index + 1}. {pred.name}</span>
                <span className="text-gray-600">{pred.predictedScore}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6">Phase 10</h1>
      
      {/* Game Info */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 flex justify-between items-center">
        <div>
          <p className="font-semibold">Round: {currentRound}</p>
          <p className="font-semibold">Dealer: <span className="text-purple-600">{currentDealer?.name || 'Not Set'}</span></p>
        </div>
      </div>

      {/* Players Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Current Scores</h2>
          <button 
            onClick={() => setIsAddPlayerModalVisible(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <PlusCircle className="mr-2" /> Add Player
          </button>
        </div>
        {players.length === 0 ? (
          <p className="text-gray-500 text-center">No players added yet</p>
        ) : (
          <div className="space-y-2">
            {[...players]
              .sort((a, b) => b.currentPhase - a.currentPhase || a.totalScore - b.totalScore)
              .map(player => (
              <div 
                key={player.id} 
                className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold">{player.name}</span>
                  <span className="ml-4 text-blue-600">Score: {player.totalScore}</span>
                  <span className="ml-4 text-green-600">Phase: {player.currentPhase}</span>
                </div>
                <button 
                  onClick={() => removePlayer(player.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Round Button */}
      {players.length > 1 && (
        <button 
          onClick={beginRoundScoring}
          className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 flex items-center justify-center"
        >
          Enter scores for Round {currentRound}
        </button>
      )}

      {/* Add Statistics Section before Round History */}
      {renderStatistics()}

      {/* Round History */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Round History</h2>
        {rounds.length === 0 ? (
          <p className="text-gray-500 text-center">No rounds played yet</p>
        ) : (
          <div className="space-y-2">
            {rounds.slice().reverse().map((round, index) => (
              <div 
                key={round.roundNumber} 
                className="bg-white shadow rounded-lg p-4"
              >
                <div className="font-semibold mb-2">
                  Round {round.roundNumber} | Dealer: {round.dealer}
                </div>
                <div className="space-y-1">
                  {round.scores.map(score => (
                    <div 
                      key={score.id} 
                      className="flex justify-between items-center"
                    >
                      <div>
                        <span>{score.name}</span>
                        <span className="ml-2 text-green-600">
                          Phase {score.previousPhase}
                          {score.phaseCompleted && ' ✓'}
                        </span>
                      </div>
                      <span className="text-blue-600">{score.roundScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enter Scores Modal */}
      {isEnterScoresModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Enter scores for Round {currentRound}</h2>
            
            {/* Scoring Reference - Collapsible */}
            <div className="mb-4 text-sm border rounded">
              <button
                onClick={() => setIsScoringGuideOpen(!isScoringGuideOpen)}
                className="w-full p-2 text-left font-semibold bg-gray-50 flex justify-between items-center"
              >
                Card Points Reference
                <span>{isScoringGuideOpen ? '−' : '+'}</span>
              </button>
              {isScoringGuideOpen && (
                <div className="p-2 grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                  {Object.entries(CARD_POINTS).map(([card, points]) => (
                    <div key={card} className="flex justify-between">
                      <span>{card}:</span>
                      <span>{points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {players.map(player => (
              <div 
                key={player.id} 
                className="mb-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{player.name} (Phase {player.currentPhase})</span>
                  <input
                    type="number"
                    placeholder="Score"
                    value={currentRoundScores[player.id]}
                    onChange={(e) => updatePlayerScore(player.id, e.target.value)}
                    className="w-24 p-2 border rounded text-right"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentRoundPhaseCompleted[player.id]}
                    onChange={() => togglePhaseCompletion(player.id)}
                    className="mr-2"
                  />
                  <label>Completed Phase {player.currentPhase}</label>
                </div>
              </div>
            ))}
            <div className="flex justify-between mt-6">
              <button 
                onClick={finishRound}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Finish Round
              </button>
              <button 
                onClick={() => setIsEnterScoresModalVisible(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOverModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96 text-center">
            <Trophy className="mx-auto text-yellow-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <div className="mb-6">
              <p className="text-xl font-semibold">Winner: {currentDealer.name}</p>
              <p className="text-gray-600">First to complete Phase 10!</p>
              <p className="text-gray-600">Final Score: {currentDealer.totalScore}</p>
            </div>
            <h3 className="text-xl font-bold mb-4">Final Standings</h3>
            <div className="space-y-2">
              {players
                .sort((a, b) => b.currentPhase - a.currentPhase || a.totalScore - b.totalScore)
                .map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`flex justify-between p-2 rounded ${
                      player.id === currentDealer.id
                        ? 'bg-green-100 font-bold' 
                        : 'bg-gray-100'
                    }`}
                  >
                    <span>{player.name}</span>
                    <span>Phase {player.currentPhase - 1} | {player.totalScore}</span>
                  </div>
                ))
              }
            </div>
            <div className="flex justify-center mt-6">
              <button 
                onClick={resetGame}
                className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 flex items-center"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {isAddPlayerModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Add New Player</h2>
            <input
              type="text"
              placeholder="Player Name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-between">
              <button 
                onClick={addPlayer}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add
              </button>
              <button 
                onClick={() => setIsAddPlayerModalVisible(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseTenScorekeeper;