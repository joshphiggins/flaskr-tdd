import sqlite3
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash, jsonify, abort
from flask.ext.sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from flask_marshmallow import Marshmallow
import os

basedir = os.path.abspath(os.path.dirname(__file__))

#configuration
DATABASE = 'flaskr.db'
DEBUG = True
SECRET_KEY = 'my_precious'
USERNAME = 'admin'
PASSWORD = 'admin'

DATABASE_PATH = os.path.join(basedir, DATABASE)

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + DATABASE_PATH

csrf = CSRFProtect()

app = Flask(__name__)
csrf.init_app(app)
app.config.from_object(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)

import models




@app.route('/')
def index():
    """Searches the database for entries, then displays them."""
    entries = db.session.query(models.Flaskr)
    return render_template('index.html', entries=entries)

@app.route('/get_entries')
def get_entries():
    flaskr_schema = FlaskrSchema()
    entries = db.session.query(models.Flaskr)
    return jsonify(flaskr_schema.dump(entries).data)

@app.route('/login', methods=['POST'])
def login():
    """User login/authication/session management."""
    error = None

    data = request.get_json()
    print(data)
    username = data['username']
    password = data['password']

    if username == app.config['USERNAME'] and password == app.config['PASSWORD']:
        session['logged_in'] = True
        status = True
        message = 'You were logged in'
    else:
        status = False
        message = 'Incorrect login'
    return jsonify({'result': status, 'message': message})#return error

@app.route('/logout')
def logout():
    """User logout/authentication/session management."""
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('index'))

@app.route('/add', methods=['POST'])
def add_entry():
    """Add new post to database."""
    try:
        if not session.get('logged_in'):
            abort(401)
        data = request.get_json()
        print(data)
        new_entry = models.Flaskr(data['title'], data['text'])
        db.session.add(new_entry)
        db.session.commit()
        status = True
        message = 'New entry was sucessfully posted'
    except Exception as e:
        status = False
        message = repr(e)
    return jsonify({'result': status, 'message': message})

@app.route('/delete/<post_id>', methods=['GET'])
def delete_entry(post_id):
    """Delete post from database"""
    result = {'status':0, 'message': 'Error'}
    try:
        new_id = post_id
        db.session.query(models.Flaskr).filter_by(post_id=new_id).delete()
        db.session.commit()
        result= {'status': 1, 'message':"Post Deleted"}
        flash('The entry was deleted.')
    except Exception as e:
        result = {'status':0, 'message': repr(e)}
    return jsonify(result)

class FlaskrSchema(ma.ModelSchema):
    class Meta:
        model = models.Flaskr

if __name__ == "__main__":
    app.run()

