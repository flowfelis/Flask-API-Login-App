from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, login_user, login_required, logout_user, UserMixin, current_user

app = Flask(__name__)

app.config['SECRET_KEY'] = '83j%nJZ9GK=eb-UWz]'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///api.db'

db = SQLAlchemy(app)


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    password = db.Column(db.String(80))
    admin = db.Column(db.Boolean)


# Flask-login stuff
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "/login"
login_manager.login_message = u"Please login in order to have access"


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Frontend Routes Start
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/register')
# @login_required
def register():
    return render_template('register.html')


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/secret')
@login_required
def secret():
    return render_template('secret.html')
# Frontend Routes End


# API Routes Start
@app.route('/log_user', methods=['POST'])
def log_user():
    data = request.get_json(force=True)
    user = User.query.filter_by(name=data['name']).first()

    # Validate user exists
    if user is None:
        return jsonify(msg='Username/password is wrong')

    # Validate password
    if not check_password_hash(user.password, data['password']):
        return jsonify(msg='Username/Password is wrong')

    # Login user
    login_user(user)
    return jsonify(msg='Login Successful', admin=user.admin)


@app.route('/user', methods=['POST'])
def create_user():
    data = request.get_json(force=True)
    hashed_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(name=data['name'], password=hashed_password, admin=data['admin'])

    db.session.add(new_user)
    db.session.commit()

    return jsonify('New User Created')


@app.route('/users', methods=['GET'])
def get_all_users():
    users = User.query.all()
    current_user_id = current_user.get_id()

    try:
        is_admin = User.query.filter_by(id=current_user_id).first().admin
    except:
        is_admin = False

    output = []

    for user in users:
        user_dict = {
            'id': user.id,
            'name': user.name,
            'password': user.password,
            'admin': user.admin
        }
        output.append(user_dict)

    return jsonify(users=output, is_admin=is_admin)


@app.route('/assign_roles', methods=['POST'])
def assign_roles():
    data = request.get_json(force=True)

    for user_dict in data:
        user = User.query.filter_by(id=user_dict['id']).first()
        user.admin = user_dict['is_admin']
        db.session.commit()

    return jsonify('Assigned Roles Successfully')


@app.route('/logout')
def logout():
        logout_user()
        return jsonify('Successfully Logged Out')

# API Routes End


if __name__ == '__main__':
    app.run()
