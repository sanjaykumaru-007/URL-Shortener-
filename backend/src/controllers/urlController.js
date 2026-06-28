import Url from "../models/Url.js";
import Click from "../models/Click.js";
import geoip from "geoip-lite";
import UAParser from "ua-parser-js";

/**
 * 🔥 CREATE SHORT URL (PROTECTED - LOGIN REQUIRED)
 */
export const shortenUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, title, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL is required" });
    }

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // Generate or validate short code/alias
    let shortCode;
    if (customAlias) {
      shortCode = customAlias;
      const existingAlias = await Url.findOne({ $or: [{ shortCode }, { customAlias }] });
      if (existingAlias) {
        return res.status(400).json({ message: "Short code or alias already exists" });
      }
    } else {
      do {
        shortCode = Math.random().toString(36).substring(2, 8);
      } while (await Url.exists({ $or: [{ shortCode }, { customAlias: shortCode }] }));
    }

    // Save in DB
    const urlData = {
      originalUrl,
      shortCode,
      title: title || "Untitled",
        userId: req.user?._id || null,
      clickCount: 0,
      uniqueClickCount: 0,
      isActive: true,
      expiresAt: expiresAt || null
    };

    if (customAlias) {
      urlData.customAlias = customAlias;
    }

    const url = await Url.create(urlData);

    res.status(201).json({
      _id: url._id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      title: url.title,
      customAlias: url.customAlias,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt
    });

  } catch (error) {
    next(error);
  }
};

/**
 * 🔥 REDIRECT SHORT URL → ORIGINAL URL (PUBLIC)
 */
export const redirectUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    console.log(`Redirect requested for code: ${shortCode}`);

    const url = await Url.findOne({ shortCode });
    console.log('DB lookup result for', shortCode, url ? 'FOUND' : 'NOT FOUND');

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    // Check if URL is active and not expired
    if (!url.isActive || (url.expiresAt && new Date() > new Date(url.expiresAt))) {
      return res.status(410).json({ message: "URL has expired or been deleted" });
    }

    // Get client info
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
    const geo = geoip.lookup(ip);
    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    // Create click record
    try {
      await Click.create({
        urlId: url._id,
        userId: url.userId,
        ipAddress: ip,
        country: geo?.country || "Unknown",
        city: geo?.city || "Unknown",
        browser: ua.browser.name || "Unknown",
        os: ua.os.name || "Unknown",
        device: ua.device.type || "Desktop",
        referrer: req.headers.referer || "Direct",
        isUnique: true
      });

      // Increment click count
      url.clickCount += 1;
      url.uniqueClickCount += 1;
      await url.save();
    } catch (clickError) {
      console.error("Click tracking error:", clickError);
      // Don't fail redirect if click tracking fails
    }

    // Redirect user
    return res.redirect(301, url.originalUrl);

  } catch (error) {
    next(error);
  }
};

/**
 * 🔥 GET USER URLS (DASHBOARD - LOGIN REQUIRED)
 */
export const getUrls = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { userId: req.user._id };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortCode: { $regex: search, $options: "i" } },
        { originalUrl: { $regex: search, $options: "i" } }
      ];
    }

    const urls = await Url.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Url.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      urls,
      total,
      page: parseInt(page),
      totalPages
    });

  } catch (error) {
    next(error);
  }
};

/**
 * 🔥 GET SINGLE URL BY ID (PROTECTED)
 */
export const getUrlById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const url = await Url.findOne({ _id: id, userId: req.user._id });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    res.status(200).json(url);

  } catch (error) {
    next(error);
  }
};

/**
 * 🔥 UPDATE URL (PROTECTED)
 */
export const updateUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, customAlias, expiresAt, isActive } = req.body;

    const url = await Url.findOne({ _id: id, userId: req.user._id });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    // Check if new alias already exists
    if (customAlias && customAlias !== url.customAlias) {
      const existingAlias = await Url.findOne({ customAlias });
      if (existingAlias) {
        return res.status(400).json({ message: "Alias already exists" });
      }
      url.customAlias = customAlias;
    }

    if (title) url.title = title;
    if (expiresAt !== undefined) url.expiresAt = expiresAt;
    if (isActive !== undefined) url.isActive = isActive;

    await url.save();
    res.status(200).json(url);

  } catch (error) {
    next(error);
  }
};

/**
 * 🔥 DELETE URL (PROTECTED)
 */
export const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;

    const url = await Url.findOne({ _id: id, userId: req.user._id });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    await Url.deleteOne({ _id: id });
    await Click.deleteMany({ urlId: id });

    res.status(200).json({ message: "URL deleted successfully" });

  } catch (error) {
    next(error);
  }
};

/**
 * 🔥 GET PUBLIC URL INFO (PUBLIC - NO AUTH)
 */
export const getPublicUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode }).select("-userId");

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    // Check if expired
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.status(410).json({ message: "URL has expired" });
    }

    res.status(200).json(url);

  } catch (error) {
    next(error);
  }
};