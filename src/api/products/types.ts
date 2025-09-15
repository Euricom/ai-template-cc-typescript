import { components } from "../schema";

export type ProductDTO = components["schemas"]["product"];
export type ProductListDTO = components["schemas"]["productList"];
export type ProductCreateDTO = components["schemas"]["productCreate"];
export type ProductUpdateDTO = components["schemas"]["productUpdate"];

export type Product = Omit<ProductDTO, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

export type ProductList = Omit<ProductListDTO, "items"> & {
  items: Product[];
};
