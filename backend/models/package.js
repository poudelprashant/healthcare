import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    active: { type: Boolean, default: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
}, { minimize: false })

const packageModel = mongoose.models.package || mongoose.model("package", packageSchema);
export default packageModel;