import sqlite3
from flask import Flask, request, session, g, redirect, url_for, \
    abort, render_template, flash, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
import os 

basedir = os.path.abspath(os.path.dirname(__file__))

#configuration
DATABASE = 'flaskr.db'
DEBUG = True
SECRET_KEY = 'my_precious'
USERNAME = 'admin'
PASSWORD = 'admin'

DATABASE_PATH = os.path.join(basedir, DATABASE)

SQLALCHEMY_DATABASE_URL = 'sqlite:///' + DATABASE_PATH


app = Flask(__name__)
app.config.from_object(__name__)
db = SQLAlchemy(app)

import models 

@app.route('/')
def index():
    """Searches the database for entries, then displays them."""
    db = get_db()
    cur = db.execute('select * from entries order by id desc')
    entries = cur.fetchall()
    return render_template('index.html', entries=entries)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login/authication/session management."""
    error = None
    if request.method == 'POST':
        if request.form['username'] != app.config['USERNAME']:
            error = 'Invalid username'
        elif request.form['password'] != app.config['PASSWORD']:
            error = 'Invalid password'
        else:
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('index'))
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    """User logout/authentication/session management."""
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('index'))

@app.route('/add', methods=['POST'])
def add_entry():
    """Add new post to database."""
    if not session.get('logged_in'):
        abort(401)
    db = get_db()
    db.execute(
        'insert into entries (title, text) values(?, ?)',
        [request.form['title'], request.form['text']]
    )
    db.commit()
    flash('New entry was sucessfully posted')
    return redirect(url_for('index'))

@app.route('/delete/<post_id>', methods=['GET'])
def delete_entry(post_id):
    """Delete post from database"""
    result = {'status':0, 'message': 'Error'}
    try:
        db = get_db()
        db.execute('delete from entries where id=' + post_id)
        db.commit()
        result= {'status': 1, 'message':"Post Deleted"}
    except Exception as e:
        result = {'status':0, 'message': repr(e)}

    return jsonify(result)

if __name__ == "__main__":
    init_db()
    app.run()

