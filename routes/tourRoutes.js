const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRouter');
const router = express.Router();

//HACK 
router.use('/:tourId/reviews',reviewRouter);


router
  .route('/')
  .get(tourController.getAllTours)
  .post( authController.protect,authController.restrictTo('admin'), tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect,tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.deleteTour
    );
// POST /tours/323dffr344/reviews/
// GET /tours/323dffr344/reviews/
// GET /tours/323dffr344/reviews/ewe34er


module.exports = router;
