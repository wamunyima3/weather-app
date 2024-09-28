// /src/App.tsx

import React from 'react';
import WeatherSearch from './components/WeatherSearch';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold underline mb-4">Weather Application</h1>
      <WeatherSearch />
    </div>
  );
}

export default App;
