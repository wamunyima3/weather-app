import { MapPin, X, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion';

interface SearchHistoryItem {
  id: number;
  city: string;
  country: string;
}

interface SearchHistorySidebarProps {
  searchHistory: SearchHistoryItem[];
  onClose?: () => void;
  onHistoryClick: (search_id: number) => void;
  onClearHistory: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function SearchHistory({ searchHistory, onClose, onHistoryClick, onClearHistory }: SearchHistorySidebarProps) {
  return (
    <motion.div
      className="w-64 bg-white p-4 border-r border-gray-200 h-full overflow-y-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Search History</h2>
        {onClose && (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        <motion.ul className="space-y-2">
          {searchHistory.map((item) => (
            <motion.li
              key={item.id}
              className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onHistoryClick(item.id)} 
            >
              <MapPin className="mr-2 h-4 w-4 text-rose-500" />
              <span>{item.city}, {item.country}</span>
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
      {searchHistory.length > 0 && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Button
            variant="outline"
            className="w-full"
            onClick={onClearHistory}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}