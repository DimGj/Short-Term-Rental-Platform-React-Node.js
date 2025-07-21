const express = require('express')
const router = express.Router()
const { user , room } = require('../models')
const bcrypt = require('bcrypt')
const { sign } = require('jsonwebtoken')
const { validateToken } = require('../middleware/authMiddleware')
const MatrixFactorization = require('../MatrixFactorization')

//GET call with or without id param to return the desired users
router.get('/:id?', validateToken, async (req, res) => {
    let e = false, searchedUsers
    if(req.params.id){
        searchedUsers = await user.findByPk(
            req.params.id,
            { raw: true }
        ).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
        if (searchedUsers == null)
            return res.json({ error: "911", msg: "Ο χρήστης δεν βρέθηκε" })
    }
    else
        searchedUsers = await user.findAll(
            { raw: true }
        ).catch(error => { return res.status(400).json(error.errors[0].message), e = true })
    if (!e)
        res.json(searchedUsers)
})

//GET call with an id in params to return the specific user
router.get('/:id', validateToken, async (req, res) => {
    const id = req.params.id
    let searchUser = await user.findByPk(
        id,
        { raw: true }
    ).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
    if (searchUser == null)
        return res.json({ error: "911", msg: "Ο χρήστης δεν βρέθηκε" })
    return res.json(searchUser)
})

//PUT call with an id in params to edit the details of the specific user
router.put('/:id', validateToken, async (req, res) => {
    const id = req.params.id
    if ('searchedRoomId' in req.body){
        searchedUser = await user.findByPk(
            id,
            { raw: true }
        ).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
        console.log(searchedUser.role)
        if(searchedUser.role === 'client')
        {
            const currentUser = await user.findByPk(id)
            let existingSearchedRoomIds = currentUser.searchedRoomId || ''
            const newSearchedRoomId = req.body.searchedRoomId

            if (existingSearchedRoomIds)
                existingSearchedRoomIds += ',' + newSearchedRoomId  // If there are existing room IDs, concatenate the new one with a comma
            else
                existingSearchedRoomIds = newSearchedRoomId // If no existing room IDs, set it to the new value
        
            const updatedRoomIds = [...new Set([...existingSearchedRoomIds.split(','), newSearchedRoomId])].join(',')   //convert it to set to include unique ids in the column
            req.body.searchedRoomId = updatedRoomIds
        }
        else
            return res.status(400).json({ error: "926", msg: "Ο χρήστης δεν ειναι πελάτης για να καταχωρηθεί ιστορικό επισκεψιμότητας" })
    }

    await user.update(
        req.body,
        { where: { id: id }}
    ).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)) })
    return res.json()
})

//DELETE call with an id in params to delete the specific user
router.delete('/:id', validateToken, async (req, res) => {
    const id = req.params.id
    await user.destroy({
        where: { id: id }
    }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)) })
    return res.json()
})

//POST call to register a new user in db
router.post('/registration', async (req, res) => {
    const { username, password, firstname, lastname, email, telephone, avatar ,role } = req.body
    let e = false, accessToken  //flag for errors and declaration of jwt
    if(role === 'host')
        var status = 'pending'
    else
        var status = 'accepted'
    await bcrypt.hash(password, 10).then(async (hash) => {
        const createdUser = await user.create({
            username: username,
            password: hash,
            firstname: firstname,
            lastname: lastname,
            email: email,
            telephone: telephone,
            avatar: avatar,
            role: role,
            status: status
        })
        
        accessToken = sign({ username: createdUser.username, id: createdUser.id}, "BigSecret", { expiresIn: "30m" })

    }).catch(error => { return  res.status(400).json( JSON.parse(error.errors[0].message)) , e = true})
    //in case no error were encountered
    if (!e)
        return res.json({ token: accessToken }) //status 200 (default)
})

//POST call to login an existing user in db
router.post('/login', async (req, res) => {
    const { username, password } = req.body
    const foundUser = await user.findOne({ where: { username: username } })

    if (!foundUser)
        return res.status(401).json({ error: "910", msg: "Λάθος συνδιασμός όνομα χρήστη και κωδικού" })

    await bcrypt.compare(password, foundUser.password).then((match) => {
        if (!match)
            return res.status(401).json({ error: "910", msg: "Λάθος συνδιασμός όνομα χρήστη και κωδικού" })

        //in case of validated data do
        const accessToken = sign({ username: foundUser.username, id: foundUser.id }, "BigSecret", { expiresIn: "30m" })
        return res.json({ token: accessToken }) //status 200 (default)
    })
})

router.post('/refresh-token', validateToken, async (req, res) => {
    const decoded = req.decoded
    const NewAccessToken = sign({ username: decoded.username, id: decoded.id }, "SecondBigSecret", { expiresIn: "12h", }) //generate a new refreshed token , since it passed validation
    return res.json({ token: NewAccessToken })
})

router.get('/recommendation/:id', validateToken, async (req, res) => {
    const id = req.params.id
    
    const userDetails = await user.findByPk(
        req.params.id,
        { raw: true }
    ).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })

    if(userDetails.role === 'host' || userDetails.role === 'admin')
        return res.status(200)  //dont recommend to host users
    try {
        const recommendationList = await MatrixFactorization.GetRecommendations(id)
        const roomIds = recommendationList.map(recommendation => recommendation.roomId)
        const roomDetailsPromises = roomIds.map(roomId => room.findByPk(roomId))
        const roomDetails = await Promise.all(roomDetailsPromises)

        const recommendationsWithDetails = recommendationList.map((recommendation, index) => {
            const roomDetail = roomDetails[index];
            return {
                ...recommendation,
                roomDetail: roomDetail || {} // Provide an empty object if room detail is not found
            }
        })

        return res.json(recommendationsWithDetails);
    } 
    catch (error) {  return res.status(400).json( JSON.parse(error.errors[0].message)) }
})


module.exports = router