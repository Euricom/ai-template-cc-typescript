import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/products/products";
import { Card } from "@/components/ui/card";
import { Product } from "@/api/products/types";
import { toast } from "sonner";
import { useEffect } from "react";
import { useApiInstance } from "@/hooks/useApiInstance";

export default function Page() {
  // get product data
  const api = useApiInstance();
  const { data: products = [], error } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => getProducts(api),
  });

  // handle fetch error
  useEffect(() => {
    if (error) {
      toast.error(`Something went wrong: ${error.message}`);
    }
  }, [error]);

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Product Page</PageHeaderHeading>
      </PageHeader>
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.title}</TableCell>
                <TableCell>€{product.price.toFixed(2)}</TableCell>
                <TableCell>
                  {product.basePrice ? `€${product.basePrice.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell>{product.stocked ? "Yes" : "No"}</TableCell>
                <TableCell>{product.createdAt.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
