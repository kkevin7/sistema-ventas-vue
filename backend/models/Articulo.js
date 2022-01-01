 import mongoose, {Schema} from 'mongoose';

 const articuloShema = new Schema({
    categoria: { type: Schema.ObjectId, ref: 'categoria' },
    nombre: { type: String, maxlength:64 },
    codigo: { type: String, maxlength: 50, unique: true, required: true },
    descripcion: { type: String, maxlength: 255 },
    precio_venta: { type: Number, required: true },
    stock: { type: Number, default: 1 },
    estado: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
 });

const Articulo = mongoose.model('articulo', articuloShema);
export default Articulo;