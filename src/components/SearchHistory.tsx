import React from 'react';

interface SearchHistoryProps {
    history: { city: string; country: string }[];
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ history }) => {
    return (
        <div className="bg-gray-100 p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Search History</h2>
            <ul className="list-disc ml-4">
                {history.map((item, index) => (
                    <li key={index}>
                        {item.city}, {item.country}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchHistory;
