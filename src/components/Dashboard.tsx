import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw, Menu, X } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CurrentWeather from './CurrentWeather';
import Forecast from './Forecast';
import SearchHistory from './SearchHistory';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

const CACHE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

const Dashboard: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const session = useSession();
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    if (session) {
      fetchSearchHistory();
    }
  }, [session]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const cacheKey = `${city}-${country}`;
    const cachedData = await getCachedData(cacheKey);

    if (cachedData) {
      setCurrentWeather(cachedData.currentWeather);
      setForecast(cachedData.forecast);
      setIsLoading(false);
    } else {
      await fetchWeatherData();
    }
  };

  const fetchWeatherData = async () => {
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/current`, {
          params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY },
        }),
        axios.get(`${import.meta.env.VITE_WEATHERBIT_URL}/forecast/daily`, {
          params: { city, country, key: import.meta.env.VITE_WEATHERBIT_API_KEY, days: 16 },
        }),
      ]);

      const currentWeatherData = currentResponse.data.data[0];
      const forecastData = forecastResponse.data.data;

      setCurrentWeather(currentWeatherData);
      setForecast(forecastData);

      // Cache the data in Supabase
      await cacheWeatherData(`${city}-${country}`, currentWeatherData, forecastData);

      // Save search to Supabase if authenticated
      if (session) {
        const { error } = await supabase
          .from('search_history')
          .insert([{ city, country, user_id: session.user.id }]);
        
        if (error) console.error('Error saving search history:', error);
        
        fetchSearchHistory();
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCachedData = async (cacheKey: string) => {
    const { data, error } = await supabase
      .from('weather_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .single();

    if (error || !data) return null;

    const isDataFresh = Date.now() - new Date(data.created_at).getTime() < CACHE_TIMEOUT;
    return isDataFresh ? data : null;
  };

  const cacheWeatherData = async (cacheKey: string, currentWeather: any, forecast: any[]) => {
    const { error } = await supabase
      .from('weather_cache')
      .upsert({
        cache_key: cacheKey,
        current_weather: currentWeather,
        forecast: forecast,
        created_at: new Date().toISOString(),
      });

    if (error) console.error('Failed to cache weather data:', error);
  };

  const fetchSearchHistory = async () => {
    if (!session) return;

    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Failed to fetch search history:', error);
    } else {
      setSearchHistory(data || []);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error('Error logging out:', error);
  };

  const SearchHistorySidebar = ({ onClose }: { onClose: () => void }) => (
    <div className="w-64 bg-white p-4 border-r border-gray-200 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Search History</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-2">
        {searchHistory.map((item, index) => (
          <li key={index} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
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
          <SearchHistorySidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Weather App</h1>

          <div className="flex justify-between items-center">
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
                {isLoading ? (
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
            </form>

            {/* Mobile Navigation for Search History */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SearchHistory history={searchHistory} />
              </SheetContent>
            </Sheet>
          </div>

          {/* Current Weather Component */}
          {currentWeather && <CurrentWeather data={currentWeather} />}

          {/* Weather Forecast Tabs for List and Grid Views */}
          <Tabs defaultValue="list" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <div className="space-y-4">
                {forecast.map((day, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-white shadow">
                    <div className="font-bold">{day.datetime}</div>
                    <div>Max: {day.max_temp}°C / Min: {day.min_temp}°C</div>
                    <div>{day.weather.description}</div>
                    <div>Precip: {day.precip}mm</div>
                    <div>UV: {day.uv}</div>
                    <div>{day.wind_cdir_full} {day.wind_spd} m/s</div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="grid">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {forecast.map((day, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-white shadow">
                    <div className="font-bold">{day.datetime}</div>
                    <div>Max: {day.max_temp}°C / Min: {day.min_temp}°C</div>
                    <div>{day.weather.description}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
