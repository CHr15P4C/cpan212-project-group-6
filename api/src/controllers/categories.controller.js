import { getCategoriesCached } from "../lib/categories";

export const getCategoriesController = (req, res, next) => {
    try {
        const categories = getCategoriesCached();
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

