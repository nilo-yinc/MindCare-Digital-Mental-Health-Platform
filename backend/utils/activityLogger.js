const Activity = require('../models/Activity');

/**
 * Logs a user activity for the dashboard history
 * @param {string} userId - The ID of the user
 * @param {string} type - The type of activity
 * @param {string} title - Human readable title of the activity
 * @param {number} points - Points awarded for the activity
 */
const logActivity = async (userId, type, title, points = 10) => {
  try {
    await Activity.create({
      user: userId,
      type: type,
      title: title,
      points: points
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = logActivity;
