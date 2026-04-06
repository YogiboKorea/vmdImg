import mongoose, { Schema, model, models } from 'mongoose';

export interface IProduct {
  _id?: mongoose.Types.ObjectId;
  name: string;
  subtitle: string;
  description: string;
  colors: string[]; // ['아쿠아 블루', '올리브그린', ...]
  originalPrice: number;
  salePrice: number;
  discountRate: number;
  thumbnailImage: string; // FTP filename
  colorChipImage: string; // FTP filename
  createdAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
    colors: [{ type: String }],
    originalPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    discountRate: { type: Number, required: true },
    thumbnailImage: { type: String, required: true },
    colorChipImage: { type: String, required: true },
  },
  { timestamps: true }
);

export const Product = models.Product || model<IProduct>('Product', ProductSchema);
