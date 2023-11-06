import { Schema, model, Document} from 'mongoose'
import bcrypt from 'bcrypt';

const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    apellidop: {
        type: String,
        required: [true, 'El apellido paterno es necesario']
    },
    apellidom: {
        type: String,
        required: [true, 'El apellido materno es necesario']
    },
    avatar: {
        type: String,
        default: 'av-1.png'
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contrasena es necesaria']
    }
});

usuarioSchema.method('compararPass', function (password:string=''): boolean {
    if (bcrypt.compareSync(password, this.password)) {
        return true;
    } else {
        return false;
    }
})

interface IUsuario extends Document{
    nombre: string,
    apellidop: string,
    apellidom:string,
    email: string,
    password: string,
    avatar: string
    
    compararPass(password: string): boolean;

}
export const Usuario = model<IUsuario>('Usuario', usuarioSchema);