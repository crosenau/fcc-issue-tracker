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

function verifyRequiredInputs(inputs, required) {
  let hasRequiredValues = true;
  
  for (let key of required) {
    if (!inputs[key] || inputs[key] === '') {
      hasRequiredValues = false;
    }
  }
  
  return hasRequiredValues;
}

function validateIdString(string) {
  // Determine if an input string can be converted to a valid mongodb.ObjectID
  
  try {
    return ObjectID(string) instanceof ObjectID;
  } catch(err) {
    return false;
  }
}

function inputsToQuery(inputs) {
  // Converts a request.body or request.query object to a valid query object for mongod
  const mongoQuery = {};
  
  for (let key in inputs) {
    switch (key) {
      case '_id':
        mongoQuery[key] = ObjectID(inputs[key]);
        break;
      case 'open':
        mongoQuery[key] = (inputs[key] === 'true');
        break;
      case 'created_on':
        mongoQuery[key] = new Date(inputs[key]);
        break;
      case 'updated_on':
        mongoQuery[key] = new Date(inputs[key]);
        break;
      default:
        mongoQuery[key] = inputs[key];
    }
  }
  
  return mongoQuery;
}

function sanitizeInputs(inputs) {
  let sanitized = {};
  
  for (let key in inputs) {
    if (typeof inputs[key] === 'string') {
      sanitized[key] = inputs[key]
        .replace(/\</gm, '&lt')
        .replace(/\>/gm, '&gt');
    } else {
      sanitized[key] = inputs[key];
    }
  }
  
  return sanitized;
}

module.exports = (app, db) => {
  app.route('/api/issues/:project')
  
    .all((req, res, next) => {
      // If request contains an _id, verify that it can be converted to MongoDb ObjectID
    
      let containsValidId;
    
      if (Object.keys(req.body).includes('_id')) {
        containsValidId = validateIdString(req.body._id);
      } else if (Object.keys(req.query).includes('_id')) {
        containsValidId = validateIdString(req.query._id);
      } else {
        return next();
      }
    
      if (containsValidId) return next();
    
      return res.send('_id error');
    })

    .get((req, res) => {
      const project = req.params.project;
      const inputObj = sanitizeInputs(inputsToQuery(req.query));
    
      db.collection(`${project}-issues`).find(inputObj).toArray()
        .then(results => res.json(results))
        .catch(err => {
          console.error(err);
          res.send('could not retrieve data');
        });
    })

    .post((req, res) => {    
      const project = req.params.project;
      const timeStamp = new Date();
      const inputObj = sanitizeInputs({
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: timeStamp,
        updated_on: timeStamp,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        open: true,
        status_text: req.body.status_text || ''
      });
    
      const requiredFields = ['issue_title', 'issue_text', 'created_on'];
    
      if (!verifyRequiredInputs(inputObj, requiredFields)) return res.send('missing inputs');
    
      db.collection(`${project}-issues`).insertOne(inputObj)
        .then(result => res.json(result.ops[0]))
        .catch(err => {
          console.error(err);
          res.send('could not create new issue');
        });
    })

    .put((req, res) => {
      const project = req.params.project;
      const inputObj = sanitizeInputs(inputsToQuery(req.body));
      const requiredFields = ['_id'];
    
      if (
        !verifyRequiredInputs(inputObj, requiredFields) 
        || Object.keys(inputObj).length < 2
      ) {
        return res.send('no updated field sent');
      }
    
    
      const id = inputObj._id;
      const timeStamp = new Date();
    
      inputObj.updated_on = timeStamp;
    
      db.collection(`${project}-issues`).findOneAndUpdate({ _id: id }, { $set: {...inputObj}}, { returnOriginal: false })
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
      const inputObj = { _id: ObjectID(req.body._id) };
    
      db.collection(`${project}-issues`).deleteOne(inputObj)
        .then(result => {
          if (result.deletedCount > 0) {
            return res.send(`deleted ${inputObj._id}`);
          }
        
          return res.send(`could not delete ${inputObj._id}`);
        })
        .catch(err => {
          console.error(err);
          res.send(`could not delete ${inputObj._id}`);
        });
    });
};