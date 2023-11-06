import { Router,Response } from "express";
import { verificaToken } from "../middlewares/autenticacion";
import { Post } from "../models/post.model";
import { FileUpload } from "../interfaces/file-upload";
import FileSystem from "../classes/file-system";
const postRoutes = Router();

//ontener post paginados
postRoutes.get('/', [verificaToken], async (req: any, res: Response) => {
    const body = req.body;
    body.usuario = req.usuario._id;


    try {
        const postDB = await Post.create(body);

        let pagina = Number(req.query.pagina) || 1;
        let skip = pagina - 1;
        skip = skip * 10;
        // Obtener los últimos 10 posts ordenados por _id descendente
        const posts = await Post.find()
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
    } catch (err) {
        res.json(err);
    }
});



//crear post
postRoutes.post('/', [ verificaToken ], (req: any, res: Response) => {

    const body = req.body;
    body.usuario = req.usuario._id;
    const fileSystem = new FileSystem();
    const imagenes = fileSystem.imagenesDeTempHaciaPost( req.usuario._id );
    body.imgs = imagenes;


    Post.create( body ).then( async postDB => {

        await postDB.populate('usuario', '-password');

        res.json({
            ok: true,
            post: postDB
        });

    }).catch( err => {
        res.json(err)
    });

});


//servicio para subir archivos
import * as fileUpload from 'express-fileupload'; // Asegúrate de importar express-fileupload

postRoutes.post('/upload', [verificaToken], async(req: any, res: Response) => {
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: "No se subió ningún archivo"
        });
    }
    const file: fileUpload.UploadedFile = req.files.image; // Asegúrate de usar 'UploadedFile' para tipar el objeto de archivo

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

    const fileSystem = new FileSystem();

    await fileSystem.guardarImagenTemporal(file, req.usuario._id);

    res.status(200).json({ 
        ok: true,
        file: file.mimetype
    });
});






export default postRoutes;