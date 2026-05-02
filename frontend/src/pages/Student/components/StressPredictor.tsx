import React, { useState } from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Calendar, AlertTriangle, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiRequest } from '../../../lib/api';

export function StressPredictor() {
  const { token } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('this-week');
  const [analysis, setAnalysis] = useState<{
    currentStressLevel: number;
    riskLevel: string;
    summary: string;
    upcomingEvents: { name: string; date: string; stress: string; impact: number }[];
    recommendations: { title: string; description: string; priority: string }[];
    warning: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const stressEvents = [
    { name: 'Midterm Exams', date: 'Mar 15-20', stress: 'High', color: 'text-red-600', impact: 85 },
    { name: 'Project Deadline', date: 'Mar 25', stress: 'Medium', color: 'text-yellow-600', impact: 65 },
    { name: 'Spring Break', date: 'Apr 1-8', stress: 'Low', color: 'text-green-600', impact: 20 },
    { name: 'Final Exams', date: 'May 10-17', stress: 'Very High', color: 'text-red-700', impact: 95 },
  ];

  const recommendations = [
    {
      title: 'Schedule Study Breaks',
      description: 'Take 15-minute breaks every 2 hours during exam prep',
      priority: 'High',
      icon: Clock
    },
    {
      title: 'Sleep Optimization',
      description: 'Maintain 7-8 hours of sleep, especially before exams',
      priority: 'High',
      icon: Brain
    },
    {
      title: 'Mindfulness Practice',
      description: 'Daily 10-minute meditation to manage stress levels',
      priority: 'Medium',
      icon: BookOpen
    }
  ];

  const currentStressLevel = 42; // Simulated current stress level
  const eventColor = (stress: string) => {
    if (stress === 'Very High' || stress === 'High') return 'text-red-600';
    if (stress === 'Medium') return 'text-yellow-600';
    return 'text-green-600';
  };

  const eventBadge = (stress: string) => {
    if (stress === 'Very High') return 'bg-red-700';
    if (stress === 'High') return 'bg-red-500';
    if (stress === 'Medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const displayEvents = analysis?.upcomingEvents || stressEvents;
  const displayRecommendations = analysis?.recommendations
    ? analysis.recommendations.map((rec, index) => ({
        ...rec,
        icon: [Clock, Brain, BookOpen][index % 3],
      }))
    : recommendations;

  useEffect(() => {
    const loadStressPrediction = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const response = await apiRequest<{
          currentStressLevel: number;
          riskLevel: string;
          summary: string;
          upcomingEvents: { name: string; date: string; stress: string; impact: number }[];
          recommendations: { title: string; description: string; priority: string }[];
          warning: string;
        }>('/api/ai/stress-predict', {
          method: 'POST',
          body: JSON.stringify({ period: selectedPeriod }),
          token,
        });

        setAnalysis(response);
      } catch (error) {
        setAnalysis(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadStressPrediction();
  }, [selectedPeriod, token]);

  const currentData = analysis || {
    currentStressLevel,
    riskLevel: currentStressLevel > 70 ? 'High' : currentStressLevel > 40 ? 'Moderate' : 'Low',
    summary: 'Your current stress level is based on your academic workload.',
    upcomingEvents: stressEvents,
    recommendations,
    warning: 'Peak stress period ahead',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Brain className="h-6 w-6 mr-2 text-purple-600" />
          Academic Stress Predictor
        </h3>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="this-week">This Week</option>
          <option value="this-month">This Month</option>
          <option value="semester">Full Semester</option>
        </select>
      </div>

      {/* Current Stress Level */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Stress Level
          </span>
          <span className={`text-sm font-semibold ${
            currentData.currentStressLevel > 70 ? 'text-red-600' : 
            currentData.currentStressLevel > 40 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {currentData.currentStressLevel}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentData.currentStressLevel}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              currentData.currentStressLevel > 70 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
              currentData.currentStressLevel > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-green-600'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {currentData.currentStressLevel > 70 ? 'High stress detected - consider taking a break' :
           currentData.currentStressLevel > 40 ? 'Moderate stress - good time for self-care' :
           'Low stress - great time for proactive wellness'}
        </p>
      </div>

      {/* Upcoming Events */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Upcoming Stress Events
        </h4>
        <div className="space-y-3">
          {displayEvents.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${eventBadge(event.stress)}`} />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {event.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {event.date}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${eventColor(event.stress)}`}>
                  {event.stress}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {event.impact}% impact
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          AI Recommendations
        </h4>
        <div className="space-y-3">
          {displayRecommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${
                rec.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <rec.icon className={`h-4 w-4 ${
                  rec.priority === 'High' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {rec.title}
                  </h5>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    rec.priority === 'High' 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {rec.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start space-x-3"
      >
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
            {analysis?.warning || 'Peak Stress Period Ahead'}
          </h5>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            {analysis?.summary || 'Your stress levels are predicted to peak during midterm week (Mar 15-20). Consider booking a counselling session or connecting with your peer buddy now.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}