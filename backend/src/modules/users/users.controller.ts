import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service.js';
import { createAdminSchema, updateAdminSchema } from './users.validation.js';

export class UsersController {
  constructor(private usersService: UsersService) {}

  getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await this.usersService.getAllAdmins();
      res.status(200).json({ success: true, data: admins });
    } catch (error) {
      next(error);
    }
  };

  getAdminById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = await this.usersService.getAdminById(req.params.id as string);
      res.status(200).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  };

  createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = createAdminSchema.parse(req.body);
      const admin = await this.usersService.createAdmin(data);
      res.status(201).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  };

  updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = updateAdminSchema.parse(req.body);
      const admin = await this.usersService.updateAdmin(req.params.id as string, data);
      res.status(200).json({ success: true, data: admin });
    } catch (error) {
      next(error);
    }
  };

  deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The requester's ID comes from the authenticated user middleware (req.user)
      const requesterId = (req as any).user?.id;
      await this.usersService.deleteAdmin(req.params.id as string, requesterId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
