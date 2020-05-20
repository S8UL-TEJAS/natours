const APIFeatures = require('./../utils/APIFeatures');
const TourModel = require('./../models/TourModel');
//const UserModel = require('./../models/UserModel');
exports.getAllTours = async (req, res) => {
    const features = new APIFeatures(TourModel.find(),req.query).filter().sort().limitFields().paginate();
  try{
      const tours = await features.query;
          // .and([{name:/.*er.*/i},{maxGroupSize:8}])
          //.limit(4)
          //.sort('price')
          //.skip(8);
      if(!tours){res.send('FAIL TO GET TOURS')};
      res.status(400).json({
        status:'success!',
        totalTours:tours.length,
        data:{
          tours
        }
      });
  }catch(err){
    res.status(200).json({
      status:'fail',
      message:err
    })
  }
};
// exports.getAllTours = async ()=>{
//   console.log(req.query +'is req,query');
// }
exports.getTour = async (req, res) => {
  console.log(req.params);
  console.log('swddef');
  try{
    const tour = await TourModel.findById(req.params.id).populate('reviews');
    res.status(200).json({
    status: 'success',
    data:{
      tour
    }
  });
  }catch(err){
    res.status(400).json({
      status:'fail',
      message:err
    });
  }
};

exports.createTour = async (req, res) => {
  // console.log(req.body);
  try{
    const newTour = await TourModel.create(req.body);
    res.status(400).json({
    status:"success!",
    data:{
      tour:newTour
    }
  })
  }catch(err){
    res.status(200).json({
      status:'fail',
      message:err
    });
  }
};

exports.updateTour = async (req, res) => {
  try{
  const tour= await TourModel.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
  }catch(err){
    res.status(400).json({
      status:'fail',
      message:err
    });
  }
};

exports.deleteTour = async (req, res) => {
  
  try{
    const tour = await TourModel.findByIdAndRemove(req.params.id);
    res.status(204).json({
    status: 'success',
    data: null
  });
  }catch(err){
    res.status(200).json({
      status:'fail',
      message:err
    })
  }
};
