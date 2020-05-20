const UserModel = require("./../models/UserModel");
const mongoose = require("mongoose");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
// const sendEmail = require("./../utils/email");
const crypto = require("crypto");
const colors = require("colors");
const Email = require('./../utils/email');
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true   //// cannot manipulate cookie in browser
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  res.cookie("jwt", token, cookieOptions);
  // HACK: DONT EVER SEND PASSWORD AS RESPONSE
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
  });
};
exports.signup = async (req, res, next) => {
  // take username, password, passwordConfirm and email from req.body
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  const url = `${req.protocol}://${req.get('host')}/`;
  console.log(url);
  await new Email(newUser,url).sendWelcome();
  // then server will generate the token with thee help of payload ((newUser._id).toJSON()), add its own header to them and will
  //also use our secret string
  createSendToken(newUser, 200, res);
  //send this generated token as response to user
  res.status(200).json({
    status: "Success",
    message: "Created account and logged in",
    user: {
      newUser
    }
  });
};
exports.login = async (req, res, next) => {
  // getting email and password from req.body
  const email = req.body.email;
  const password = req.body.password;
  // checking whether the email and password exists
  if (!email || !password) {
    console.log("Email or password does not provided!");
    return next();
  }
  //finding user based on username and password
  const user = await UserModel.findOne({ email }).select("+password");
  // matching password with database password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(404).json({
      status: "fail",
      message: "Incorrect email or password"
    });
  }
  //creating JWT
  createSendToken(user, 200, res);
  //console.log(`${pm}`.yellow);
  //sending back JWT to users
  //calling next
  next();
};
exports.logout = async(req,res,next)=>{
  res.cookie('jwt','faketokenhahaha',{
    expires:new Date(Date.now()+0.1),
    httpOnly:true
  });
  res.status(200).json({
    status:'success'
  });
}
exports.protect = async (req, res, next) => {
  // getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ){
      token = req.headers.authorization.split(" ")[1];
    console.log("Token is" + token);
  }else if(req.cookies.jwt){
    token = req.cookies.jwt;
    console.log("Token is" + token);
  }
    if (!token) {
      return res.status(400).json({
        status: "fail",
        message: "No token"
      });
    }
    //Verifying token by server
    try {
      var decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      console.log(decoded);
    } catch (err) {
      return res.status(404).json({
        status: "Fail",
        message: "TOKEN IS WRONG ⛔ "
      });
    }
    // Check if user still exists
    const freshUser = await UserModel.findById(decoded.id);
    if (!freshUser) {
      return res.status(404).json({
        status: "Fail",
        message: "The User belonging to this token is no longer exists"
      });
    }
    console.log(`${freshUser}`.red);
    // check if user changed password after token was issued

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    //res.locals.user = freshUser;
    next();
};
exports.isLoggedIn = async (req, res, next) => {
    //Verifying token by server
    if(req.cookies.jwt){
        var decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      const freshUser = await UserModel.findById(decoded.id);
      if(!freshUser){
        return next();
      }
      res.locals.user = freshUser;
      return next();
    }
    next();
};

exports.restrictTo = (...roles) => {
  // HACK: cannot pass arguments in middleware function
  return (req, res, next) => {
    console.log(`${req.user}`.green);
    console.log(`${roles}`.yellow);
    if (!roles.includes(req.user.role)) {
      return res.status(400).json({
        status: "fail",
        message: "Sorry you dont have permissions"
      });
    }
    console.log("dedefdf");
    next();
  };
};
exports.forgotPassword = async (req, res, next) => {
  // get user based on posted email
  const user = await UserModel.findOne({ email: req.body.email });
  console.log(`${user.name}`.yellow);
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "No user found with that email"
    });
  }
  // generate random token
  const resetToken = user.createResetPasswordToken();
  // HACK: We are saving document with updated passwordResetToken and passwordResetTokenExpires properties
  // but then it will give validation error cause we have set validators on name and passoword so we say validateBeforeSave:false
  await user.save({ validateBeforeSave: false });
  console.log(`${user}`.red);
  //send back email with resetToken
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  //const message = `To reset password . click the link ${resetURL}. Valid for 10 minutes only`;
  console.log(`${user}`.red);
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: "About resetting password",
    //   message
    // });
    await new Email(user,resetURL).sendPasswordReset();
    res.status(200).json({
      status: "Sucess",
      message: "Token send to email"
    });
  } catch (err) {
    console.log(`error   ${err}`.red);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
  }
  next();
};
exports.resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await UserModel.findOne({
    passwordResetExpires: { $gt: Date.now() },
    passwordResetToken: hashedToken
  });
  //  console.log(`${user.email}`.yellow);
  if (!user) {
    return res.status(404).json({
      status: ":fail",
      message: "No user found. Unable to reset the password:("
    });
  }
  (user.password = req.body.password),
    (user.passwordConfirm = req.body.passwordConfirm);
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  res.status(200).json({
    status: "sucess",
    message: "Password Updated successfully",
    data: {
      user
    }
  });
  createSendToken(user, 200, res);
};
exports.updatePassword = async (req, res, next) => {
  // only logged in users can update password
  const user = await UserModel.findById(req.user.id).select("+password");
  if (!user) {
    return res.status(400).json({
      status: "fail",
      message:
        "Only logged in users can update password. Login first in order to update password"
    });
  }
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return res.status(400).json({
      status: "fail",
      message: "Your current password is wrong"
    });
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPassword;
  await user.save();
  res.status(200).json({
    status: "Sucess",
    message: "Successfully updated password!"
  });
  createSendToken(user, 200, res);
};
