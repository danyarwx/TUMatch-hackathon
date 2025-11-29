import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, MapPin, Clock, Camera, Tag, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';

const categories = [
  { value: 'Study', label: 'Study Group' },
  { value: 'Social', label: 'Social' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Networking', label: 'Networking' },
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    // store time-only as HH:MM
    start_time: '',
    category: '',
    image_url: '',
    max_participants: 50,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Use the provided image URL or preview, fallback to placeholder
      const imageUrl = data.image_url || imagePreview || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800';

      // data.start_time is a time string "HH:MM" representing a time within the next 24 hours.
      // Combine it with today (or tomorrow if that time already passed) so it maps to the next 24-hour occurrence.
      const now = new Date();
      const [hourStr, minuteStr] = (data.start_time || '').split(':');
      const hour = parseInt(hourStr || '0', 10);
      const minute = parseInt(minuteStr || '0', 10);
      let combined = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
      // if selected time has already passed for today, use tomorrow
      if (combined <= now) {
        combined = new Date(combined.getTime() + 24 * 60 * 60 * 1000);
      }
      const startTime = combined.toISOString();
      const endTime = new Date(combined.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours later

      return apiClient.createEvent({
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        image_url: imageUrl,
        start_time: startTime,
        end_time: endTime,
        max_participants: data.max_participants,
        creator_id: currentUser?.id || '00000000-0000-0000-0000-000000000001',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(createPageUrl('Feed'));
    },
    onError: (error: any) => {
      console.error('Failed to create event:', error);
      alert(error.message || 'Failed to create event. Please try again.');
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.start_time) {
      return;
    }
    createMutation.mutate(formData);
  };

  const isLoading = createMutation.isPending || isUploading;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h1 className="font-semibold text-gray-900">Create Event</h1>
          <div className="w-9" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 pt-6">
        {/* Image Upload */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <label className="block">
            <div className={`relative aspect-video rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed ${imagePreview ? 'border-transparent' : 'border-gray-200 hover:border-accent'} transition-colors`}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                    <Camera className="w-7 h-7 text-accent" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Add event photo</p>
                  <p className="text-xs text-gray-400 mt-1">Tap to upload</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </motion.div>

        {/* Form Fields */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-5"
        >
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Event Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Linear Algebra Study Group"
              className="h-12 rounded-xl border-gray-200 focus:border-accent focus:ring-accent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this event about?"
              className="min-h-24 rounded-xl border-gray-200 focus:border-accent focus:ring-accent resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-gray-200">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., TUM Library, Garching"
                className="h-12 pl-12 rounded-xl border-gray-200 focus:border-accent focus:ring-accent"
              />
            </div>
          </div>

          {/* Time (next 24 hours, 15-minute increments) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Time (next 24 hours)</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {/* Use the Select component to force selection (scrollable) with 15-minute steps */}
              <Select
                value={formData.start_time}
                onValueChange={(value) => setFormData({ ...formData, start_time: value })}
              >
                <SelectTrigger className="h-12 pl-12 rounded-xl border-gray-200">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {React.useMemo(() => {
                    const opts = [];
                    const now = new Date();
                    // round up to next 15-minute increment
                    const start = new Date(now);
                    start.setSeconds(0, 0);
                    const mins = start.getMinutes();
                    const rem = mins % 15;
                    if (rem !== 0) start.setMinutes(mins + (15 - rem));
                    for (let i = 0; i < 96; i++) {
                      const dt = new Date(start.getTime() + i * 15 * 60 * 1000);
                      const hh = dt.getHours().toString().padStart(2, '0');
                      const mm = dt.getMinutes().toString().padStart(2, '0');
                      const value = `${hh}:${mm}`;
                      const label = `${hh}:${mm} ${dt.toDateString() === now.toDateString() ? '(Today)' : '(Tomorrow)'}`;
                      opts.push({ value, label });
                    }
                    return opts.map((opt) => (
                      <SelectItem key={opt.value + opt.label} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ));
                  }, [])}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-400 mt-2">Pick a time by scrolling (15-minute steps); it will schedule for the next occurrence.</p>
          </div>

          {/* Max Participants */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Max Participants</label>
            <Input
              type="number"
              min="2"
              max="500"
              value={formData.max_participants}
              onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
              className="h-12 rounded-xl border-gray-200 focus:border-accent focus:ring-accent"
            />
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Button
            type="submit"
            disabled={isLoading || !formData.title || !formData.location || !formData.start_time}
            className="w-full h-14 rounded-2xl bg-accent text-black text-lg font-semibold hover:bg-accent-dark shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </div>
            ) : (
              'Create Event'
            )}
          </Button>
        </motion.div>
      </form>

      <BottomNav currentPage="CreateEvent" />
    </div>
  );
}
