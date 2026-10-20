import { 
    getFavourites, 
    getFavouritesById, 
    createFavourite, 
    updateFavourite, 
    deleteFavourite 
} from '../lib/favourites.js';
import { validateFavouriteInput } from '../validators/validateFavourite.js';

export const getFavouritesController = (req, res, next) => {
    try {
        const favourites = getFavourites();
        res.status(200).json(favourites);
    } catch (error) {
        next(error);
    }
};

export const getFavouritesByIdController = (req, res, next) => {
    try {
        const favourite = getFavouritesById(req.params.id);
        if (!favourite) {
            return res.status(404).json({
                error: {
                    message: 'Favourite not found',
                    details: { id: `Favourite with id ${req.params.id} does not exist` }
                }
            });
        }
        res.status(200).json(favourite);
    } catch (error) {
        next(error);
    }
};

export const createFavouriteController = (req, res, next) => {
    try {
        const { isValid, errors } = validateFavouriteInput(req.body, false);
        if (!isValid) {
            return res.status(400).json({
                error: {
                    message: 'Validation failed',
                    details: errors
                }
            });
        }

        const newFavourite = createFavourite(req.body);
        res.status(201).json(newFavourite);
    } catch (error) {
        next(error);
    }
};

export const updateFavouriteController = (req, res, next) => {
    try {
        const { isValid, errors } = validateFavouriteInput(req.body, true);
        if (!isValid) {
            return res.status(400).json({
                error: {
                    message: 'Validation failed',
                    details: errors
                }
            });
        }

        const updatedFavourite = updateFavourite(req.params.id, req.body);
        if (!updatedFavourite) {
            return res.status(404).json({
                error: {
                    message: 'Favourite not found',
                    details: { id: `Favourite with id ${req.params.id} does not exist` }
                }
            });
        }
        res.status(200).json(updatedFavourite);
    } catch (error) {
        next(error);
    }
};

export const deleteFavouriteController = (req, res, next) => {
    try {
        const deletedFavourite = deleteFavourite(req.params.id);
        if (!deletedFavourite) {
            return res.status(404).json({
                error: {
                    message: 'Favourite not found',
                    details: { id: `Favourite with id ${req.params.id} does not exist` }
                }
            });
        }
        // Requirement: 204 for delete
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};