import Server from './classes/server'
import userRoutes from './routes/usuario';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import postRoutes from './routes/post';
import fileUpload from 'express-fileupload'


const server = new Server();

//Body parser
server.app.use(bodyParser.urlencoded({ extended: true }));
server.app.use(bodyParser.json());

//FileUpload
server.app.use(fileUpload({useTempFiles:true}));

//rutas de la app
server.app.use('/user', userRoutes);
server.app.use('/post', postRoutes);

server.start(() => {
    console.log(`servidor corriendo en puerto ${server.port}`)
});


// URL de conexión a la base de datos
const dbURL = 'mongodb://127.0.0.1:27017/pwaapp';

// Conexión a la base de datos
mongoose.connect(dbURL, { });

// Manejo de eventos de conexión
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a la base de datos:'));
db.once('open', () => {
    console.log('Conexión a la base de datos exitosa');
    
    // Aquí puedes realizar operaciones en la base de datos
});
