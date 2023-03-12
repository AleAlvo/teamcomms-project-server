const router = require("express").Router();
const mongoose = require('mongoose')

//import the Message model
const Message = require("../models/Message.model");

//import the events model
const Event = require("../models/Event.model");

//creating it, async because we want to trigger it after we recieve the information needed to create it.
router.post("/messages", async (req, res, next) => {
  try {
    //getting the information from the model
    const { title, description, important, event, expirationDays, sentTo } = req.body;
    const created = new Date();
    let expiration;
    if (expirationDays) {
      expiration = new Date();
      expiration.setDate(expiration.getDate() + expirationDays)
    }
    //wait until we have the information, then we create it
    const newMessage = await Message.create({
      title,
      description,
      important,
      event,
      created,
      expiration,
      sentTo
    });
    //send the information to the client
    res.json(newMessage);
  } catch (error) {
    console.log(error);
  }
});

//getting all the messages, populating sentTo and readBy to show that information to Staff
router.get('/messages', async (req, res, next) => {
  try {
    const messages = await Message.find().populate('sentTo readBy');
    res.json(messages);
  } catch (error) {
    res.json(error);
    console.log(error)
  }
})

//editing one message
router.put('/messages/:id', async (req, res, next) => {
  const {id} = req.params;
  const {title, description, important, event, expirationDays, sentTo} = req.body;
  let expiration;
    if (expirationDays) {
      expiration = new Date();
      expiration.setDate(expiration.getDate() + expirationDays)
    }
  if(!mongoose.Types.ObjectId.isValid(id)) {
      res.json("The provided message id is not valid")
  }
  try {
      const updatedMessage = await Message.findByIdAndUpdate(id, {title, description, important, event, expiration, sentTo}, {new: true});

      if(!updatedMessage) {
        //if nothing is returned, send an error response
        return res.status(404).json({ message: 'Message not found' })
      }

      res.json(updatedMessage);
  } catch (error) {
      res.status(500).json({ message: 'Internal server error'});
  }
})

//delete one message
router.delete('/messages/:id', async (req, res, next) => {
  const {id} = req.params;
  if(!mongoose.Types.ObjectId.isValid(id)) {
      res.json("The provided message id is not valid")
  }
  try {
      await Message.findByIdAndDelete(id);
      res.json({message: `Message with the ${id} id successfully deleted`})
  } catch (error) {
      res.json(error);
  }
})


module.exports = router;