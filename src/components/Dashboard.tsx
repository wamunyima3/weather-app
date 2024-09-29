import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw, MapPin, X, Calendar, Clock, Droplet, Menu, Sun, Thermometer, Wind } from 'lucide-react';
import CurrentWeather from './CurrentWeather';
import Forecast from './Forecast';
import SearchHistory from './SearchHistory';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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
          <SearchHistorySidebar onClose={() => setIsSidebarOpen(false)} />
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
                  <SearchHistorySidebar />
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

          {currentWeather && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2" />
                  Current Weather in {currentWeather.city_name}, {currentWeather.country_code}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Thermometer className="mr-2" />
                  <span>Temperature: {currentWeather.temp}°C (Feels like: {currentWeather.app_temp}°C)</span>
                </div>
                <div className="flex items-center">
                  <Sun className="mr-2" />
                  <span>Weather: {currentWeather.weather.description}</span>
                </div>
                <div className="flex items-center">
                  <Wind className="mr-2" />
                  <span>Wind Speed: {currentWeather.wind_spd} m/s</span>
                </div>
                <div className="flex items-center">
                  <Droplet className="mr-2" />
                  <span>Humidity: {currentWeather.rh}%</span>
                </div>
                <div className="flex items-center">
                  <span>Air Quality Index: {currentWeather.aqi}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2" />
                  <span>Observation Time: {currentWeather.ob_time}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {forecast && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2" />
                  16-Day Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="list" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                  </TabsList>
                  <TabsContent value="list">
                    <div className="space-y-4">
                      {forecast.map((day, index) => (
                        <Card key={index}>
                          <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
                            <div className="font-bold">{day.datetime}</div>
                            <div>Max: {day.max_temp.toFixed(1)}°C / Min: {day.min_temp.toFixed(1)}°C</div>
                            <div>{day.weather.description}</div>
                            <div>Precip: {day.precip.toFixed(1)}mm</div>
                            <div>UV: {day.uv.toFixed(1)}</div>
                            <div>{day.wind_cdir_full} {day.wind_spd.toFixed(1)} m/s</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="grid">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {forecast.map((day, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="font-bold mb-2">{day.datetime}</div>
                            <div>Max: {day.max_temp.toFixed(1)}°C</div>
                            <div>Min: {day.min_temp.toFixed(1)}°C</div>
                            <div>{day.weather.description}</div>
                            <div>Precip: {day.precip.toFixed(1)}mm</div>
                            <div>UV: {day.uv.toFixed(1)}</div>
                            <div>{day.wind_cdir_full}</div>
                            <div>{day.wind_spd.toFixed(1)} m/s</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
