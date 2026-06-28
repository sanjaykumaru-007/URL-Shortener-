import Url from '../models/Url.js';
import Click from '../models/Click.js';
import mongoose from 'mongoose';

export const getUrlAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { timeframe = '7d' } = req.query;

    const url = await Url.findOne({ _id: id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    let startDate = new Date();
    if (timeframe === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (timeframe === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (timeframe === '90d') startDate.setDate(startDate.getDate() - 90);

    const clicks = await Click.find({
      urlId: id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Aggregate daily clicks
    const dailyClicks = await Click.aggregate([
      { $match: { urlId: new mongoose.Types.ObjectId(id), createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          unique: { $sum: { $cond: ['$isUnique', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Aggregate by country
    const byCountry = await Click.aggregate([
      { $match: { urlId: new mongoose.Types.ObjectId(id), createdAt: { $gte: startDate } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Aggregate by browser
    const byBrowser = await Click.aggregate([
      { $match: { urlId: new mongoose.Types.ObjectId(id), createdAt: { $gte: startDate } } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Aggregate by device
    const byDevice = await Click.aggregate([
      { $match: { urlId: new mongoose.Types.ObjectId(id), createdAt: { $gte: startDate } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      url,
      clicks,
      dailyClicks,
      byCountry,
      byBrowser,
      byDevice,
      summary: {
        totalClicks: url.clickCount,
        uniqueClicks: url.uniqueClickCount,
        lastClicked: clicks.length > 0 ? clicks[clicks.length - 1].createdAt : null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totalUrls = await Url.countDocuments({ userId });
    const activeUrls = await Url.countDocuments({ userId, isActive: true });
    const expiredUrls = await Url.countDocuments({ 
      userId, 
      $or: [
        { isActive: false },
        { expiresAt: { $lt: new Date() } }
      ]
    });

    const totalClicksAgg = await Url.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$clickCount' } } }
    ]);

    const totalClicks = totalClicksAgg.length > 0 ? totalClicksAgg[0].total : 0;

    // Recent activity (last 5 URLs)
    const recentUrls = await Url.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title shortCode clickCount createdAt');

    res.json({
      totalUrls,
      activeUrls,
      expiredUrls,
      totalClicks,
      recentUrls
    });
  } catch (error) {
    next(error);
  }
};