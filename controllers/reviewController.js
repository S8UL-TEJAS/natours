const ReviewModel = require('./../models/reviewModel');
exports.createReview =async (req,res)=>{
    console.log('req.params.tourId'+req.params.tourId);
    console.log('req.user.id'+req.user.id);
    if(!req.body.tour){req.body.tour = req.params.tourId}
    if(!req.body.user){req.body.user = req.user.id}
    const review = await ReviewModel.create(req.body);
    console.log('Review is'+review);
    if(!review){
        console.log('No review');
    }
    res.status(200).json({
        status:'Success',
        data:{
            review
        }
    });
}
exports.getReviews= async (req,res)=>{
    let filter={};
    if(req.params.tourId) filter = {tour:req.params.tourId} 
    console.log("sdddddddddddddddddddd")
    const review = await ReviewModel.find(filter);
    res.status(200).json({
        state:'Success',
        Total:review.length,
        data:{
            review
        }
    });
}
exports.getReview = async (req,res)=>{
    const review = await ReviewModel.findById(req.params.id);
        //.populate('tour','user');
    if(!review){
        return res.status(404).json({
            status:'Fail',
            message:'No review found with that id'
        });
    }
    res.status(200).json({
        status:'Sucess',
        data:{
            review
        }
    });
}
exports.deleteReview = async (req,res)=>{
    const review = await ReviewModel.findByIdAndRemove(req.params.id);
        //.populate('tour','user');
    if(!review){
        return res.status(404).json({
            status:'Fail',
            message:'No review found with that id'
        });
    }
    if(req.user._id !=  review.user.id){
        return res.status(400).json({
            status:'fail',
            message:'Ónly original author can delete review'
        });
    }
    res.status(200).json({
        status:'Sucess',
        data:null
    });
}
exports.updateReview = async (req,res)=>{
    const review = await ReviewModel.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    });
    console.log(`${req.user} is currently logged in user`.yellow);
    console.log(`${review.user} is the original author of the review`.yellow);
    if(req.user._id !=  review.user.id){
        return res.status(400).json({
            status:'fail',
            message:'Ónly original author can update review'
        });
    }
        //.populate('tour','user');
    if(!review){
        return res.status(404).json({
            status:'Fail',
            message:'No review found with that id'
        });
    }
    res.status(200).json({
        status:'Sucess',
        data:{
            review
        }
    });
}