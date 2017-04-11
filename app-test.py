import unittest
import os
import json

from flask_testing import TestCase

from app import app, db

TEST_DB = 'test.db'


class BaseTestCase(TestCase):
    def create_app(self):
        basedir = os.path.abspath(os.path.dirname(__file__))
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
            os.path.join(basedir, TEST_DB)
        app.config['WTF_CSRF_ENABLED'] = False
        return app

    def setUp(self):
        db.create_all()
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

class TestConfig(BaseTestCase):

    def test_config(self):
        self.assertTrue(app.config['DEBUG'] is True)
        self.assertFalse(app.config['SECRET_KEY'] is 'my_precious')
        self.assertTrue(
            app.config['SQLALCHEMY_DATABASE_URI'] == 'sqlite:////Users/joshhiggins/Projects/flaskr-tdd/test.db'
            )


def login_user(self, username, password):
    return self.client.post(
        '/login',
        data=json.dumps(dict(
            username=username,
            password=password)),
        content_type='application/json')



class TestAuth(BaseTestCase):

    def test_valid_login_logout(self):

        with self.client:
            #test valid login
            response = login_user(self, 'admin', 'admin')
            self.assertEqual(response.status_code,200)
            data = json.loads(response.data.decode())
            self.assertTrue(data['result'] is True)
            self.assertTrue(data['message'] == 'You were logged in')

            #test valid logout
            logout_resp = self.client.post('/logout')
            data = json.loads(logout_resp.data.decode())
            self.assertEqual(response.status_code,200)
            self.assertTrue(data['response'] == 'You were logged out')


    def test_invalid_login(self):
        #test invalid login
        with self.client:
            response = login_user(self, 'adminx', 'admin')
            self.assertEqual(response.status_code,200)
            data = json.loads(response.data.decode())
            self.assertTrue(data['result'] is False)
            self.assertTrue(data['message'] == 'Incorrect login')

    def test_message(self):
        login_user(self, 'admin', 'admin')

        response = self.client.post('/add',
            data=json.dumps(dict(
                title='test_title',
                text='test_text')),
            content_type='application/json')
        self.assertEqual(response.status_code,200)
        data = json.loads(response.data.decode())
        self.assertTrue(data['result'] is True)
        self.assertTrue(data['message'] == 'New entry was sucessfully posted')


    def test_delete_message(self):
        response = self.client.get('/delete/1')
        self.assertEqual(response.status_code,200)
        data = json.loads(response.data.decode('utf-8'))
        self.assertEqual(data['status'], 1)

if __name__ == '__main__':
    unittest.main()