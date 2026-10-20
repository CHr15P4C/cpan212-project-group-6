import { Router } from 'express';
import { 
    getFavouritesController, 
    getFavouritesByIdController, 
    createFavouriteController, 
    updateFavouriteController, 
    deleteFavouriteController 
} from '../controllers/favourites.controller.js';

export const favouriteRouter = Router();

favouriteRouter.get('/favourites/', getFavouritesController);
favouriteRouter.get('/favourites/:id', getFavouritesByIdController);
favouriteRouter.post('/favourites/', createFavouriteController);
favouriteRouter.put('/favourites/:id', updateFavouriteController);
favouriteRouter.delete('/favourites/:id', deleteFavouriteController);