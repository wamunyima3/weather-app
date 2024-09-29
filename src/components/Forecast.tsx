import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function Forecast({ data }: ForecastProps) {
  return (
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
              {data.map((day, index) => (
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
              {data.map((day, index) => (
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
  );
}