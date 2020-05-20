const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();
const multer = require('multer');

const upload = multer({dest:'public/img/users'});
router.post('/login',authController.login);
router.get('/logout',authController.logout);
router.post('/signup',authController.signup);
router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);
/*****/
router.use(authController.protect);
router.patch('/updatePassword',authController.updatePassword);
router.patch('/updateMe',upload.single('photo'),userController.updateMe);
router.patch('/deleteMe',userController.deleteMe);
router.get('/me',userController.getMe);
/*****/
router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
