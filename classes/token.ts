import jwt from 'jsonwebtoken';

export default class Token {
    private static seed: string = 'este-es-el-seed-es-secreta';
    private static caducidad: string = '15d';

    constructor() {
    }

    static getJwtToken(payload: any): string { // Corregir la definición de tipo y ubicación de los dos puntos
        return jwt.sign({
            usuario: payload
        }, this.seed, { expiresIn: this.caducidad });
    }

    static comprobarToken(userToken: string) {

        return new Promise((resolve, reject) => {
            jwt.verify(userToken, this.seed, (err, decoded) => {
            if (err) {
                reject();
            } else {
                resolve(decoded)
            }
        })
        })

    
    }
}

