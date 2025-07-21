const express = require('express')
const router = express.Router()
const sequelize = require('../node_modules/sequelize/index')
const { user, room } = require('../models')
const { validateToken } = require('../middleware/authMiddleware')
const { Op } = require('sequelize')

//GET call with or without id param to return the desired room(s)
router.get('/:id?', async (req, res) => {
    let e = false, searchedRooms
    if(req.params.id)
        searchedRooms  = await room.findAll({ 
            where: { id: req.params.id } 
        }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)), e = true  }) 
    else
        searchedRooms = await room.findAll({ 
            raw: true 
        }).catch(error => { return res.status(400).json(error.errors[0].message), e = true })
    if (!e)
        return res.json(searchedRooms)
})

//GET call with user id param to return the user's listed room(s)
router.get('/user/:id', validateToken, async (req, res) => {
    let e = false, searchedRooms
    if(req.params.id)
        searchedRooms  = await room.findAll({ 
            where: { userId: req.params.id } 
        }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)), e = true  }) 
    if (!e)
        return res.json(searchedRooms)
})

//PUT call with an id in params to edit the details of the specific room
router.put('/:id', validateToken, async (req, res) => {
    const id = req.params.id
    await room.update(
        req.body,
        { where: { id: id } }
    ).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)) })
    return res.json()
})

//DELETE call with an id in params to delete the specific room
router.delete('/:id', validateToken, async (req, res) => {
    const id = req.params.id
    await room.destroy({
        where: { id: id } 
    }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)) })
    return res.json()
})

//POST call to register a new room of the logged user in db
router.post('/', validateToken, async (req, res) => {
    const { hostId, name, summary, description, street, zipcode, neighborhood, city, state, country, latitude, longitude, room_type, neighborhood_description, transition, accommodates, bathrooms, bedrooms,
        beds, has_couch, amenities, pets_allowed, smoking_allowed, events_allowed, surface, price, extraPersonPrice, startingRentingDate, endingRentingDate, minimum_nights, thumbnail, photos } = req.body
    
    const hostDetails = await user.findByPk(
        hostId,
        { raw: true }
    ).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
    if (hostDetails == null)
        return res.json({ error: "911", msg: "Ο χρήστης δεν βρέθηκε" })
    else{
        if(hostDetails.status === "pending")
            return res.json({ error: "916", msg: "Ο χρήστης δεν έχει εγκριθεί ως οικοδεσπότης" })
    }

    let e = false  //flag for errors
    await room.create({
        userId: hostId,
        name: name,
        description: description,
        street: street,
        zipcode: zipcode,
        neighborhood: neighborhood,
        city: city,
        state: state,
        country: country,
        address: null,
        latitude: latitude,
        longitude: longitude,
        room_type: room_type,
        neighborhood_description: neighborhood_description,
        transport: transition,
        accommodates: accommodates,
        bathrooms: bathrooms,
        bedrooms: bedrooms,
        beds: beds,
        has_couch: has_couch,
        amenities: amenities,
        pets_allowed: pets_allowed,
        smoking_allowed: smoking_allowed,
        events_allowed: events_allowed,
        surface: surface,
        price: price,
        extraPersonPrice: extraPersonPrice,
        startingRentingDate: startingRentingDate,
        endingRentingDate: endingRentingDate,
        minimum_nights: minimum_nights,
        thumbnail: thumbnail,
        photos: photos,
        number_of_reviews: 0
    }).catch(error => { return  res.status(400).json( JSON.parse(error.errors[0].message)) , e = true})

    //in case no error were encountered
    if (!e)
        return res.json() //status 200 (default)
        
})

//POST call with a request body for filtering the results of available rooms
router.post('/search_available', async (req, res) => {
    const locationKeywords = req.body.location.replace(" ","").split(',') 
    const locationConditions = []
    for (const keyword of locationKeywords) {
        locationConditions.push(
            sequelize.where(
                sequelize.fn('INSTR', sequelize.col('address'), keyword), '>', 0
            )
        )
    }
    
    // Check if 'amenities' exists in the req body
    const amenitiesConditions = []
    if (req.body.amenities && Array.isArray(req.body.amenities)) {
        for (const amenity of req.body.amenities) {
            amenitiesConditions.push(
                sequelize.where(
                    sequelize.fn('FIND_IN_SET', amenity, sequelize.col('amenities')), '>', 0
                )
            )
        }
    }
    
    let availableRoms = await room.findAll({ 
        raw : true, 
        where: {
            [Op.and]: [
                ...(locationConditions.length > 0 ? locationConditions : []),
                req.body.room_type ? { room_type: req.body.room_type } : null,
                req.body.price ? sequelize.literal(`(price + (${req.body.accommodates - 1}) * extraPersonPrice) <= ${req.body.price}`)  : null, //provided price must be lte of price + extra person costs
                ...(amenitiesConditions.length > 0 ? amenitiesConditions : []), // Apply AND logic for amenities
            ].filter(Boolean),  // filter by keeping only the non - null (existing on request) fields
            startingRentingDate: {
                [Op.lte]: req.body.checkInDate
            },
            endingRentingDate: {
                [Op.gte]: req.body.checkOutDate
            },
            accommodates: {
                [Op.gte]: req.body.accommodates
            },
            id: {  //exclude the room Ids that have bookings overlapping the provided dates of the req
                [Op.notIn]: sequelize.literal(`
                    (SELECT roomId FROM booking WHERE 
                        roomId = room.id AND
                        (
                            CheckInDate <  '${req.body.checkOutDate}' AND
                            CheckOutDate > '${req.body.checkInDate}'
                        )
                    )
                `),
            }
            
        },
        order: [[sequelize.literal(`price + (${req.body.accommodates - 1}) * extraPersonPrice`)]]
    }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)) })
    return res.json(availableRoms)
})

module.exports = router