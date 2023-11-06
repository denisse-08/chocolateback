import { Router,Request,Response } from 'express';
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import Token from '../classes/token';
import { verificaToken } from '../middlewares/autenticacion';
const userRoutes = Router();
//login
userRoutes.post('/login', async (req: Request, res: Response) => {
    const body = req.body;

    try {
        const userDB = await Usuario.findOne({ email: body.email }).exec();
        if (!userDB) {
            return res.json({
                ok: false,
                mensaje: 'Usuario o contraseña son incorrectos'
            });
        }

        if (await userDB.compararPass(body.password)) {
            
            const tokenUser = Token.getJwtToken({
                _id: userDB._id,
                nombre: userDB.nombre,
                apellidop:userDB.apellidop,
                apellidom: userDB.apellidom,
                email: userDB.email,
                avatar:userDB.avatar
            })
            
            res.json({
                ok: true,
                token: tokenUser
            });
        } else {
            return res.json({
                ok: false,
                mensaje: 'Usuario/contraseña no son correctos'
            });
        }
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la búsqueda de usuario',
            errors: error
        });
    }
});

//crear usuario
userRoutes.post('/create', (req: Request, res: Response) => {
    
    const user = {
        nombre: req.body.nombre,
        apellidop: req.body.apellidop,
        apellidom: req.body.apellidom,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password,10),
        avatar: req.body.avatar
    }
    
    Usuario.create(user).then(userDB => {
        const tokenUser = Token.getJwtToken({
                _id: userDB._id,
                nombre: userDB.nombre,
                apellidop:userDB.apellidop,
                apellidom: userDB.apellidom,
                email: userDB.email,
                avatar:userDB.avatar
            })
            
            res.json({
                ok: true,
                token: tokenUser
            });
    }).catch(err => {
        res.json({
            ok: false,
            err
        })
    })
});


// Actualizar usuario
userRoutes.post('/update', verificaToken, async (req: any, res: Response) => {
    const userId = req.usuario._id; // Obtenemos el ID del usuario autenticado

    // Datos del usuario a actualizar (se pueden incluir los campos que desees actualizar)
    const usuario = {
        nombre: req.body.nombre,
        apellidop: req.body.apellidop,
        apellidom: req.body.apellidom,
        avatar: req.body.avatar,
    };

    try {
        const user = await Usuario.findByIdAndUpdate(userId, usuario, { new: true });

        if (!user) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado',
            });
        }

        const tokenUser = Token.getJwtToken({
            _id: user._id,
            nombre: user.nombre,
            apellidop: user.apellidop,
            apellidom: user.apellidom,
            email: user.email,
            avatar: user.avatar,
        });

        res.json({
            ok: true,
            token: tokenUser,
            usuario: user,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la actualización de usuario',
            errors: error,
        });
    }
});

export default userRoutes;

