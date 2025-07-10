import React, { useState, useEffect } from 'react';
import { searchImages, getCuratedImages } from '../../services/imageService';

const ImageSelector = ({ onImageSelect, allowUpload = false }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('pexels');
    const [uploadedImage, setUploadedImage] = useState(null); 

    useEffect(() => {
        if (selectedTab === 'pexels') {
            
            loadCuratedImages();
        }
    }, [selectedTab]);

    
    useEffect(() => {
        if (selectedTab === 'pexels' && query) {
            searchImagesForPosts(query);
        }
    }, [query, selectedTab]);

    const searchImagesForPosts = async (searchQueryParam) => {
        setLoading(true);
        setError(null);
        try {
            const results = await searchImages(searchQueryParam, 1, 12);
            setImages(results.photos || []);
        } catch (error) {
            console.error('Error searching images:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadCuratedImages = async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await getCuratedImages(1, 12);
            setImages(results.photos || []);
        } catch (error) {
            console.error('Error loading curated images:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

   
    const handleSearch = () => {
        if (query.trim()) {
            setSearchQuery(query.trim());
        } else {
           
            loadCuratedImages();
        }
    };

    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleImageSelect = (image) => {
        
        
        try {
            const imageData = {
                id: image.id,
                pexelsId: String(image.id),
                url: image.src.large,
                thumbnail: image.src.medium,
                photographer: image.photographer,
                photographer_url: image.photographer_url,
                alt: image.alt,
                source: 'pexels'
            };
            
          
            
            if (typeof onImageSelect === 'function') {
                onImageSelect(imageData);
               
            } else {
                console.error('ImageSelector: onImageSelect is not a function:', onImageSelect);
            }
        } catch (error) {
            console.error('ImageSelector: Error in handleImageSelect:', error);
        }
    };

    const handleFileUpload = (event) => {
        
        const file = event.target.files[0];
        if (file) {
            
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                console.error('ImageSelector: File too large:', file.size);
                setError('File size must be less than 2MB');
                return;
            }

            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                console.error('ImageSelector: Invalid file type:', file.type);
                setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Data = e.target.result;
               
                
               
                setUploadedImage({
                    id: `upload_${Date.now()}`,
                    url: base64Data,
                    thumbnail: base64Data,
                    alt: file.name,
                    source: 'upload',
                    originalName: file.name,
                    mimeType: file.type,
                    size: file.size
                });
                setError(null); 
            };
            reader.onerror = () => {
                console.error('ImageSelector: Error reading file');
                setError('Error reading file');
            };
            reader.readAsDataURL(file);
        }
    };


    const handleUploadedImageSelect = () => {
        if (uploadedImage && typeof onImageSelect === 'function') {
            onImageSelect(uploadedImage);
        }
    };


    const handleTabChange = (tab) => {
        setSelectedTab(tab);
        setError(null);
        if (tab !== 'upload') {
            setUploadedImage(null);
        }
    };

    return (
        <div className="image-selector glass-card rounded-lg shadow-lg p-6">

            <div className="flex mb-4 border-b">
                <button
                    type="button"
                    className={`px-4 py-2 font-medium ${selectedTab === 'pexels' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => handleTabChange('pexels')}
                >
                    Pexels Images
                </button>
                {allowUpload && (
                    <button
                        type="button"
                        className={`px-4 py-2 font-medium ${selectedTab === 'upload' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                        onClick={() => handleTabChange('upload')}
                    >
                        Upload Image
                    </button>
                )}
            </div>

            {selectedTab === 'pexels' && (
                <>

                    <div className="search-container mb-4 flex gap-2">
                        <input
                            type="text"
                            placeholder="Search images..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                    

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    

                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-2">Loading images...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
                            {images.map((image) => (
                                <div
                                    key={image.id}
                                    className="relative cursor-pointer group hover:scale-105 transition-transform"
                                    onClick={() => handleImageSelect(image)}
                                >
                                    <img
                                        src={image.src.medium}
                                        alt={image.alt}
                                        loading="lazy"
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <small>By: {image.photographer}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {selectedTab === 'upload' && allowUpload && (
                <div className="upload-container">

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    {!uploadedImage ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="cursor-pointer">
                                <div className="text-gray-500">
                                    <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="text-lg font-medium">Click to upload an image</p>
                                    <p className="text-sm">PNG, JPG, GIF up to 2MB</p>
                                </div>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">

                            <div className="relative">
                                <img
                                    src={uploadedImage.url}
                                    alt={uploadedImage.alt}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                                    <p className="text-sm truncate">{uploadedImage.originalName}</p>
                                    <p className="text-xs">{(uploadedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleUploadedImageSelect}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Use This Image
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadedImage(null)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Choose Different
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ImageSelector;
