import { Request, Response } from 'express';
import { MenuService } from './menu.service.js';
import { successResponse } from '../../shared/responses/apiResponse.js';
import { createCategorySchema, updateCategorySchema } from './menu.validation.js';

export class MenuController {
  constructor(private menuService: MenuService) {}

  getCategories = async (req: Request, res: Response) => {
    const includeInactive = req.query.all === 'true' || req.query.includeInactive === 'true';
    const categories = await this.menuService.getCategories(includeInactive);
    res.status(200).json(successResponse('Categories fetched successfully', categories));
  };

  createCategory = async (req: Request, res: Response) => {
    const data = createCategorySchema.parse(req.body);
    const category = await this.menuService.createCategory(data);
    res.status(201).json(successResponse('Category created successfully', category));
  };

  updateCategory = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const data = updateCategorySchema.parse(req.body);
    const category = await this.menuService.updateCategory(id, data);
    res.status(200).json(successResponse('Category updated successfully', category));
  };

  deleteCategory = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.menuService.deleteCategory(id);
    res.status(200).json(successResponse('Category deleted successfully'));
  };

  getMeals = async (req: Request, res: Response) => {
    // req.query is validated via validateRequest middleware mapped to queryMealsSchema
    const meals = await this.menuService.getMeals(req.query as any);
    res.status(200).json(successResponse('Meals fetched successfully', meals));
  };

  createMeal = async (req: Request, res: Response) => {
    // req.body is validated, req.file contains multer upload
    const meal = await this.menuService.createMeal(req.body, req.file);
    res.status(201).json(successResponse('Meal created successfully', meal));
  };

  updateMeal = async (req: Request, res: Response) => {
    const meal = await this.menuService.updateMeal(req.params.id as string, req.body, req.file);
    res.status(200).json(successResponse('Meal updated successfully', meal));
  };

  deleteMeal = async (req: Request, res: Response) => {
    await this.menuService.deleteMeal(req.params.id as string);
    res.status(200).json(successResponse('Meal deleted successfully'));
  };
}
