const express = require('express');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router({mergeParams:true});

router
    .route('/')
    .post(authController.protect,reviewController.createReview)
    .get(reviewController.getReviews);
router
    .route('/:id')
    .get(reviewController.getReview)
    .delete(authController.protect,reviewController.deleteReview)   // HACK: Only that user who created review can delete that review
    .patch(authController.protect,reviewController.updateReview);   // HACK: Only that user who created review can update that review
module.exports = router;