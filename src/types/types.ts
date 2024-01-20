import { NextFunction, Request, Response } from "express";

export interface NewUserProps {
  _id: string;
  name: string;
  email: string;
  photo: string;
  gender: string;
  dob: Date;
}

export interface NewProductProps {
  name: string;
  category: string;
  stock: number;
  price: number;
}

export interface ProductQuery {
  category?: string;
  sort?: string;
  page?: number;
  price?: number;
  search?: string;
}

export type baseQueryType = {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: {
    $lte: number;
  };
  category?:
    | string
    | {
        $regex: string;
        $options: string;
      };
};

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type CacheProps = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
  userId?: string;
  orderId?: string;
  productId?: string| string[];
};

export type OrderItems = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
};
export type ShippingInfo = {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
};

export interface OrderProps {
  shippingInfo: ShippingInfo;
  user: string;
  subtotal: number;
  tax: number;
  discount: number;
  shippingCharges: number;
  total: number;
  status: string;
  orderItems: OrderItems[];
}
