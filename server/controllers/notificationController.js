import { Notification } from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const user = req.user;
    const roleCapitalized = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    const query = {
      $or: [
        { roleTarget: roleCapitalized },
        { roleTarget: 'All' },
        { user: user._id },
        { hotelId: user._id.toString() },
        { trustId: user._id.toString() }
      ]
    };

    const notifs = await Notification.find(query).sort({ createdAt: -1 }).limit(30);

    const formatted = notifs.map(n => ({
      id: n._id.toString(),
      _id: n._id.toString(),
      roleTarget: n.roleTarget,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      timestamp: n.createdAt
        ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now'
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    notif.read = true;
    await notif.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    const user = req.user;
    const roleCapitalized = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    await Notification.updateMany(
      {
        $or: [
          { roleTarget: roleCapitalized },
          { roleTarget: 'All' },
          { user: user._id },
          { hotelId: user._id.toString() },
          { trustId: user._id.toString() }
        ]
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};
