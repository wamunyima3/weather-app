import { Calendar, Thermometer, CloudRain, Sun, Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from 'framer-motion';

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
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 text-indigo-500" />
            16-Day Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>
            <AnimatePresence>
              <TabsContent key="list" value="list">
                <motion.div className="space-y-4" variants={containerVariants}>
                  {data.map((day) => (
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
              <TabsContent value="grid">
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" variants={containerVariants}>
                  {data.map((day, index) => (
                    <motion.div key={index} variants={itemVariants}>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}