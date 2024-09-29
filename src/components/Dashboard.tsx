import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw, MapPin, X, Menu,} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import CurrentWeather from './CurrentWeather';
import Forecast from './Forecast';
import SearchHistory from './SearchHistory';

// Define the types for search history and forecast data
interface SearchHistoryRecord {
  city: string;
  country: string;
  timestamp: string;
}

interface ForecastData {
  max_temp: number;
  min_temp: number;
  weather: { description: string };
  precip: number;
  uv: number;
  wind_spd: number;
  wind_cdir_full: string;
  datetime: string;
}

const Dashboard: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<ForecastData[] | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const currentResponse = await axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/current`, {
        params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY },
      });
      setCurrentWeather(currentResponse.data.data[0]);

      const forecastResponse = await axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/forecast/daily`, {
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
    else setSearchHistory(data as SearchHistoryRecord[]);
  };

  const SearchHistorySidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="w-64 bg-white p-4 border-r border-gray-200 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Search History</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ul className="space-y-2">
        {searchHistory.map((item, index) => (
          <li key={index} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{item.city}, {item.country}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
<div className="min-h-screen bg-gray-100 flex">
      {isSidebarOpen && (
        <div className="hidden md:block">
          <SearchHistory searchHistory={searchHistory} onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Weather App</h1>
            <div className="flex space-x-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SearchHistory searchHistory={searchHistory} />
                </SheetContent>
              </Sheet>
              {!isSidebarOpen && (
                <Button variant="outline" className="hidden md:flex" onClick={() => setIsSidebarOpen(true)}>
                  <Menu className="h-4 w-4 mr-2" />
                  Show History
                </Button>
              )}
            </div>
          </div>
          
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
