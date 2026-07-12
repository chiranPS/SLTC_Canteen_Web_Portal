import { createAdminSchema, updateAdminSchema } from './users.validation.js';
export class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    getAllAdmins = async (req, res, next) => {
        try {
            const admins = await this.usersService.getAllAdmins();
            res.status(200).json({ success: true, data: admins });
        }
        catch (error) {
            next(error);
        }
    };
    getAdminById = async (req, res, next) => {
        try {
            const admin = await this.usersService.getAdminById(req.params.id);
            res.status(200).json({ success: true, data: admin });
        }
        catch (error) {
            next(error);
        }
    };
    createAdmin = async (req, res, next) => {
        try {
            const data = createAdminSchema.parse(req.body);
            const admin = await this.usersService.createAdmin(data);
            res.status(201).json({ success: true, data: admin });
        }
        catch (error) {
            next(error);
        }
    };
    updateAdmin = async (req, res, next) => {
        try {
            const data = updateAdminSchema.parse(req.body);
            const admin = await this.usersService.updateAdmin(req.params.id, data);
            res.status(200).json({ success: true, data: admin });
        }
        catch (error) {
            next(error);
        }
    };
    deleteAdmin = async (req, res, next) => {
        try {
            // The requester's ID comes from the authenticated user middleware (req.user)
            const requesterId = req.user?.id;
            await this.usersService.deleteAdmin(req.params.id, requesterId);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    };
}
