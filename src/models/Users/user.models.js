import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    if(this.isModified("password")){
            this.password=await bcrypt.hash(this.password,10);
    }   
})

userSchema.methods.isPassword=async function (password) {
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken=function () {
    return JWT.sign(
        {
            _id:this._id,
            email:this.email,
            fullname:this.fullname,
            username:this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN-EXPRIY
        }
    )
}
userSchema.methods.generateRefreshToken=function () {
       return JWT.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_SECRET
        }
    )
}

export const User = mongoose.model("User", userSchema);