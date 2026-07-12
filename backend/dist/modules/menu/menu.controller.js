import { successResponse } from '../../shared/responses/apiResponse.js';
import { createCategorySchema, updateCategorySchema } from './menu.validation.js';
export class MenuController {
    menuService;
    constructor(menuService) {
        this.menuService = menuService;
    }
    getCategories = async (req, res) => {
        const includeInactive = req.query.all === 'true' || req.query.includeInactive === 'true';
        const categories = await this.menuService.getCategories(includeInactive);
        res.status(200).json(successResponse('Categories fetched successfully', categories));
    };
    createCategory = async (req, res) => {
        const data = createCategorySchema.parse(req.body);
        const category = await this.menuService.createCategory(data);
        res.status(201).json(successResponse('Category created successfully', category));
    };
    updateCategory = async (req, res) => {
        const id = req.params.id;
        const data = updateCategorySchema.parse(req.body);
        const category = await this.menuService.updateCategory(id, data);
        res.status(200).json(successResponse('Category updated successfully', category));
    };
    deleteCategory = async (req, res) => {
        const id = req.params.id;
        await this.menuService.deleteCategory(id);
        res.status(200).json(successResponse('Category deleted successfully'));
    };
    getMeals = async (req, res) => {
        // req.query is validated via validateRequest middleware mapped to queryMealsSchema
        const meals = await this.menuService.getMeals(req.query);
        res.status(200).json(successResponse('Meals fetched successfully', meals));
    };
    createMeal = async (req, res) => {
        // req.body is validated, req.file contains multer upload
        const meal = await this.menuService.createMeal(req.body, req.file);
        res.status(201).json(successResponse('Meal created successfully', meal));
    };
    updateMeal = async (req, res) => {
        const meal = await this.menuService.updateMeal(req.params.id, req.body, req.file);
        res.status(200).json(successResponse('Meal updated successfully', meal));
    };
    deleteMeal = async (req, res) => {
        await this.menuService.deleteMeal(req.params.id);
        res.status(200).json(successResponse('Meal deleted successfully'));
    };
}
