"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./classes/server"));
const usuario_1 = __importDefault(require("./routes/usuario"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const post_1 = __importDefault(require("./routes/post"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const server = new server_1.default();
//Body parser
server.app.use(body_parser_1.default.urlencoded({ extended: true }));
server.app.use(body_parser_1.default.json());
//FileUpload
server.app.use((0, express_fileupload_1.default)({ useTempFiles: true }));
//rutas de la app
server.app.use('/user', usuario_1.default);
server.app.use('/post', post_1.default);
server.start(() => {
    console.log(`servidor corriendo en puerto ${server.port}`);
});
// URL de conexión a la base de datos
const dbURL = 'mongodb://127.0.0.1:27017/pwaapp';
// Conexión a la base de datos
mongoose_1.default.connect(dbURL, {});
// Manejo de eventos de conexión
const db = mongoose_1.default.connection;
db.on('error', console.error.bind(console, 'Error de conexión a la base de datos:'));
db.once('open', () => {
    console.log('Conexión a la base de datos exitosa');
    // Aquí puedes realizar operaciones en la base de datos
});
