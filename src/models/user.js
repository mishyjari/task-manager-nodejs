const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task.js');
const jwtSecret = process.env.JWT_SECRET;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number, 
        default: 0,
        validate(val) {
            if ( val < 0 ) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(val) {
            if ( !validator.isEmail(val) ) {
                throw new Error('Invalid email')
            }
        }
    },
    password: {
        type: String,
        required: true, 
        trim: true,
        validate( val ) {
            if ( val.length <= 6 ) {
                throw new Error('Password must be 7 or more characters')
            }
            if ( val.toLowerCase().includes('password') ) {
                throw new Error('Password may not contain the string \'password\'.')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

// Virtual for user's tasks
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'userId'
});

// Get public profile
userSchema.methods.toJSON = function() {
    const userObj = this.toObject();

    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;

    return userObj;
}

// Generate jwt token for user login
userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({ _id: this._id.toString() }, jwtSecret);

    this.tokens = this.tokens.concat({token});
    await this.save();

    return token;
};

// Authenticate user login
userSchema.statics.findByCredentials = async ( email, password ) => {
    const user = await User.findOne({ email })
    if ( !user ) { throw new Error('Invalid Credentials.') }

    const isMatch = await bcrypt.compare(password, user.password)
    if ( !isMatch ) { throw new Error('Invalid Credentials.') }

    return user;
};

// Hash plain-text password with bcrypt
userSchema.pre('save', async function(next) {
    if ( this.isModified('password') ) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next();
});

// Cascade delete users task on user deletion
userSchema.pre('remove', async function(next){
    await Task.deleteMany({ userId: this._id })
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;