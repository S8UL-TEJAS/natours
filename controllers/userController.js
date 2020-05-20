const UserModel = require('./../models/UserModel');
exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = async(req, res) => {
  UserModel.findByIdAndRemove(req.user.id);
  res.status.json({
    status:'success',
    data:null
  });
};
const filterObj =(obj, ...allowdedFields)=>{
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowdedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}
exports.getMe = async(req,res)=>{
  console.log('Hello get me'.green);
  const user = await UserModel.findById(req.user.id);
  console.log(user)
  res.status(200).json({
    status:'success',
    data:{
      user
    }
  })
}
exports.deleteMe = async(req,res)=>{
  await UserModel.findByIdAndUpdate(req.user.id,{active:false});
  res.status(200).json({
    status:'sucess',
    data:'User deleted sucessfully'
  });
}
exports.updateMe = async(req,res)=>{
  console.log(req.body);
  console.log(req.file);
  if(req.body.password || req.body.passwordConfirm){
    return res.status.json({
      status:'fail',
      message:'You cannot update password here'
    });
  }

  //
  const filterBody=filterObj(req.body, 'name', 'email');
  console.log(`${req.user} is req.user `.yellow)
  console.log(filterBody);
  const user = await UserModel.findByIdAndUpdate(req.user._id,filterBody,{
    new:true,
    runValidators:true
  });
  res.status(200).json({
    status:'success'
    // data:{
    //   user:user
    // }
  });
}

