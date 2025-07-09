import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '../common/Button';
import Input from '../common/Input';
import HashtagInput from '../common/HashtagInput';
import ImageSelector from '../common/ImageSelector';
import { createPost } from '../../services/postService';
import { validator, errors } from 'common';
import { useValidation } from '../../hooks/useValidation';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showImageSelector, setShowImageSelector] = useState(false);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle content change (includes hashtags)
    const handleContentChange = (content) => {
        setFormData(prev => ({
            ...prev,
            content
        }));
    };

    // Handle image selection
    const handleImageSelect = (imageData) => {
        // console.log('CreatePostModal: Image selected:', imageData);
        setFormData(prev => ({
            ...prev,
            image: {
                url: imageData.url,
                thumbnail: imageData.thumbnail,
                photographer: imageData.photographer,
                photographerUrl: imageData.photographer_url,
                alt: imageData.alt,
                source: imageData.source,
                pexelsId: imageData.pexelsId
            }
        }));
        setShowImageSelector(false);
    };

    // Remove selected image
    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            image: null
        }));
    };

    // Handle form submission
    const { validationErrors, validateField, clearErrors } = useValidation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearErrors(); 
        
        // Use common package text validator
        try {
          validator.text(formData.title.trim(), 100, 1, 'Title');
          validator.text(formData.content.trim(), 2000, 1, 'Content');
        } catch (error) {
          if (error instanceof errors.RangeError) {
            setError(error.message);
            return;
          }
        }

        setLoading(true);
        setError(null);

        try {
            const postData = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                ...(formData.image && { image: formData.image })
            };

            // console.log('Creating post with data:', postData);
            const newPost = await createPost(postData);
            console.log('Created post response:', newPost); // Add this line

            if (onPostCreated) {
                onPostCreated(newPost);
            }
            // Reset form
            setFormData({ title: '', content: '', image: null });
            
            // Notify parent component
            if (onPostCreated) {
                onPostCreated(newPost);
            }
            
            // Close modal
            onClose();
        } catch (error) {
            console.error('Error creating post:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle modal close
    const handleClose = () => {
        if (!loading) {
            setFormData({ title: '', content: '', image: null });
            setError(null);
            setShowImageSelector(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="glass-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                    <h2 className="text-xl font-semibold text-white">Create New Post</h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Title Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-white mb-2">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="What's your post about?"
                            required
                            disabled={loading}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-colors text-white placeholder-white/60 backdrop-blur-sm"
                        />
                    </div>

                    {/* Content Input with Hashtags */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-white mb-2">
                            Content <span className="text-red-400">*</span>
                        </label>
                        <HashtagInput
                            value={formData.content}
                            onChange={handleContentChange}
                            placeholder="Share your thoughts... Use #hashtags to categorize your post!"
                        />
                        <p className="text-xs text-white/60 mt-1">
                            Tip: Use hashtags like #travel #food #photography to help others discover your post!
                        </p>
                    </div>

                    {/* Image Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image (Optional)
                        </label>
                        
                        {formData.image ? (
                            <div className="relative">
                                <img 
                                    src={formData.image.url} 
                                    alt={formData.image.alt}
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                {formData.image.photographer && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Photo by{' '}
                                        <a 
                                            href={formData.image.photographerUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            {formData.image.photographer}
                                        </a>
                                        {' '}on Pexels
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowImageSelector(!showImageSelector)}
                                    disabled={loading}
                                >
                                    {showImageSelector ? 'Hide Image Selector' : 'Add Image'}
                                </Button>
                                
                                {showImageSelector && (
                                    <div className="mt-4 border rounded-lg p-4">
                                        <ImageSelector 
                                            onImageSelect={handleImageSelect}
                                            allowUpload={true}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.title.trim() || !formData.content.trim()}
                        >
                            {loading ? 'Creating...' : 'Create Post'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default CreatePostModal;