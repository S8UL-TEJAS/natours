const tourModel = require('./../models/TourModel');
exports.getOverview=async(req,res)=>{
    //1.get all the tours from database
    const tours = await tourModel.find();
    //2.create template
    //3.render template
    res.status(200).render('overview',{
        title:'All tours',
        allTours:tours
    });
}
exports.getTour = async (req,res)=>{
    console.log(req.params.tourSlug);
    const tour = await tourModel.findOne({slug:req.params.tourSlug}).populate({
        path:'reviews',
        fields:'review user rating '
    });
    console.log(tour);
    res.status(200).render('tour',{
        title:'The forest hiker',
        tour
    });
};
exports.getLoginForm = async(req,res)=>{
    res.status(200).render('login',{
        title:'Login to your account'
    });
}
exports.getAccount = async(req,res)=>{
    console.log(req.user);
    res.status(200).render('account',{
        title:'My account'
    });
}