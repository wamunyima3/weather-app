import { MapPin, X } from 'lucide-react';
import { Button } from "@/components/ui/button"

interface SearchHistoryItem {
  city: string;
  country: string;
}

interface SearchHistorySidebarProps {
  searchHistory: SearchHistoryItem[];
  onClose?: () => void;
}

export default function SearchHistory({ searchHistory, onClose }: SearchHistorySidebarProps) {
  return (
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
}