const express = require('express')
const router = express.Router()
const { user, room, booking } = require('../models')
const { validateToken } = require('../middleware/authMiddleware')
const { differenceInDays, parseISO } = require('date-fns')


//GET call with or without id param to return the desired bookings
router.get('/:id?', validateToken, async (req, res) => {
    let e = false, searchedBookings
    if(req.params.id){
        searchedBookings = await booking.findByPk(
            req.params.id,
            { raw: true }
        ).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
        if (searchedBookings == null)
            return res.json({ error: "928", msg: "Η κράτηση δεν βρέθηκε" })
    }
    else
        searchedBookings = await booking.findAll(
            { raw: true }
        ).catch(error => { return res.status(400).json(error.errors[0].message), e = true })
    if (!e)
        res.json(searchedBookings)
})

//GET call with param id to return specific booking
router.get('/:id', validateToken, async (req, res) => {
    let e = false
    const bookingInfo = await booking.findAll({ 
        where: { id: req.params.id } 
    }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)), e = true  }) 
    if (!e)
        return res.json(bookingInfo)
})

//GET call with param id to return all bookings of a specific room
router.get('/roomId/:id', validateToken, async (req, res) => {
    let e = false
    const bookingsOfRoom  = await booking.findAll({ 
        where: { roomId: req.params.id } 
    }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)), e = true  }) 
    if (!e)
        return res.json(bookingsOfRoom)
})

//GET call with param id to return all bookings of logged user
router.get('/userId/:id', validateToken, async (req, res) => {
    let e = false
    const bookingsOfUser  = await booking.findAll({ 
        where: { userId: req.params.id } 
    }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)), e = true  }) 
    if (!e)
        return res.json(bookingsOfUser)
})

//DELETE call with an id in params to cancel the specific booking
router.delete('/:id', validateToken, async (req, res) => {
    const id = req.params.id
    await booking.destroy({ 
        where: { id: id } 
    }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)) })
    return res.json()
})

//POST call to register a new booking of the logged user in db
router.post('/', validateToken, async (req, res) => {
    const { clientId, roomId, checkIn, checkOut, numberOfPeople } = req.body

    const clientDetails = await user.findByPk(
        clientId,
        { raw: true }
    ).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
    if (clientDetails == null)
        return res.json({ error: "911", msg: "Ο χρήστης δεν βρέθηκε" })
    else{
        if(clientDetails.role != "client")
            return res.json({ error: "917", msg: "Ο χρήστης δεν ειναί πελάτης ώστε να κάνει κράτηση" })
    }

    const roomDetails = await room.findByPk(
        roomId,
        { raw: true }
    ).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
    if (roomDetails == null)
        return res.json({ error: "918", msg: "Το δωμάτιο δεν βρέθηκε" })
    
    const numberOfNights = differenceInDays(parseISO(checkOut), parseISO(checkIn))
    if(numberOfNights < roomDetails.minimum_nights)
        return res.json({ error: "927", msg: "Το ελάχιστο όριο διανυκτρεύσεων δεν πλήρείται" })
        
    console.log(numberOfNights)
    let e = false
    await booking.create({
        userId: clientId,
        roomId: roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfPeople: numberOfPeople,
        totalPrice: numberOfNights * (roomDetails.price + roomDetails.extraPersonPrice * (numberOfPeople -1)),
    }).catch(error => { return  res.status(400).json( JSON.parse(error.errors[0].message)) , e = true})

    //in case no error were encountered
    if (!e)
        return res.json() //status 200 (default)
})

module.exports = router