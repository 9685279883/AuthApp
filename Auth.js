// const express = require("express");
const bcrypt = require("bcrypt");
const Usermodels = require("../models/Usermodels");
const jwt = require("jsonwebtoken");
const { options } = require("../routes/user");
require("dotenv").config();




//signup route Handler
exports.signup = async (req, res) =>{
    try{
        //get data
        const {name, email, password, role} = req.body;
        //if user alredy exist check
        const existingUser = await Usermodels.findOne({email})

        if(existingUser){
            return res.status(400).json({
                success:false,
                message: "User alredy Exists"
            });
        }
        //paswor secure
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10)//10 round encripts
            
        } catch (err) {
            return res.status(500).json({
                success:false,
                message:'Error in Hasing Password'
            })
        };
        //create entry for user
        const user = await Usermodels.create({
            name,email, password:hashedPassword,role
        })
        return res.status(200).json({
            success:true,
            message:'User created successfully',
        })

    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:'user cannot be registered, please try again later',
        });
    }
}

//login

exports.login = async (req, res) =>{
    try {
        //data fetch 
        const { email, password} = req.body;
        //validation on email and password
        if(!email || !password) {
            return res.status(400).json({
                success:false,
                message:'Please fill all the details carefully',
            });
        }
        //check for registered user
        const user = await Usermodels.findOne({email});
        // if not a registered user
        if(!user){
                        return res.status(401).json({
                            success:false,
                            message:'user is not registered',
                        });
                    }

         const payload = {
            email:user.email,
            id:user._id,
            role:user.role,
         }           
        //   verify password & genrate a JWT token
        if(await bcrypt.compare(password, user.password)){
            //pasword match and create token
            let token = jwt.sign(payload, process.env.JWT_SECRET,{expiresIn:"2h"}, );

            user = user.toObject();
            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date( Date.now() + 3 * 24 * 60* 60 * 1000),
                httpOnly: true,
            }
            res.cookie("akshayCookie", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'User logged in successfully',

            });
            
        }
        else{
            //password do not match
            return res.status(403).json({
                success:false,
                message:"password incorrect"
            });
        }        


    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message: 'Login Failure',
        });
        
    }
}







