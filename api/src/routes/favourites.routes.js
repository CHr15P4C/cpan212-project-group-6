import { Router } from 'express';
import { 
    getFavouritesController, 
    getFavouritesByIdController, 
    createFavouriteController, 
    updateFavouriteController, 
    deleteFavouriteController 
} from '../controllers/favourites.controller.js';

export const favouriteRouter = Router();

favouriteRouter.get('/', getFavouritesController);
favouriteRouter.get('/:id', getFavouritesByIdController);
favouriteRouter.post('/', createFavouriteController);
favouriteRouter.put('/:id', updateFavouriteController);
favouriteRouter.delete('/:id', deleteFavouriteController);