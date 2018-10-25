const request = require('supertest');
let { server, db } = require('../index.js');

describe('Tests Responses', () => {
    before((done) => {
        db.clear();
        done();
    })

    after((done) => {
        server.close();
        db.close();
        done();
    });

    it('[/] Should answer to default route', (done) => {
        request(server)
        .get('/')
        .expect('Content-Type', "text/html; charset=utf-8")
        .expect(200, done);
    });

    it('Should error 404', (done) => {
        request(server)
        .get('/qwertz')
        .expect('Content-Type', "text/html; charset=utf-8")
        .expect(404, done);
    });

    it('[/user/:username] Should answer', (done) => {
        request(server)
          .get('/user/tweb2018')
          .expect('Content-Type', "application/json; charset=utf-8")
          .expect(200, done);
    }).timeout(10000);

    it('[/user/:username] Cache should work', (done) => {
        request(server)
          .get('/user/tweb2018')
          .expect('Content-Type', "application/json; charset=utf-8")
          .expect(200);
          
        request(server)
          .get('/user/tweb2018')
          .expect('Content-Type', "application/json; charset=utf-8")
          .expect(200, done);
    }).timeout(10000);

    it('[/user/:username] Should answer error', (done) => {
        request(server)
          .get('/user/askjhfkjsadhfjadsbvkjfvb')
          .expect('Content-Type', "application/json; charset=utf-8")
          .expect(200, { 
                error : 1,
                "text": "not found"
            }, done);
    }).timeout(10000);

    it('[/repo/:owner/:name] Should answer', (done) => {
        request(server)
          .get('/repo/bouda19/Teaching-TWEB-2018-Labo-01')
          .expect('Content-Type', "application/json; charset=utf-8")
          .expect(200, done);
    }).timeout(10000);
    
    it('[/repo/:owner/:name] Should answer error', (done) => {
        request(server)
          .get('/repo/bouda19/askjhfkjsadhfjadsbvkjfvb/asdsda')
          .expect('Content-Type', "text/html; charset=utf-8")
          .expect(200, { 
                error : 1,
                "text": "not found"
            }, done);
    }).timeout(10000);

    it('[/repo/:name] Should answer', (done) => {
        request(server)
          .get('/repo/Teaching-TWEB-2018-Labo-01')
          .expect('Content-Type', "application/json; charset=utf-8")
          .expect(200, done);
    }).timeout(10000);

    it('[/repo/:name] Should answer error', (done) => {
        request(server)
          .get('/repo/askjhfkjsadhfjadsbvkjfvb')
          .expect('Content-Type', "application/json; charset=utf-8")
          .expect(200, { 
                error : 1,
                "text": "not found"
            }, done);
    }).timeout(10000);
});