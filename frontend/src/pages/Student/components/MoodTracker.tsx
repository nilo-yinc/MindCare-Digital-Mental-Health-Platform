import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Mic, Volume2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { apiRequest } from '../../../lib/api';

export function MoodTracker() {
  const { token } = useAuth();
  const [mood, setMood] = useState(7);
  const [note, setNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState<{ moodScore: number; stressLevel: string; primaryEmotion: string; recommendation: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const moods = [
    { value: 1, emoji: '😢', label: 'Very Sad', color: 'text-red-500' },
    { value: 2, emoji: '😞', label: 'Sad', color: 'text-red-400' },
    { value: 3, emoji: '😐', label: 'Okay', color: 'text-yellow-500' },
    { value: 4, emoji: '🙂', label: 'Good', color: 'text-green-400' },
    { value: 5, emoji: '😊', label: 'Great', color: 'text-green-500' },
  ];

  const handleSaveMood = async () => {
    setIsSaving(true);

    try {
      if (!token) {
        throw new Error('Please sign in to save your mood check-in.');
      }

      const journalText = `Mood score: ${mood}/10. ${note || 'No extra note added.'}`;
      const response = await apiRequest<{ moodScore: number; stressLevel: string; primaryEmotion: string; recommendation: string }>('/api/ai/analyze-mood', {
        method: 'POST',
        body: JSON.stringify({ journalText }),
        token,
      });

      setAnalysis(response);
      toast.success('Mood saved successfully!', { icon: '💾' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save mood right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.success('Recording started...', { icon: '🎤' });
    } else {
      toast.success('Recording stopped and saved!', { icon: '⏹️' });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <Heart className="h-6 w-6 mr-2 text-red-500" />
        Daily Mood Check-in
      </h3>

      {/* Mood Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          How are you feeling today? (1-10)
        </label>
        
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-2xl">😢</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #f97316 20%, #eab308 40%, #22c55e 60%, #16a34a 80%, #059669 100%)`
              }}
            />
          </div>
          <span className="text-2xl">😊</span>
        </div>

        <div className="text-center">
          <motion.div
            key={mood}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg"
          >
            <span className="text-3xl">{mood <= 2 ? '😢' : mood <= 4 ? '😐' : mood <= 6 ? '🙂' : mood <= 8 ? '😊' : '😄'}</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {mood}/10 - {mood <= 2 ? 'Struggling' : mood <= 4 ? 'Okay' : mood <= 6 ? 'Good' : mood <= 8 ? 'Great' : 'Excellent'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Quick Mood Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Or select a quick mood:
        </label>
        <div className="grid grid-cols-5 gap-2">
          {moods.map((moodOption) => (
            <motion.button
              key={moodOption.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMood(moodOption.value * 2)}
              className={`p-3 rounded-lg border-2 transition-all ${
                Math.floor(mood / 2) === moodOption.value
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
              }`}
            >
              <div className="text-2xl mb-1">{moodOption.emoji}</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {moodOption.label}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Text Note */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What's on your mind? (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write about your feelings, what happened today, or anything you'd like to remember..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
          rows={3}
        />
      </div>

      {/* Voice Note */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Voice Journal
        </label>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isRecording 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <Mic className={`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`} />
            <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          </motion.button>
          
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 text-red-600"
            >
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording...</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSaveMood}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 disabled:opacity-60 text-white p-3 rounded-lg font-medium flex items-center justify-center space-x-2"
      >
        <Save className="h-5 w-5" />
        <span>{isSaving ? 'Saving...' : 'Save Check-in'}</span>
      </motion.button>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-900/20 p-4"
        >
          <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">AI Mood Insight</h4>
          <p className="text-sm text-purple-800 dark:text-purple-100">Mood score: {analysis.moodScore}/10</p>
          <p className="text-sm text-purple-800 dark:text-purple-100">Stress level: {analysis.stressLevel}</p>
          <p className="text-sm text-purple-800 dark:text-purple-100">Primary emotion: {analysis.primaryEmotion}</p>
          <p className="text-sm text-purple-800 dark:text-purple-100 mt-2">{analysis.recommendation}</p>
        </motion.div>
      )}
    </div>
  );
}