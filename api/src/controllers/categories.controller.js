import { getCategoriesCached } from "../lib/categories.js";

export const getCategoriesController = async (req, res, next) => {
    try {
        const categories = await getCategoriesCached();
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

