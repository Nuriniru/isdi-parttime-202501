import React, { useState, useRef, useEffect } from 'react';
import { searchHashtags } from '../../services/hashtagService';

const HashtagInput = ({ value, onChange, placeholder = "Add hashtags..." }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Extract hashtags from text
    const extractHashtags = (text) => {
        const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi;
        return text.match(hashtagRegex) || [];
    };

    // Search for hashtag suggestions
    const searchSuggestions = async (query) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const results = await searchHashtags(query);
            setSuggestions(results.slice(0, 5)); // Limit to 5 suggestions
        } catch (error) {
            console.error('Error searching hashtags:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);

        // Check if user is typing a hashtag
        const words = newValue.split(/\s+/);
        const lastWord = words[words.length - 1];
        
        if (lastWord.startsWith('#') && lastWord.length > 1) {
            const query = lastWord.substring(1); // Remove # symbol
            searchSuggestions(query);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (hashtag) => {
        const words = inputValue.split(/\s+/);
        words[words.length - 1] = `#${hashtag.name}`;
        const newValue = words.join(' ') + ' ';
        
        setInputValue(newValue);
        onChange(newValue);
        setShowSuggestions(false);
        setSuggestions([]);
        inputRef.current?.focus();
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setShowSuggestions(false);
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync with external value changes
    useEffect(() => {
        if (value !== inputValue) {
            setInputValue(value);
        }
    }, [value]);

    return (
        <div className="relative">
            <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-colors resize-none text-white placeholder-white/60 backdrop-blur-sm"
                rows={3}
            />
            
            {/* Hashtag suggestions dropdown */}
            {showSuggestions && (suggestions.length > 0 || loading) && (
                <div 
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                >
                    {loading ? (
                        <div className="px-3 py-2 text-white/70 text-sm">
                            Searching hashtags...
                        </div>
                    ) : (
                        suggestions.map((hashtag, index) => (
                            <button
                                key={`suggestion-${hashtag.name}-${hashtag.id || index}`}
                                onClick={() => handleSuggestionClick(hashtag)}
                                className="w-full px-3 py-2 text-left hover:bg-white/10 focus:bg-white/10 focus:outline-none transition-colors"
                            >
                                <span className="text-purple-300 font-medium">#{hashtag.name}</span>
                                <span className="text-white/60 text-sm ml-2">({hashtag.count} posts)</span>
                            </button>
                        ))
                    )}
                </div>
            )}
            
            {/* Display extracted hashtags */}
            {inputValue && (
                <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                        {extractHashtags(inputValue).map((hashtag, index) => (
                            <span 
                                key={`extracted-${hashtag}-${index}`}
                                className="inline-block bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-400/30"
                            >
                                {hashtag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HashtagInput;