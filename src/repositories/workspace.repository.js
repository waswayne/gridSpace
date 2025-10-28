import { WorkspaceModel } from '../models/workspace.model.js';

const SORT_MAPPING = {
  price_low_high: { pricePerHour: 1 },
  price_high_low: { pricePerHour: -1 },
  rating: { createdAt: -1 },
  most_popular: { createdAt: -1 },
  newest: { createdAt: -1 },
};

const DEFAULT_PAGINATE_OPTIONS = {
  page: 1,
  limit: 12,
  lean: true,
};

const DEFAULT_HOST_PAGINATE_OPTIONS = {
  page: 1,
  limit: 10,
  sort: { createdAt: -1 },
  lean: true,
};

const normalizeToArray = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
};

const buildSearchFilter = ({ location, priceMin, priceMax, capacity, purposes, amenities }) => {
  const filter = { isActive: true };

  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  if (priceMin != null || priceMax != null) {
    filter.pricePerHour = {};
    if (priceMin != null) {
      filter.pricePerHour.$gte = priceMin;
    }
    if (priceMax != null) {
      filter.pricePerHour.$lte = priceMax;
    }
  }

  if (capacity != null) {
    filter.capacity = { $gte: capacity };
  }

  const purposesArray = normalizeToArray(purposes).filter(Boolean);
  if (purposesArray.length > 0) {
    filter.purposes = { $in: purposesArray };
  }

  const amenitiesArray = normalizeToArray(amenities).filter(Boolean);
  if (amenitiesArray.length > 0) {
    filter.amenities = { $all: amenitiesArray };
  }

  return filter;
};

const resolveSort = (sortBy = 'newest') => SORT_MAPPING[sortBy] ?? SORT_MAPPING.newest;

export class WorkspaceRepository {
  constructor({ workspaceModel = WorkspaceModel } = {}) {
    this.workspaceModel = workspaceModel;
  }

  async paginateSpaces({
    filters = {},
    page = DEFAULT_PAGINATE_OPTIONS.page,
    limit = DEFAULT_PAGINATE_OPTIONS.limit,
    sortBy = 'newest',
    lean = DEFAULT_PAGINATE_OPTIONS.lean,
    populateHost = true,
  } = {}) {
    const filter = buildSearchFilter(filters);
    const options = {
      page,
      limit,
      sort: resolveSort(sortBy),
      lean,
    };

    if (populateHost) {
      options.populate = {
        path: 'hostId',
        select: 'fullname profilePic emailVerified',
      };
    }

    return this.workspaceModel.paginate(filter, options);
  }

  async paginateHostSpaces(hostId, {
    page = DEFAULT_HOST_PAGINATE_OPTIONS.page,
    limit = DEFAULT_HOST_PAGINATE_OPTIONS.limit,
    sort = DEFAULT_HOST_PAGINATE_OPTIONS.sort,
    lean = DEFAULT_HOST_PAGINATE_OPTIONS.lean,
    populateHost = true,
  } = {}) {
    const filter = { hostId, isActive: true };
    const options = {
      page,
      limit,
      sort,
      lean,
    };

    if (populateHost) {
      options.populate = {
        path: 'hostId',
        select: 'fullname profilePic emailVerified',
      };
    }

    return this.workspaceModel.paginate(filter, options);
  }

  async findActiveById(id, { lean = true, populateHost = false } = {}) {
    const query = this.workspaceModel.findOne({ _id: id, isActive: true });

    if (populateHost) {
      query.populate('hostId', 'fullname profilePic emailVerified createdAt');
    }

    if (lean) {
      query.lean();
    }

    return query.exec();
  }

  async findById(id, { lean = true, populateHost = false } = {}) {
    const query = this.workspaceModel.findById(id);

    if (populateHost) {
      query.populate('hostId', 'fullname profilePic emailVerified createdAt');
    }

    if (lean) {
      query.lean();
    }

    return query.exec();
  }

  async create(workspaceData) {
    const workspace = await this.workspaceModel.create(workspaceData);
    return workspace.toObject ? workspace.toObject() : workspace;
  }

  async update(id, updateData, { lean = true, populateHost = false } = {}) {
    const query = this.workspaceModel
      .findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

    if (populateHost) {
      query.populate('hostId', 'fullname profilePic emailVerified');
    }

    if (lean) {
      query.lean();
    }

    return query.exec();
  }

  async softDelete(id) {
    return this.workspaceModel.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
  }

  async countActiveByHost(hostId) {
    return this.workspaceModel.countDocuments({ hostId, isActive: true });
  }
}
