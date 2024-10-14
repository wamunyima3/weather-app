"use client"

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw, Menu, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import CurrentWeather from './CurrentWeather';
import Forecast from './Forecast';
import SearchHistory from './SearchHistory';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast"
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton"
import { fetchSearchHistory, fetchWeatherData, saveSearch, clearSearchHistory, signOut, getSession } from './api'

interface SearchHistoryRecord {
  id: number;
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

export default function Dashboard() {
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<ForecastData[] | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { session } = await getSession()
        setSession(session)
        if (!session) {
          navigate('/')
        }
      } catch (error) {
        console.error('Error checking session:', error)
        navigate('/')
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        navigate('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (session) {
      handleFetchSearchHistory();
    }
  }, [session]);

  const handleFetchSearchHistory = async () => {
    try {
      const data = await fetchSearchHistory(session!.user.id);
      setSearchHistory(data);

      if (data.length > 0) {
        const lastSearch = data[0];
        setCity(lastSearch.city);
        setCountry(lastSearch.country);
        await handleFetchWeatherData(lastSearch.id, lastSearch.city, lastSearch.country);
      }
    } catch (error) {
      console.error('Failed to fetch search history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch search history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFetchWeatherData = async (searchId: number, city: string, country: string) => {
    setIsLoading(true);
    try {
      const data = await fetchWeatherData(searchId, city, country);
      setCurrentWeather(data.current_weather);
      setForecast(data.forecast);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!city.trim() || !country.trim()) {
      toast({
        title: "Error",
        description: "Please enter both city and country.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const searchId = await saveSearch(session!.user.id, city, country);
      await handleFetchWeatherData(searchId, city.trim(), country.trim());
      await handleFetchSearchHistory();
    } catch (error) {
      console.error('Error handling search:', error);
      toast({
        title: "Error",
        description: "Failed to process your search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryClick = async (searchId: number) => {
    setIsSheetOpen(false);
    const historyItem = searchHistory.find(item => item.id === searchId);
    if (historyItem) {
      setCity(historyItem.city);
      setCountry(historyItem.country);
      await handleFetchWeatherData(searchId, historyItem.city, historyItem.country);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory();
      setSearchHistory([]);
      setCity('');
      setCountry('');
      setCurrentWeather(null);
      setForecast(null);
      toast({
        title: "Success",
        description: "Search history cleared successfully.",
      });
    } catch (error) {
      console.error('Error clearing search history:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while clearing search history.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-100 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="hidden md:block w-64 bg-white shadow-lg"
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <SearchHistory
              searchHistory={searchHistory}
              onClose={() => setIsSidebarOpen(false)}
              onHistoryClick={handleHistoryClick}
              onClearHistory={handleClearHistory}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            className="flex items-center justify-between"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Weather App</h1>
            <div className="flex space-x-2">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden" aria-label="Open search history">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Search History</SheetTitle>
                    <SheetDescription>
                      Your recent searches are stored here
                    </SheetDescription>
                  </SheetHeader>
                  <SearchHistory
                    searchHistory={searchHistory}
                    onHistoryClick={handleHistoryClick}
                    onClearHistory={handleClearHistory}
                  />
                </SheetContent>
              </Sheet>
              {!isSidebarOpen && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="hidden md:flex" onClick={() => setIsSidebarOpen(true)} aria-label="Show search history">
                    <Menu className="h-4 w-4 mr-2" />
                    Show History
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={handleSignOut} aria-label="Sign out">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="flex-grow"
              aria-label="Enter city name"
            />
            <Input
              type="text"
              placeholder="Country Code"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="flex-grow"
              aria-label="Enter country code"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button type="submit" disabled={isLoading} aria-label="Search weather">
                {isLoading ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </motion.div>
          </motion.form>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Skeleton className="w-full h-[200px] rounded-lg bg-gray-200" />
                <Skeleton className="w-full h-[400px] mt-4 rounded-lg bg-gray-200" />
              </motion.div>
            ) : (
              <>
                {currentWeather && (
                  <motion.div
                    key="current-weather"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CurrentWeather data={currentWeather} />
                  </motion.div>
                )}
                {forecast && (
                  <motion.div
                    key="forecast"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Forecast data={forecast} />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}