"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuario_model_1 = require("../models/usuario.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = __importDefault(require("../classes/token"));
const autenticacion_1 = require("../middlewares/autenticacion");
const userRoutes = (0, express_1.Router)();
//login
userRoutes.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const userDB = yield usuario_model_1.Usuario.findOne({ email: body.email }).exec();
        if (!userDB) {
            return res.json({
                ok: false,
                mensaje: 'Usuario o contraseña son incorrectos'
            });
        }
        if (yield userDB.compararPass(body.password)) {
            const tokenUser = token_1.default.getJwtToken({
                _id: userDB._id,
                nombre: userDB.nombre,
                apellidop: userDB.apellidop,
                apellidom: userDB.apellidom,
                email: userDB.email,
                avatar: userDB.avatar
            });
            res.json({
                ok: true,
                token: tokenUser
            });
        }
        else {
            return res.json({
                ok: false,
                mensaje: 'Usuario/contraseña no son correctos'
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la búsqueda de usuario',
            errors: error
        });
    }
}));
//crear usuario
userRoutes.post('/create', (req, res) => {
    const user = {
        nombre: req.body.nombre,
        apellidop: req.body.apellidop,
        apellidom: req.body.apellidom,
        email: req.body.email,
        password: bcrypt_1.default.hashSync(req.body.password, 10),
        avatar: req.body.avatar
    };
    usuario_model_1.Usuario.create(user).then(userDB => {
        const tokenUser = token_1.default.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            apellidop: userDB.apellidop,
            apellidom: userDB.apellidom,
            email: userDB.email,
            avatar: userDB.avatar
        });
        res.json({
            ok: true,
            token: tokenUser
        });
    }).catch(err => {
        res.json({
            ok: false,
            err
        });
    });
});
// Actualizar usuario
userRoutes.post('/update', autenticacion_1.verificaToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.usuario._id; // Obtenemos el ID del usuario autenticado
    // Datos del usuario a actualizar (se pueden incluir los campos que desees actualizar)
    const usuario = {
        nombre: req.body.nombre,
        apellidop: req.body.apellidop,
        apellidom: req.body.apellidom,
        avatar: req.body.avatar,
    };
    try {
        const user = yield usuario_model_1.Usuario.findByIdAndUpdate(userId, usuario, { new: true });
        if (!user) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Usuario no encontrado',
            });
        }
        const tokenUser = token_1.default.getJwtToken({
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
    }
    catch (error) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error en la actualización de usuario',
            errors: error,
        });
    }
}));
exports.default = userRoutes;
