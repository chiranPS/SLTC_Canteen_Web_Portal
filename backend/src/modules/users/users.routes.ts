import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticate, requireRole } from '../../shared/middlewares/auth.middleware.js';

export const createUsersRouter = (usersController: UsersController): Router => {
  const router = Router();

  // All user routes require authentication and ADMIN role
  router.use(authenticate, requireRole(['ADMIN']));

  router.get('/', usersController.getAllAdmins);
  router.get('/:id', usersController.getAdminById);
  router.post('/', usersController.createAdmin);
  router.put('/:id', usersController.updateAdmin);
  router.delete('/:id', usersController.deleteAdmin);

  return router;
};
