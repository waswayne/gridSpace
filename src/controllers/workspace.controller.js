import { WorkspaceService } from '../services/workspace.service.js';
import { SearchAnalyticsService } from '../services/search-analytics.service.js';

export class WorkspaceController {
  constructor({ workspaceService, searchAnalyticsService } = {}) {
    if (!workspaceService) {
      throw new Error('WorkspaceController requires a workspaceService');
    }

    if (!(workspaceService instanceof WorkspaceService)) {
      throw new Error('workspaceService must be an instance of WorkspaceService');
    }

    this.workspaceService = workspaceService;
    if (searchAnalyticsService) {
      if (!(searchAnalyticsService instanceof SearchAnalyticsService)) {
        throw new Error('searchAnalyticsService must be an instance of SearchAnalyticsService');
      }
    }
    this.searchAnalyticsService = searchAnalyticsService ?? null;

    this.list = this.list.bind(this);
    this.listMine = this.listMine.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
  }

  async list(req, res, next) {
    try {
      const result = await this.workspaceService.listWorkspaces(req.query);

      if (this.searchAnalyticsService) {
        const {
          location = null,
          priceMin = null,
          priceMax = null,
          capacity = null,
          purposes = null,
          amenities = null,
        } = req.query;

        const sessionId = req.sessionID ?? req.session?.id ?? `anon_${Date.now()}`;

        const filters = {
          location: location ?? undefined,
          priceMin: priceMin !== undefined ? Number(priceMin) : undefined,
          priceMax: priceMax !== undefined ? Number(priceMax) : undefined,
          capacity: capacity !== undefined ? Number(capacity) : undefined,
          purposes: purposes ? [].concat(purposes) : undefined,
          amenities: amenities ? [].concat(amenities) : undefined,
        };

        await this.searchAnalyticsService.logSearch({
          userId: req.user?._id ?? null,
          sessionId,
          searchQuery: location ?? '',
          filters,
          resultsCount: result.totalDocs,
          zeroResults: result.totalDocs === 0,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Spaces retrieved successfully',
        data: {
          spaces: result.docs,
          pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalSpaces: result.totalDocs,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async listMine(req, res, next) {
    try {
      const result = await this.workspaceService.listHostWorkspaces(req.user._id, req.query);

      return res.status(200).json({
        success: true,
        message: 'Your spaces retrieved successfully',
        data: {
          spaces: result.docs,
          pagination: {
            currentPage: result.page,
            totalPages: result.totalPages,
            totalSpaces: result.totalDocs,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const space = await this.workspaceService.getWorkspaceById(id);

      if (!space) {
        return res.status(404).json({
          success: false,
          message: 'Space not found or no longer available',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Space details retrieved successfully',
        data: space,
      });
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const payload = {
        ...req.body,
        images: req.body.images ?? [],
        timeSlots: req.body.timeSlots ?? [],
      };

      const space = await this.workspaceService.createWorkspace({
        hostId: req.user._id,
        payload,
      });

      return res.status(201).json({
        success: true,
        message: 'Space created successfully',
        data: space,
      });
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const payload = {
        ...req.body,
        images: req.body.images ?? undefined,
        timeSlots: req.body.timeSlots ?? undefined,
      };

      const updatedSpace = await this.workspaceService.updateWorkspace(id, payload);

      if (!updatedSpace) {
        return res.status(404).json({
          success: false,
          message: 'Space not found or no longer available',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Space updated successfully',
        data: updatedSpace,
      });
    } catch (error) {
      return next(error);
    }
  }

  async remove(req, res, next) {
    try {
      const { id } = req.params;

      await this.workspaceService.deleteWorkspace(id);

      return res.status(200).json({
        success: true,
        message: 'Space deleted successfully',
      });
    } catch (error) {
      return next(error);
    }
  }
}
