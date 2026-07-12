import { AppError } from '../../shared/errors/AppError.js';
import { isMealTimeValid } from '../../shared/utils/timeCheck.js';
import fs from 'fs';
import path from 'path';
export class MenuService {
    menuRepo;
    constructor(menuRepo) {
        this.menuRepo = menuRepo;
    }
    async getCategories(includeInactive = false) {
        return this.menuRepo.findCategories(includeInactive);
    }
    async createCategory(data) {
        const existing = await this.menuRepo.findCategoryByName(data.name);
        if (existing) {
            throw new AppError('Category with this name already exists', 400, 'CATEGORY_ALREADY_EXISTS');
        }
        return this.menuRepo.createCategory(data);
    }
    async updateCategory(id, data) {
        const category = await this.menuRepo.findCategoryById(id);
        if (!category) {
            throw new AppError('Category not found', 404, 'NOT_FOUND');
        }
        if (data.name && data.name !== category.name) {
            const existing = await this.menuRepo.findCategoryByName(data.name);
            if (existing) {
                throw new AppError('Category with this name already exists', 400, 'CATEGORY_ALREADY_EXISTS');
            }
        }
        return this.menuRepo.updateCategory(id, data);
    }
    async deleteCategory(id) {
        const category = await this.menuRepo.findCategoryById(id);
        if (!category) {
            throw new AppError('Category not found', 404, 'NOT_FOUND');
        }
        const mealCount = await this.menuRepo.countMealsByCategoryId(id);
        if (mealCount > 0) {
            throw new AppError('Cannot delete category because it has associated meals. Please delete or reassign them first.', 400, 'HAS_ASSOCIATED_MEALS');
        }
        await this.menuRepo.deleteCategory(id);
    }
    async getMeals(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 100;
        const skip = (page - 1) * limit;
        const { meals, total } = await this.menuRepo.findMeals({
            ...filters,
            skip,
            take: limit,
        });
        const currentTime = new Date();
        const processedMeals = meals.map(meal => {
            const categoryName = meal.category?.name || '';
            const isTimeValid = isMealTimeValid(categoryName, currentTime);
            // Override isAvailable to false if the serving time has passed
            return {
                ...meal,
                isAvailable: meal.isAvailable && isTimeValid,
            };
        });
        return {
            meals: processedMeals,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        };
    }
    async createMeal(data, file) {
        let imageUrl = null;
        if (file) {
            imageUrl = `/uploads/meals/${file.filename}`;
        }
        return this.menuRepo.createMeal({
            ...data,
            imageUrl,
        });
    }
    async updateMeal(id, data, file) {
        const existingMeal = await this.menuRepo.findMealById(id);
        if (!existingMeal) {
            throw new AppError('Meal not found', 404, 'NOT_FOUND');
        }
        let imageUrl = existingMeal.imageUrl;
        // If new file is uploaded, replace the old one
        if (file) {
            imageUrl = `/uploads/meals/${file.filename}`;
            // Delete old file if it exists
            if (existingMeal.imageUrl) {
                const oldFilePath = path.join(process.cwd(), existingMeal.imageUrl);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
        }
        return this.menuRepo.updateMeal(id, {
            ...data,
            imageUrl,
        });
    }
    async deleteMeal(id) {
        const existingMeal = await this.menuRepo.findMealById(id);
        if (!existingMeal) {
            throw new AppError('Meal not found', 404, 'NOT_FOUND');
        }
        // Delete associated image
        if (existingMeal.imageUrl) {
            const oldFilePath = path.join(process.cwd(), existingMeal.imageUrl);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }
        await this.menuRepo.deleteMeal(id);
    }
}
