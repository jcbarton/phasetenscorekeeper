import React from 'react';
import PhasetenScorekeeper from './scorekeeper';

function App() {
  return (
    <div className="min-h-screen bg-phase-white">
      <header className="bg-phase-red p-4 shadow-lg">
        <h1 className="text-phase-white text-2xl font-bold text-center">Phase 10 Scorekeeper</h1>
      </header>
      <main className="container mx-auto p-4">
        <PhasetenScorekeeper />
      </main>
    </div>
  );
}

export default App;
