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
const autenticacion_1 = require("../middlewares/autenticacion");
const post_model_1 = require("../models/post.model");
const file_system_1 = __importDefault(require("../classes/file-system"));
const postRoutes = (0, express_1.Router)();
//ontener post paginados
postRoutes.get('/', [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    body.usuario = req.usuario._id;
    try {
        const postDB = yield post_model_1.Post.create(body);
        let pagina = Number(req.query.pagina) || 1;
        let skip = pagina - 1;
        skip = skip * 10;
        // Obtener los últimos 10 posts ordenados por _id descendente
        const posts = yield post_model_1.Post.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(10)
            .populate('usuario', '-password')
            .exec();
        res.json({
            ok: true,
            pagina,
            posts
        });
    }
    catch (err) {
        res.json(err);
    }
}));
//crear post
postRoutes.post('/', [autenticacion_1.verificaToken], (req, res) => {
    const body = req.body;
    body.usuario = req.usuario._id;
    const fileSystem = new file_system_1.default();
    const imagenes = fileSystem.imagenesDeTempHaciaPost(req.usuario._id);
    body.imgs = imagenes;
    post_model_1.Post.create(body).then((postDB) => __awaiter(void 0, void 0, void 0, function* () {
        yield postDB.populate('usuario', '-password');
        res.json({
            ok: true,
            post: postDB
        });
    })).catch(err => {
        res.json(err);
    });
});
postRoutes.post('/upload', [autenticacion_1.verificaToken], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: "No se subió ningún archivo"
        });
    }
    const file = req.files.image; // Asegúrate de usar 'UploadedFile' para tipar el objeto de archivo
    if (!file) {
        return res.status(400).json({
            ok: false,
            mensaje: "No se subió ningún archivo de imagen"
        });
    }
    if (!file.mimetype.includes('image')) {
        return res.status(400).json({
            ok: false,
            mensaje: "El archivo no es una imagen"
        });
    }
    if (file.size > 2 * 1024 * 1024) { // 8 MB en bytes
        return res.status(400).json({
            ok: false,
            mensaje: "El archivo excede el límite de tamaño (8 MB)"
        });
    }
    const fileSystem = new file_system_1.default();
    yield fileSystem.guardarImagenTemporal(file, req.usuario._id);
    res.status(200).json({
        ok: true,
        file: file.mimetype
    });
}));
exports.default = postRoutes;
