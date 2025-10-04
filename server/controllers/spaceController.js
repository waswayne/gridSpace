// controllers/spaceController.js
const mongoose = require('mongoose');
const Space = require('../models/Space');
const User = require('../models/User');
const logger = require('../config/logger'); // existing winston logger
const cloudinary = require('../config/cloudinary'); // optional, if configured
const streamifier = require('streamifier');

const _uploadFileToCloudinary = (fileBuffer, folder = 'gridspace/spaces') =>
  new Promise((resolve, reject) => {
    if (!cloudinary || !cloudinary.uploader) {
      return reject(new Error('Cloudinary not configured'));
    }
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });

// Helper: normalize incoming photos (either URLs in body or files via multer)
const _processPhotos = async (req) => {
  const photos = [];

  // 1) If client provided photos as URLs in body
  if (Array.isArray(req.body.photos) && req.body.photos.length) {
    req.body.photos.forEach((p) => {
      if (typeof p === 'string' && p.trim()) photos.push({ url: p.trim() });
    });
  }

  // 2) If multer files were uploaded (req.files)
  if (req.files && req.files.length) {
    for (const file of req.files) {
      try {
        // Try Cloudinary upload if configured
        if (cloudinary && cloudinary.uploader) {
          const result = await _uploadFileToCloudinary(file.buffer);
          photos.push({ url: result.secure_url, public_id: result.public_id });
        } else {
          // If no cloudinary, we can fallback to local or reject
          logger.warn('Cloudinary not configured; skipping file upload');
        }
      } catch (err) {
        logger.error('Photo upload failed', { error: err.message });
        // continue — photo uploads should not block space creation in MVP
      }
    }
  }

  return photos;
};

// CREATE Space
const createSpace = async (req, res) => {
  try {
    const hostId = req.user && req.user._id ? req.user._id : req.user && req.user.id;
    if (!hostId) return res.status(401).json({ success: false, message: 'Authentication required' });

    // allow only hosts/admins (routes should protect this too)
    if (!['host', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only hosts can create spaces' });
    }

    const {
      title,
      description,
      address,
      pricePerHour,
      amenities,
      rules,
      coordinates // optional object { lat, lng }
    } = req.body;

    // Basic validation
    if (!title || !address || pricePerHour == null) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: title, address, pricePerHour'
      });
    }

    // Validate host exists (defensive)
    const host = await User.findById(hostId).select('_id role status').lean();
    if (!host || host.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Host account not available' });
    }

    // Build GeoJSON coordinates if provided
    let geo = null;
    if (coordinates && (coordinates.lat || coordinates.lng)) {
      const lat = Number(coordinates.lat);
      const lng = Number(coordinates.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return res.status(400).json({ success: false, message: 'Invalid coordinates' });
      }
      geo = { type: 'Point', coordinates: [lng, lat] }; // [lng, lat]
    } else {
      // require coordinates for MVP (recommendation)
      return res.status(400).json({ success: false, message: 'Coordinates required (lat & lng)' });
    }

    const photos = await _processPhotos(req);

    const space = new Space({
      host: hostId,
      title: title.trim(),
      description: description ? description.trim() : '',
      address: address.trim(),
      coordinates: geo,
      pricePerHour: Number(pricePerHour),
      photos,
      amenities: Array.isArray(amenities) ? amenities.map(a => a.trim()) : (amenities ? String(amenities).split(',').map(a => a.trim()) : []),
      rules: Array.isArray(rules) ? rules.map(r => r.trim()) : (rules ? String(rules).split(',').map(r => r.trim()) : [])
    });

    await space.save();

    // Return populated host summary
    const result = await Space.findById(space._id).populate('host', 'fullname profilePic role').lean();
    return res.status(201).json({ success: true, message: 'Space created', space: result });

  } catch (error) {
    logger.error('createSpace error', { message: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /spaces (list, filters, geo, pagination)
const getSpaces = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      amenities,
      q, // text search
      host, // filter by host id
      lat,
      lng,
      radius = 5000 // meters
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const perPage = Math.min(100, parseInt(limit, 10) || 20);

    const filter = { isActive: true };

    if (minPrice != null || maxPrice != null) {
      filter.pricePerHour = {};
      if (minPrice != null) filter.pricePerHour.$gte = Number(minPrice);
      if (maxPrice != null) filter.pricePerHour.$lte = Number(maxPrice);
    }

    if (amenities) {
      const amens = Array.isArray(amenities) ? amenities : String(amenities).split(',').map(a => a.trim());
      filter.amenities = { $all: amens };
    }

    if (host) {
      if (mongoose.Types.ObjectId.isValid(host)) filter.host = host;
    }

    if (q) {
      const regex = new RegExp(String(q).trim(), 'i');
      filter.$or = [{ title: regex }, { description: regex }, { address: regex }];
    }

    // Geo search if lat & lng provided
    let query;
    if (lat && lng) {
      const latN = Number(lat);
      const lngN = Number(lng);
      if (Number.isNaN(latN) || Number.isNaN(lngN)) {
        return res.status(400).json({ success: false, message: 'Invalid lat/lng' });
      }
      const maxDistance = Number(radius) || 5000;
      filter.coordinates = {
        $near: {
          $geometry: { type: 'Point', coordinates: [lngN, latN] },
          $maxDistance: maxDistance
        }
      };
    }

    query = Space.find(filter)
      .populate('host', 'fullname profilePic role')
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .lean();

    const [spaces, total] = await Promise.all([
      query.exec(),
      Space.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      meta: { total, page: pageNum, perPage },
      spaces
    });

  } catch (error) {
    logger.error('getSpaces error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /spaces/:id
const getSpaceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const space = await Space.findById(id).populate('host', 'fullname profilePic role').lean();
    if (!space) return res.status(404).json({ success: false, message: 'Space not found' });

    return res.status(200).json({ success: true, space });
  } catch (error) {
    logger.error('getSpaceById error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /spaces/:id (owner or admin)
const updateSpace = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const space = await Space.findById(id);
    if (!space) return res.status(404).json({ success: false, message: 'Space not found' });

    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    // Owner or admin
    if (String(space.host) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updatable = ['title', 'description', 'address', 'pricePerHour', 'amenities', 'rules'];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'amenities' || field === 'rules') {
          space[field] = Array.isArray(req.body[field])
            ? req.body[field].map(x => String(x).trim())
            : String(req.body[field]).split(',').map(x => x.trim());
        } else {
          space[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
        }
      }
    });

    // update coordinates if provided
    if (req.body.coordinates && (req.body.coordinates.lat || req.body.coordinates.lng)) {
      const lat = Number(req.body.coordinates.lat);
      const lng = Number(req.body.coordinates.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return res.status(400).json({ success: false, message: 'Invalid coordinates' });
      }
      space.coordinates = { type: 'Point', coordinates: [lng, lat] };
    }

    // handle photos (append)
    if ((req.body.photos && req.body.photos.length) || (req.files && req.files.length)) {
      const newPhotos = await _processPhotos(req);
      space.photos = Array.isArray(space.photos) ? space.photos.concat(newPhotos) : newPhotos;
    }

    space.updatedAt = new Date();
    await space.save();

    const updated = await Space.findById(space._id).populate('host', 'fullname profilePic role').lean();
    return res.status(200).json({ success: true, message: 'Space updated', space: updated });

  } catch (error) {
    logger.error('updateSpace error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /spaces/:id/deactivate (owner or admin)
const deactivateSpace = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const space = await Space.findById(id);
    if (!space) return res.status(404).json({ success: false, message: 'Space not found' });

    const userId = req.user && (req.user._id || req.user.id);
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    // Owner or admin
    if (String(space.host) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    space.isActive = false;
    await space.save();

    // log admin action if admin
    if (req.user.role === 'admin') {
      try {
        const AdminActionLog = require('../models/AdminActionLog');
        await AdminActionLog.create({
          admin: userId,
          action: 'DEACTIVATE_SPACE',
          targetType: 'Space',
          targetId: space._id,
          details: `Deactivated by admin ${userId}`
        });
      } catch (err) {
        logger.warn('Failed to log admin action', { message: err.message });
      }
    }

    return res.status(200).json({ success: true, message: 'Space deactivated' });

  } catch (error) {
    logger.error('deactivateSpace error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createSpace,
  getSpaces,
  getSpaceById,
  updateSpace,
  deactivateSpace
};
