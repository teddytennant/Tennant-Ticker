import React, { useState, useCallback, memo } from 'react';
import { 
  PopoverForm, 
  PopoverFormButton, 
  PopoverFormSuccess,
  PopoverFormSeparator
} from './ui/popover-form';
import { MessageSquare, Star } from 'lucide-react';

type FeedbackType = 'general' | 'feature' | 'bug';

export const FeedbackForm = memo(function FeedbackForm() {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setOpen(false);
        setFeedback('');
        setEmail('');
        setRating(null);
        setFeedbackType('general');
      }, 3000);
    }, 1000);
  }, []);

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
  }, []);

  const handleFeedbackTypeChange = useCallback((type: FeedbackType) => {
    setFeedbackType(type);
  }, []);

  const handleFeedbackChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handleRatingChange = useCallback((value: number) => {
    setRating(value);
  }, []);

  const feedbackForm = (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-medium text-foreground">Share Your Feedback</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Help us improve Tennant Ticker with your valuable input.
        </p>
      </div>
      
      <PopoverFormSeparator />
      
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-foreground">
            Feedback Type
          </label>
          <div className="flex space-x-2">
            {[
              { value: 'general', label: 'General' },
              { value: 'feature', label: 'Feature Request' },
              { value: 'bug', label: 'Bug Report' }
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleFeedbackTypeChange(type.value as FeedbackType)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  feedbackType === type.value
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-muted text-muted-foreground border border-transparent hover:border-border'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="feedback" className="block text-xs font-medium text-foreground">
            Your Feedback
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={handleFeedbackChange}
            placeholder="Tell us what you think..."
            className="w-full h-24 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background border-input resize-none"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-xs font-medium text-foreground">
            Rate Your Experience
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-5 w-5 ${
                    rating !== null && star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground hover:text-yellow-400'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-xs font-medium text-foreground">
            Email (optional)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="your@email.com"
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background border-input"
          />
          <p className="text-xs text-muted-foreground">
            We'll only use this to follow up on your feedback if needed.
          </p>
        </div>
      </div>
      
      <div className="p-4 pt-2 border-t border-border">
        <div className="flex justify-end">
          <PopoverFormButton loading={loading} text="Submit Feedback" />
        </div>
      </div>
    </form>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => handleOpenChange(true)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Open feedback form"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
        
        <div className="absolute bottom-full right-0 mb-2">
          <PopoverForm
            open={open}
            setOpen={handleOpenChange}
            openChild={feedbackForm}
            showSuccess={showSuccess}
            successChild={
              <PopoverFormSuccess 
                title="Thank You!" 
                description="We appreciate your feedback and will use it to improve Tennant Ticker."
              />
            }
            width="380px"
            height="480px"
            title="Feedback"
            showCloseButton={true}
          />
        </div>
      </div>
    </div>
  );
}); 