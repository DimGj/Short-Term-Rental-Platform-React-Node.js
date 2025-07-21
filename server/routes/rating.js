const express = require('express')
const router = express.Router()
const sequelize = require('../node_modules/sequelize/index')
const { room, booking } = require('../models')
const { validateToken } = require('../middleware/authMiddleware')

//GET call without params to return all the ratings of bookings
router.get('/', validateToken, async (req, res) => {
    let e = false
    const allReviews = await booking.findAll({
        attributes: ['id', 'userId', 'roomId', 'review', 'rating'], 
        raw: true
    }).catch(error => { return res.status(400).json(error.errors[0].message), e = true })
    if (!e)
        return res.json(allReviews)
})

//GET call with param id to return all ratings of a specific room
router.get('/roomId/:id', validateToken, async (req, res) => {
    let e = false
    const bookingsOfRoom  = await booking.findAll({
        attributes: ['id', 'userId', 'review', 'rating'],
        where: { roomId: req.params.id }
    }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)), e = true  }) 
    if (!e)
        return res.json(bookingsOfRoom)
})

//GET call with param id to return all ratings of logged user
router.get('/userId/:id', validateToken, async (req, res) => {
    let e = false
    const bookingsOfUser  = await booking.findAll({
        attributes: ['id', 'roomId', 'review', 'rating'],
        where: { userId: req.params.id } 
    }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)), e = true  }) 
    if (!e)
        return res.json(bookingsOfUser)
})

//DELETE call with an id in params to cancel the specific rating
router.delete('/:id', validateToken, async (req, res) => {
    const id = req.params.id, bookingDetails = await booking.findByPk(req.params.id, { raw: true }).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
    if (bookingDetails == null)
        return res.json({ error: "920", msg: "Η κράτηση δεν βρέθηκε" })
    
    if(bookingDetails.rating == null)
        return res.json({ error: "921", msg: "Δεν υπάρχει βαθμολογία στην κράτηση" })

    const roomDetails = await room.findByPk(bookingDetails.roomId, { raw: true }).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
    if (roomDetails == null)
        return res.json({ error: "918", msg: "Το δωμάτιο δεν βρέθηκε" })

    //erase rating on booking
    await booking.update({
        review: null,
        rating: null
    },
    { 
        where: { id: id }
    }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)) })

    //two cases of updating the average rating of the room (1.  2. adding a new rating)
    if(roomDetails.number_of_reviews == 1) //speial case when you are deleting the only rating of the room
        var NewAverageRating = null
    else
        var NewAverageRating = (roomDetails.number_of_reviews * roomDetails.rating - bookingDetails.rating) / (roomDetails.number_of_reviews - 1)

    //change average rating and number of reviews in room
    await room.update({
        number_of_reviews: sequelize.literal('number_of_reviews - 1'),
        rating: NewAverageRating
    },
    {
        where: { id: bookingDetails.roomId }
    }).catch(error => { return  res.status(400).json( JSON.parse(error.errors[0].message))})

    return res.json()
})

//POST call to create a new rating or to update an existing one of a specific booking
router.post('/:id', validateToken, async (req, res) => {
    const { review, rating } = req.body
    console.log(rating)
    if(rating == null || rating < 1 || rating > 5)
        return res.json({ error: "919", msg: "Λάθος δεδομένα στην βαθμολογία" })

    const bookingDetails = await booking.findByPk(req.params.id, { raw: true }).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
    if (bookingDetails == null)
        return res.json({ error: "920", msg: "Η κράτηση δεν βρέθηκε" })

    const roomDetails = await room.findByPk(bookingDetails.roomId, { raw: true }).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
    if (roomDetails == null)
        return res.json({ error: "918", msg: "Το δωμάτιο δεν βρέθηκε" })

    let e = false, NewAverageRating
    
    //update booking's rating
    await booking.update({
        review: review,
        rating: rating
    },
    { 
        where: { id: req.params.id }
    }).catch(error => { return  res.status(400).json( JSON.parse(error.errors[0].message)) , e = true})
    //two cases of updating the average rating of the room (1. editing an existing rating 2. adding a new rating)
    if(bookingDetails.rating) //exists already and it was not null (case 1)
        NewAverageRating = (roomDetails.number_of_reviews * roomDetails.rating + rating - roomDetails.rating) / roomDetails.number_of_reviews
    else
        NewAverageRating = (roomDetails.number_of_reviews * roomDetails.rating + rating) / (roomDetails.number_of_reviews + 1)

    //update room rating and number of reviews too
    await room.update({
        number_of_reviews: sequelize.literal('number_of_reviews + 1'),
        rating: NewAverageRating
    },
    { 
        where: { id: bookingDetails.roomId }
    }).catch(error => { return  res.status(400).json( JSON.parse(error.errors[0].message)) , e = true})
    
    //in case no error were encountered
    if (!e)
        return res.json() //status 200 (default) 
})

module.exports = router