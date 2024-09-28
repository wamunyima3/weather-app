import { useState } from 'react';
import { supabase } from '../supabaseClient';

// Define an interface for the weather data
interface WeatherData {
  city_name: string;
  country_code: string;
  temp: number;
  app_temp: number;
  weather: {
    description: string;
  };
  wind_spd: number;
  rh: number;
  aqi: number;
  ob_time: string;
}

const WeatherSearch = () => {
  const [city, setCity] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    const url = `${import.meta.env.VITE_WEATHER_URL}/current?city=${city}&country=${countryCode}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.data && data.data.length > 0) {
        setWeather(data.data[0] as WeatherData); // Type casting to WeatherData
        setError(null); // Clear error if successful

        // Optionally store search in Supabase
        await supabase.from('searches').insert([{ city, country_code: countryCode }]);
      } else {
        setError('No weather data found for the provided city.');
        setWeather(null);
      }
    } catch (error) {
      console.error('Error fetching weather data', error);
      setError('Failed to fetch weather data. Please try again.');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Country Code"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded"
          onClick={fetchWeather}
        >
          Get Weather
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {weather && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h3 className="text-xl font-bold">
            Weather in {weather.city_name}, {weather.country_code}
          </h3>
          <p>Temperature: {weather.temp}°C</p>
          <p>Feels like: {weather.app_temp}°C</p>
          <p>Weather: {weather.weather.description}</p>
          <p>Wind Speed: {weather.wind_spd} m/s</p>
          <p>Humidity: {weather.rh}%</p>
          <p>Air Quality Index: {weather.aqi}</p>
          <p>Observation Time: {weather.ob_time}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherSearch;
