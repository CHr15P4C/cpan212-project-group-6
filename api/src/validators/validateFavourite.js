export const validateFavouriteInput = (data, isUpdate = false) => {
    const errors = {};

    // If it's a create request, name and ingredients are required.
    // If it's an update request (PUT), fields are optional, but if provided, must be valid.
    if (!isUpdate || data.name !== undefined) {
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            errors.name = 'Name is required and must be a non-empty string.';
        }
    }

    if (!isUpdate || data.ingredients !== undefined) {
        if (!Array.isArray(data.ingredients) || data.ingredients.length === 0 || !data.ingredients.every(item => typeof item === 'string' && item.trim() !== '')) {
            errors.ingredients = 'Ingredients must be a non-empty array of strings.';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};