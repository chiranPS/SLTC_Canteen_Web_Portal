import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let mockUsersService: any;
  let usersController: UsersController;
  let req: Partial<Request>;
  let res: any;
  let next: NextFunction;

  beforeEach(() => {
    mockUsersService = {
      getAllAdmins: jest.fn<any>().mockResolvedValue([{ id: '1', name: 'Admin 1' }]),
      getAdminById: jest.fn<any>().mockResolvedValue({ id: '1', name: 'Admin 1' }),
      createAdmin: jest.fn<any>().mockResolvedValue({ id: '2', name: 'Admin 2' }),
      updateAdmin: jest.fn<any>().mockResolvedValue({ id: '1', name: 'Updated Admin' }),
      deleteAdmin: jest.fn<any>().mockResolvedValue(undefined),
    };

    usersController = new UsersController(mockUsersService as UsersService);
    
    req = {
      params: {},
      body: {},
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    
    next = jest.fn();
  });

  describe('getAllAdmins', () => {
    it('should return all admins', async () => {
      await usersController.getAllAdmins(req as Request, res as Response, next);
      
      expect(mockUsersService.getAllAdmins).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: '1', name: 'Admin 1' }] });
    });
  });

  describe('getAdminById', () => {
    it('should return admin by id', async () => {
      req.params = { id: '1' };
      
      await usersController.getAdminById(req as Request, res as Response, next);
      
      expect(mockUsersService.getAdminById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: '1', name: 'Admin 1' } });
    });
  });

  describe('deleteAdmin', () => {
    it('should delete admin and return 204', async () => {
      req.params = { id: '2' };
      (req as any).user = { id: '1' }; // Requester ID
      
      await usersController.deleteAdmin(req as Request, res as Response, next);
      
      expect(mockUsersService.deleteAdmin).toHaveBeenCalledWith('2', '1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
