export const validateCategoriesApiResponse = (data) => {
    const errors = {};

    // 1. Check if the root is an object and contains the 'categories' array
    if (!data || typeof data !== 'object') {
        return {
            isValid: false,
            errors: { root: 'Response must be a valid JSON object.' }
        };
    }

    if (!Array.isArray(data.categories)) {
        errors.categories = 'The "categories" property must be an array.';
        return { isValid: false, errors };
    }

    const itemErrors = [];

    // 2. Iterate and validate each category item in the array
    data.categories.forEach((category, index) => {
        const fieldErrors = {};

        // idCategory must be a string or number
        if (!category.idCategory || (typeof category.idCategory !== 'string' && typeof category.idCategory !== 'number')) {
            fieldErrors.idCategory = 'idCategory is required and must be a string or number.';
        }

        // strCategory must be a non-empty string
        if (!category.strCategory || typeof category.strCategory !== 'string' || category.strCategory.trim() === '') {
            fieldErrors.strCategory = 'strCategory is required and must be a non-empty string.';
        }

        // strCategoryThumb must be a valid URL string pointing to an image
        if (!category.strCategoryThumb || typeof category.strCategoryThumb !== 'string' || !category.strCategoryThumb.startsWith('http')) {
            fieldErrors.strCategoryThumb = 'strCategoryThumb must be a valid URL string.';
        }

        // strCategoryDescription must be a string (can be empty, but must be string type)
        if (category.strCategoryDescription !== undefined && typeof category.strCategoryDescription !== 'string') {
            fieldErrors.strCategoryDescription = 'strCategoryDescription must be a string if provided.';
        }

        if (Object.keys(fieldErrors).length > 0) {
            itemErrors.push({ index, errors: fieldErrors });
        }
    });

    if (itemErrors.length > 0) {
        errors.items = itemErrors;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};