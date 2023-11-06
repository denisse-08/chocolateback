import { FileUpload } from "../interfaces/file-upload";
import path from "path";
import fs from "fs";
import uniqid from "uniqid";
export default class FileSystem {
  constructor() { }

  guardarImagenTemporal(file: FileUpload, userId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      //crear carpetas
      const path = this.crearCarpetaUsuario(userId);
      //crear nombre archivo
      const nombreArchivo = this.generarNombreUnico(file.name);
      //mover el archivo del Temp a la carpeta
      file.mv(`${path}/${nombreArchivo}`, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private generarNombreUnico(nombreOriginal: string) {
    // 6.copy.jpg
    const nombreArr = nombreOriginal.split(".");
    const extension = nombreArr[nombreArr.length - 1];

    const idUnico = uniqid();

    return `${idUnico}.${extension}`;
  }

  private crearCarpetaUsuario(userId: string) {
    const pathUser = path.resolve(__dirname, "../uploads", userId);
    const pathUserTemp = pathUser + "/temp";
    console.log(pathUser);
    const existe = fs.existsSync(pathUser);

    if (!existe) {
      fs.mkdirSync(pathUser);
      fs.mkdirSync(pathUserTemp);
    }

    return pathUserTemp;
  }

  public imagenesDeTempHaciaPost(userId: string) {
    const pathTemp = path.resolve(__dirname, "../uploads", userId, 'temp');
    const pathPost = path.resolve(__dirname, "../uploads", userId, 'post');
    if (!fs.existsSync(pathTemp)) {
      return []
    }else if (!fs.existsSync(pathPost)) {
      fs.mkdirSync(pathPost)
    } 
    const imagenesTemp = this.obtenerImagenesEnTemp(userId)

    imagenesTemp.forEach(imagen => {
      fs.renameSync(`${pathTemp}/${imagen}`,`${pathPost}/${imagen}`,)
    })
  }

  private obtenerImagenesEnTemp(userId: string) {
    const pathTemp = path.resolve(__dirname, "../uploads", userId, 'temp');
    return fs.readdirSync(pathTemp) || []

  }
}
