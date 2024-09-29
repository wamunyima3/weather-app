import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, RefreshCcw } from 'lucide-react';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import SearchHistory from './components/SearchHistory';

// Define the types for the search history and forecast data
interface SearchHistoryRecord {
  city: string;
  country: string;
  timestamp: string; // Assuming there's a timestamp field in your Supabase table
}

interface ForecastData {
  temp: number;
  // Add other properties based on the structure of your forecast data
}

const App: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<any>(null); // Type this based on the current weather data response
  const [forecast, setForecast] = useState<ForecastData[] | null>(null); // Use appropriate typing for forecast data
  const [searchHistory, setSearchHistory] = useState<SearchHistoryRecord[]>([]); // Properly typed search history
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const currentResponse = await axios.get(`https://api.weatherbit.io/v2.0/current`, {
        params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY },
      });
      setCurrentWeather(currentResponse.data.data[0]);

      const forecastResponse = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily`, {
        params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY, days: 16 },
      });
      setForecast(forecastResponse.data.data);

      // Save search to Supabase
      const { error } = await supabase.from('search_history').insert([{ city, country }]);
      if (error) console.error('Error saving search history:', error);

      fetchSearchHistory();
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchHistory = async () => {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (error) console.error('Failed to fetch search history:', error);
    else setSearchHistory(data as SearchHistoryRecord[]); // Type assertion to handle data correctly
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900">Weather App</h1>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="flex-grow"
          />
          <Input
            type="text"
            placeholder="Country Code"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
        </form>

        {currentWeather && <CurrentWeather data={currentWeather} />}
        {forecast && <Forecast data={forecast} />}
        <SearchHistory history={searchHistory} />
      </div>
    </div>
  );
};

export default App;
