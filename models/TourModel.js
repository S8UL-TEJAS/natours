const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour name must have less or equal then 40 characters'],
            minlength: [10, 'A tour name must have more or equal then 10 characters'],
            //validate: [validator.isAlpha, 'Tour name must only contain characters']
        },
        slug: String,
        duration: {
            type: Number,
            //required: [true, 'A tour must have a duration']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size']
        },
        difficulty: {
            type: String,
            //required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult'
            }
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0']
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function(val) {
                // this only points to current doc on NEW document creation
                    console.log('DMSD IN V');
                   // console.log(`${JSON.stringify(this)} In validator`);
                    console.log('wdwd v');
                    return val < this.price;
                },
                message: 'Discount price ({VALUE}) should be below regular price'
            }
        },
        summary: {
            type: String,
            trim: true,
            //required: [true, 'A tour must have a description']
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            //required: [true, 'A tour must have a cover image']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: true
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'UserModel'
            }
        ]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
tourSchema.index({price:1});
tourSchema.index({slug:1})

tourSchema.virtual('durInWeeks').get(function () {
    return this.duration / 7;
});
tourSchema.virtual('namee').get(function () {
    return this.name;
});
//VIRTUAL POPULATE(? NOT WORKING)
tourSchema.virtual('reviews',{
    ref:'ReviewModel',
    foreignField:'tour',
    localField:'_id'
})

// DOCUMENT MIDDLEWARES:
    // will run before document gets saved to database and run in both the cases: .create() and .save()
tourSchema.pre('save',function (next) {
    console.log('Document is about to going to save to database!');
    this.slug = slugify(this.name,{lower:true});
    next();
});
tourSchema.post('save',function (doc,next) {
    console.log('Our document just gets saved to database!');
    //console.log(doc);
    next();
});
tourSchema.pre(/^find/,function (next) {
    this.populate({
        path: 'guides',
        select:'-__v -passwordChangedAt'
    });
    next();
});
tourSchema.pre(/^find/,function (next) {
    console.log('Finding document');
    next();
});

const tourModel = mongoose.model('TourModel', tourSchema);
module.exports = tourModel;
//5eb290d4e49ad41d6c7347bb