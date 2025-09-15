import { Product, ProductDTO, ProductListDTO } from "./types";
import { ApiInstance } from "@/hooks/useApiInstance";

// Test API
// https://euricom-test-api-v2.herokuapp.com/docs
// https://euricom-test-api-v2.herokuapp.com/openapi

const productMapper = (product: ProductDTO): Product => {
  return {
    ...product,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  };
};

export const getProduct = async (
  api: ApiInstance,
  id: string
): Promise<Product> => {
  const data = await api.get<ProductDTO>(`/api/v1/products/${id}`);
  return productMapper(data);
};

export interface GetProductsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  filter?: string;
}

export const getProducts = async (
  api: ApiInstance,
  params: GetProductsParams = {}
): Promise<Product[]> => {
  const { page, pageSize, sortBy, filter } = params;
  const data = await api.get<ProductListDTO>("/api/v1/products", {
    query: {
      page,
      pageSize,
      sortBy,
      filter,
    },
  });
  return data.items.map(productMapper);
};
