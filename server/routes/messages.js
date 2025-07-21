const express = require('express')
const router = express.Router()
const { message, chat } = require('../models')
const { validateToken } = require('../middleware/authMiddleware')

//post call with a chatId in body or alternative with roomId and clientId on body to retrieve the chat history/messages of a specific one
router.post('/history', validateToken, async (req, res) => {
    let searchedChatHistory
    if (req.body.hasOwnProperty('chatId'))
    {   
        searchedChatHistory = await message.findAll({
            where: { chatId: req.body.chatId },
            attributes: ['userId', 'text', 'createdAt'],
            order: [['createdAt']]
        }).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
    }
    else{
        //get chatId from request data in order to retrieve the right chat
        const chatId = await chat.findOne({ 
            where: { 
                roomId: req.body.roomId,
                userId: req.body.clientId,
            }
        }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)), e = true  }) 
        
        if(!chatId)
            return res.json({ error:"925", msg: "Δεν υπάρχουν μηνύματα για τη συγκεκριμένη συζήτηση" })
        else {
                searchedChatHistory = await message.findAll({
                where: { chatId: chatId.id },
                attributes: ['userId', 'text', 'createdAt'],
                order: [['createdAt']]
            }).catch(error => { return res.status(400).json({ error: error.errors[0].message }), e = true })
        }   
    }
    if (searchedChatHistory == null)
        return res.json({ error:"925", msg: "Δεν υπάρχουν μηνύματα για τη συγκεκριμένη συζήτηση" })
    return res.json(searchedChatHistory)
})

//POST call to create a new chat
router.post('/', validateToken, async (req, res) => {
    
    let e = false  //flag for errors
    //get the chatId first to fill it after in message creation
    if (req.body.hasOwnProperty('chatId'))
    {
        const { chatId, userId, text } = req.body
        await message.create({
            chatId: chatId,
            userId: userId,
            text: text
        }).catch(error => { return  res.status(400).json( JSON.parse(error.errors[0].message)) , e = true}) 
    }
    else{
        const { roomId, userId, text } = req.body
        const chatId = await chat.findOne({ 
            where: { 
                roomId: roomId,
                userId: userId,
            }
        }).catch(error => { return res.status(400).json(JSON.parse(error.errors[0].message)), e = true  })

        await message.create({
            chatId: chatId.id,
            userId: userId,
            text: text
        }).catch(error => { return  res.status(400).json( JSON.parse(error.errors[0].message)) , e = true})
    }

    //in case no error were encountered
    if (!e)
        return res.json() //status 200 (default)
})

module.exports = router