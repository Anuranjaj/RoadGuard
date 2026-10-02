export const createNotification = ({ userId, type = 'info', message, link = null }) => ({
  userId,
  type,
  message,
  link,
  isRead: false,
  createdAt: new Date(),
});

export default {
  createNotification,
};
