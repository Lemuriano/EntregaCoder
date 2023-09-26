import { Router } from 'express';
import {isValidPassword, generateJWToken, createHash} from '../util.js';
//Service import
import StudentService from '../services/db/students.service.js';

const router = Router();
const studentService = new StudentService();

router.post("/login", async (req, res)=>{
    const {email, password} = req.body;
    try {
        const user = await studentService.findByUsername(email);
        console.log("Usuario encontrado para login:");
        if (!user) {
            console.warn("User doesn't exists with username: " + email);
            return res.status(400).send({error: "Not found", message: "Usuario no encontrado con username: " + email});
        }
        if (!isValidPassword(user, password)) {
            console.warn("Invalid credentials for user: " + email);
            return res.status(401).send({status:"error",error:"El usuario y la contraseña no coinciden!"});
        }
        
        const tokenUser= {
            name : `${user.name} ${user.lastName}`,
            email: user.email,
            age: user.age,
            role: user.role
        }

        const access_token = generateJWToken(tokenUser);
        console.log(access_token);
        res.cookie('jwtCookieToken', access_token, {
            maxAge: 90000,
            httpOnly: true
        })

        return res.send({message: "Login successful!"})
    } catch (error) {
        console.error(error);
        return res.status(500).send({status:"error",error:"Error interno de la applicacion."});
    }
});

//TODO: agregar metodo de registrar estudiante:
router.post("/register", async (req, res)=>{
    const {name, lastName, email, age, password} = req.body;
    try {
        if(!name || !lastName || !email || !age || !password){
            return res.status(401).send({status:"error",error:"Parametros de usuario incompletos"})
        }
        const userExist = await studentService.findByUsername(email);
        
        if(userExist){
            return res.status(401).send({status:"error",error:"Usuario ya existe"})
        }

        const newUser = {
            name : name,
            lastName : lastName,
            email : email,
            age : age,
            password : createHash(password),
        }

        const result = await studentService.save(newUser)
        return res.status(201).send({messaje: 'Nuevo Usuario Creado', payload:result})

    } catch (error) {
        console.error(error);
        return res.status(500).send({status:"error",error:"Error interno de la applicacion."});
    }
});

export default router;