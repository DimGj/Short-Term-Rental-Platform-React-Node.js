const express = require('express')
const router = express.Router()
const { message, chat } = require('../models')
const { validateToken } = require('../middleware/authMiddleware')

//GET call with or without id param to return the desired chats
router.get('/:id?', validateToken, async (req, res) => {
    let e = false, searchedChats
    if(req.params.id){
        searchedChats = await chat.findByPk(
            req.params.id,
            { raw: true }
        ).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
        if (searchedChats == null)
            return res.json({ error: "922", msg: "Η συζήτηση δεν βρέθηκε" })
    }
    else{
        searchedChats = await chat.findAll(
            { raw: true }
        ).catch(error => { return res.status(400).json(error.errors[0].message), e = true })
    }
    if (!e)
        res.json(searchedChats)
})

//GET call with an id in params to return the chat of the specific room
router.get('/room/:id', validateToken, async (req, res) => {
    const id = req.params.id
    let searchedChats = await chat.findAll(
        { where: { roomId: id }}
    ).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
    if (searchedChats == null)
        return res.json({ msg: "Δεν υπάρχουν μηνύματα για το συγκεκριμένο δωμάτιο" })
    return res.json(searchedChats)
})

//DELETE call with an id in params to delete the specific chat
router.delete('/:id', validateToken, async (req, res) => {
    const id = req.params.id
    await chat.destroy({
        where: { id: id }
    }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)) })
    return res.json()
})

//POST call to create a new chat
router.post('/', validateToken, async (req, res) => {
    const { roomId, userId, text } = req.body
    let e = false  //flag for errors
    const newChatId = await chat.create({
        roomId: roomId,
        userId: userId
    }).catch(error => { return  res.status(400).json( JSON.parse(error.errors[0].message)) , e = true})
    
    //create also the first message of the chat made by the client of course
    await message.create({
        text: text,
        chatId: newChatId.id,
        userId: userId
    }).catch(error => { return  res.status(400).json( JSON.parse(error.errors[0].message)) , e = true})

    //in case no error were encountered
    if (!e)
        return res.json() //status 200 (default)
})

module.exports = router