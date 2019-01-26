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
      const title = 'Title';
      const issueText = 'text';
      const assignedTo = 'Chai and Mocha';
      const statusText = 'In QA';

      test('Every field filled in', (done) => {
        const createdBy = 'Functional Test - Every field filled in';
        
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: title,
            issue_text:  issueText,
            created_by: createdBy,
            assigned_to: assignedTo,
            status_text: statusText
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, title);
            assert.equal(res.body.issue_text, issueText);
            assert.equal(res.body.created_by, createdBy);
            assert.equal(res.body.assigned_to, assignedTo);
            assert.equal(res.body.status_text, statusText);
            assert.isNotNull(res.body.created_on);
            assert.notEqual(new Date(res.body.created_on), 'Invalid Date');
            assert.equal(res.body.created_on, res.body.updated_on);
            done();
        });
      });
      
      test('Required fields filled in', (done) => {
        const createdBy = 'Functional Test - Required fields filled in';
        
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: title,
            issue_text: issueText,
            created_by: createdBy,
            assigned_to: '',
            status_text: ''
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, title);
            assert.equal(res.body.issue_text, issueText);
            assert.equal(res.body.created_by, createdBy);
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            assert.isNotNull(res.body.created_on);
            assert.notEqual(new Date(res.body.created_on), 'Invalid Date');
            assert.equal(res.body.created_on, res.body.updated_on);
            done();
          });
          
      });
      
      test('Missing required fields', (done) => {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: null,
            issue_text: null,
            created_by: null,
            assigned_to: null,
            status_text: null
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing inputs');
            done();
          });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', () => {
      const id = '5c480f66ec89832db0efa882';
      const title = 'Updated Title';
      const issueText = 'Updated text again';
      const assignedTo = 'Still Chai and Mocha';
      const statusText = 'Resolved';
      const open = 'false';
      
      test('No body', (done) => {
        chai.request(server)
          .put('/api/issues/test')
          .send()
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no updated field sent');
            done();
          });
        
      });
      
      test('One field to update', (done) => {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: id,
            issue_text: issueText
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'successfully updated');
            done();
          });
      });
      
      test('Multiple fields to update', (done) => {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: id,
            issue_title: title,
            issue_text: issueText,
            assigned_to: assignedTo, 
            status_text: statusText,
            open
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'successfully updated');
            done();
          });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', () => {
      
      test('No filter', (done) => {
        chai.request(server)
          .get('/api/issues/test')
          .query({})
          .end((err, res) => {
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
        chai.request(server)
          .get('/api/issues/test')
          .query({
            open: 'false'
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.filter(obj => obj.open === true).length, 0);
            done();
          });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', (done) => {
        chai.request(server)
          .get('/api/issues/test')
          .query({
            open: 'true',
            _id: '5c480f8001ae422df954b6c3',
            issue_title: 'Title',
            created_on: '2019-01-23T06:53:52.693Z'
          })
          .end((err, res) => {
            if (err) console.error(err);
            //console.log('response.body: ', res.body[0].open);
            assert.equal(res.status, 200);
            assert.equal(res.body[0].open, true);
            assert.equal(res.body[0]._id, '5c480f8001ae422df954b6c3');
            assert.equal(res.body[0].issue_title, 'Title');
            assert.equal(res.body[0].created_on, '2019-01-23T06:53:52.693Z');
            done();
          });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', () => {
      
      test('No _id', (done) => {
        chai.request(server)
          .delete('/api/issues/test')
          .send({ _id: '' })
          .end((err, res) => {
            if (err) console.error(err);
            assert.equal(res.status, 200);
            assert.equal(res.text, '_id error');
            done();
          });
      });
      
      test('Valid _id', (done) => {
        const input = '5c4812250e71143f8850697a';
        
        chai.request(server)
          .delete('/api/issues/test')
          .send({ _id: input })
          .end((err, res) => {
            if (err) console.error(err);
          
            assert.equal(res.status, 200);
            //assert.equal(res.text, `deleted ${input}`);
            assert.equal(res.text, `could not delete ${input}`);
            done();
          });
      });     
    });
});
