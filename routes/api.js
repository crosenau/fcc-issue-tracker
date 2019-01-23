/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const ObjectId = require('mongodb').ObjectID;

module.exports = function (app, db) {
    
  app.route('/api/issues/:project')
    .get(function (req, res){
      const project = req.params.project;
    
      db.collection(`${project}-issues`).find({}).toArray()
        .then(result => res.json(result))
        .catch(err => console.error('Search Error: ', err));
    })

    .post(function (req, res){
      const project = req.params.project;
      const inputObj = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        open: true,
        status_text: req.body.status_text
      };
    
      db.collection(`${project}-issues`).insertOne(inputObj)
        .then(result => res.json(result.ops[0]))
        .catch(err => console.error(err));

    })

    .put(function (req, res){
      const project = req.params.project;

    })

    .delete(function (req, res){
      const project = req.params.project;

    });
};
