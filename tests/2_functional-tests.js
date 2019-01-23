/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  
    suite('POST /api/issues/{project} => object with issue data', () => {
      
      test('Every field filled in', (done) => {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
        })
        .end(function(err, res){
          console.log(typeof res.body.created_on);
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          //assert.isNotNull(res.body.created_on);
          //assert.equal(res.body.created_on, res.body.updated_on);
          done();
        });
      });
      
      test('Required fields filled in', (done) => {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Required fields filled in'
          })
          
      });
      
      test('Missing required fields', (done) => {
        
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', () => {
      
      test('No body', (done) => {
        
      });
      
      test('One field to update', (done) => {
        
      });
      
      test('Multiple fields to update', (done) => {
        
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', () => {
      
      test('No filter', (done) => {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', (done) => {
        
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', (done) => {
        
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', () => {
      
      test('No _id', (done) => {
        
      });
      
      test('Valid _id', (done) => {
        
      });
      
    });

});
