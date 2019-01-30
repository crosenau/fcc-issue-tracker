/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const ObjectID = require('mongodb').ObjectID;

function verifyRequiredInputs(inputs, requiredFields) {
  let hasRequiredValues = true;
  
  for (let field of requiredFields) {
    if (!inputs[field] || inputs[field] === '') {
      hasRequiredValues = false;
    }
  }
  
  return hasRequiredValues;
}

function inputsToMongoObject(inputs) {
  // Converts a request.body or request.query object to a valid query object for mongod
  const mongoObject = {};
  
  for (let key in inputs) {
    switch (key) {
      case '_id':
        mongoObject[key] = ObjectID(inputs[key]);
        break;
      case 'open':
        mongoObject[key] = (inputs[key] === 'true');
        break;
      case 'created_on':
        mongoObject[key] = new Date(inputs[key]);
        break;
      case 'updated_on':
        mongoObject[key] = new Date(inputs[key]);
        break;
      default:
        mongoObject[key] = sanitize(inputs[key]);
    }
  }
  
  return mongoObject;
}

function sanitize(input) {
  // Strip out '<' and '>' characters to prevent HTML injection.
  
  return input      
    .replace(/\</gm, '&lt')
    .replace(/\>/gm, '&gt');
}

module.exports = (app, db) => {
  app.route('/api/issues/:project')
  
    .all((req, res, next) => {
      // If request contains an _id, verify that it is a valid mongodb.ObjectID
      
      const inputSets = [req.query, req.body, req.params];
    
      for (let inputs of inputSets) {
        for (let key in inputs) {
          if (key === '_id' && !ObjectID.isValid(inputs[key])) {
            return res.send('_id error');
          }
        }
      }
    
      next();
    })

    .get((req, res) => {
      const project = req.params.project;
      const query = inputsToMongoObject(req.query);
    
      db.collection(`${project}-issues`).find(query).toArray()
        .then(results => res.json(results))
        .catch(err => {
          console.error(err);
          res.send('could not retrieve data');
        });
    })

    .post((req, res) => {    
      const project = req.params.project;
      const timeStamp = new Date();
      const document = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: timeStamp,
        updated_on: timeStamp,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        open: true,
        status_text: req.body.status_text || ''
      };
    
      const requiredFields = ['issue_title', 'issue_text', 'created_on'];
    
      if (!verifyRequiredInputs(document, requiredFields)) return res.send('missing inputs');
    
      db.collection(`${project}-issues`).insertOne(document)
        .then(result => res.json(result.ops[0]))
        .catch(err => {
          console.error(err);
          res.send('could not create new issue');
        });
    })

    .put((req, res) => {
      const project = req.params.project;
      const update = inputsToMongoObject(req.body);
      const requiredFields = ['_id'];
    
      if (
        !verifyRequiredInputs(update, requiredFields) 
        || Object.keys(update).length < 2
      ) {
        return res.send('no updated field sent');
      }
    
    
      const id = update._id;
      const timeStamp = new Date();
    
      update.updated_on = timeStamp;
    
      db.collection(`${project}-issues`).findOneAndUpdate({ _id: id }, { $set: {...update}}, { returnOriginal: false })
        .then(result => {
          if (result.lastErrorObject.updatedExisting) {
            res.send('successfully updated');
          } else {
            res.send(`could not update ${id}`);
          }
        })
        .catch(err => {
          console.error(err);
          res.send(`could not update ${id}`);
        });
    })

    .delete((req, res) => {
      const project = req.params.project;  
      const id = ObjectID(req.body._id);

      db.collection(`${project}-issues`).deleteOne({ _id: id })
        .then(result => {
          if (result.deletedCount > 0) {
            return res.send(`deleted ${id}`);
          }
        
          return res.send(`could not delete ${id}`);
        })
        .catch(err => {
          console.error(err);
          res.send(`could not delete ${id}`);
        });
    });
};