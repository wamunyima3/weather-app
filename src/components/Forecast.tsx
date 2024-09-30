import { useState, useEffect } from 'react';
import { Calendar, Thermometer, CloudRain, Sun, Wind, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button"

interface ForecastDay {
  datetime: string;
  max_temp: number;
  min_temp: number;
  weather: { description: string };
  precip: number;
  uv: number;
  wind_cdir_full: string;
  wind_spd: number;
}

interface ForecastProps {
  data: ForecastDay[];
}

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Forecast({ data }: ForecastProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState<'list' | 'grid'>('list');
  const itemsPerPage = 5;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when data changes
  }, [data]);

  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 text-indigo-500" />
              16-Day Forecast
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'list' | 'grid')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>
            <AnimatePresence>
              <TabsContent key="list" value="list">
                <motion.div className="space-y-4" variants={containerVariants}>
                  {paginatedData.map((day) => (
                    <motion.div key={`list-${day.datetime}`} variants={itemVariants}>
                      <Card>
                        <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4">
                          <div className="font-bold">{day.datetime}</div>
                          <div className="flex items-center">
                            <Thermometer className="mr-2 text-amber-500" />
                            Max: {day.max_temp.toFixed(1)}°C / Min: {day.min_temp.toFixed(1)}°C
                          </div>
                          <div className="flex items-center">
                            <Sun className="mr-2 text-yellow-500" />
                            {day.weather.description}
                          </div>
                          <div className="flex items-center">
                            <CloudRain className="mr-2 text-blue-500" />
                            Precip: {day.precip.toFixed(1)}mm
                          </div>
                          <div className="flex items-center">
                            <Sun className="mr-2 text-orange-500" />
                            UV: {day.uv.toFixed(1)}
                          </div>
                          <div className="flex items-center">
                            <Wind className="mr-2 text-sky-500" />
                            {day.wind_cdir_full} {day.wind_spd.toFixed(1)} m/s
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
              <TabsContent key="grid" value="grid">
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4" variants={containerVariants}>
                  {paginatedData.map((day) => (
                    <motion.div key={`grid-${day.datetime}`} variants={itemVariants}>
                      <Card>
                        <CardContent className="p-4">
                          <div className="font-bold mb-2">{day.datetime}</div>
                          <div className="flex items-center">
                            <Thermometer className="mr-2 text-amber-500" />
                            Max: {day.max_temp.toFixed(1)}°C
                          </div>
                          <div className="flex items-center">
                            <Thermometer className="mr-2 text-blue-500" />
                            Min: {day.min_temp.toFixed(1)}°C
                          </div>
                          <div className="flex items-center">
                            <Sun className="mr-2 text-yellow-500" />
                            {day.weather.description}
                          </div>
                          <div className="flex items-center">
                            <CloudRain className="mr-2 text-blue-500" />
                            Precip: {day.precip.toFixed(1)}mm
                          </div>
                          <div className="flex items-center">
                            <Sun className="mr-2 text-orange-500" />
                            UV: {day.uv.toFixed(1)}
                          </div>
                          <div className="flex items-center">
                            <Wind className="mr-2 text-sky-500" />
                            {day.wind_cdir_full}
                          </div>
                          <div className="flex items-center">
                            <Wind className="mr-2 text-teal-500" />
                            {day.wind_spd.toFixed(1)} m/s
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>{currentPage} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}