const express = require('express');
const apiRouter = express.Router();
const checkMillionDollarIdea = require('./checkMillionDollarIdea');
const {
    getAllFromDatabase,
    addToDatabase,
    getFromDatabaseById,
    updateInstanceInDatabase,
    deleteFromDatabaseById,
    createMeeting,
    deleteAllFromDatabase,
  } = require("./db.js");

apiRouter.param('entity', (req, res, next, entity) => {
    const entities = ["minions", "ideas", "meetings", "work"];
    if(!entities.includes(entity)) {
        res.status(404).send(`${entity} is not a valid`);
    } else{
        req.entity = entity;
        next();
    }
});

apiRouter.param("id", (req, res, next, id) => {
    const validId = getFromDatabaseById(req.entity, id);
    if (!validId) {
      res.status(404).send(`${id} is not valid`);
    } else {
      req.id = validId;
      next();
    }
  });

const applyCheckMillionDollarIdea = (req, res, next) => {
    if(req.entity == "ideas") {
        return checkMillionDollarIdea(req, res, next);
    } else {
        next();
    }
};

apiRouter.get('/:entity', (req, res) => {
    const newEntity = getAllFromDatabase(req.entity);
    // console.log(req.entity);
    res.send(newEntity)
});

// apiRouter.post('/meetings', (req, res) => {
// });

apiRouter.post('/:entity', applyCheckMillionDollarIdea, (req, res) => {
    if(req.entity === 'meetings' ){
        const newMeeting = createMeeting();
        addToDatabase(req.entity, newMeeting);
        res.status(201).send(newMeeting);
    } else{ 
        const newEntity = addToDatabase(req.entity, req.body);
        res.status(201).send(newEntity);
    }
});

apiRouter.get('/:entity/:id', (req, res) => {
    res.send(req.id);
});

apiRouter.put('/:entity/:id', applyCheckMillionDollarIdea, (req, res) => {
    const newEntity = req.body;
    newEntity.id = req.params.id;
    const updateEntity = updateInstanceInDatabase(req.entity, newEntity);
    res.status(200).send(updateEntity);
});

apiRouter.delete('/:entity/:id', (req, res) => {
    deleteFromDatabaseById(req.entity, req.id.id);
    res.status(204).send("No Content");
});

apiRouter.delete('/:entity', (req, res) => {
    if(req.entity === "meetings"){
        deleteAllFromDatabase(req.entity);
        res.status(204).send("No Content");
    }
});

module.exports = apiRouter;
