const router = require("express").Router();
const User = require('../models/User');
const bcrypt = require("bcrypt")

//Register
router.post("/register", async (req, res) => {
    
    try{
        //Hashear la contrasena para que no se vea en la base de datos
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        //Crear nuevo usuario
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            dni: req.body.dni,
            password: hashedPassword,
        });

        //Guardar usuario en la base de datos
        const user = await newUser.save();
        res.status(200).json(user)
    } catch(error){
        res.status(500).json(error)
    }

})

//Login

router.post("/login", async (req, res) => {

    try{
        const user = await User.findOne({email: req.body.email});
        !user && res.status(404).json("user not found");
        
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(400).json("wrong password")
        
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json(error)
    }
    
})

module.exports = router