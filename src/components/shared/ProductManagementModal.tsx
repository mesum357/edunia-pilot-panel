import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiGet, apiPut, apiDelete } from '@/lib/api';
import { Loader2, Search, Trash2, Snowflake, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Product {
  _id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  country?: string;
  city: string;
  status: 'active' | 'sold' | 'expired';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isFrozen?: boolean;
  owner?: {
    _id: string;
    username?: string;
    email?: string;
    fullName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProductManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductManagementModal({ open, onOpenChange }: ProductManagementModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: string; productName: string }>({
    open: false,
    productId: '',
    productName: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredProducts(
        products.filter(
          (product) =>
            product.title.toLowerCase().includes(query) ||
            product.city.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.condition.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<{ products: Product[] }>('/api/admin/products');
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeze = async (productId: string) => {
    try {
      await apiPut(`/api/admin/product/${productId}/freeze`);
      toast({
        title: 'Success',
        description: 'Product frozen successfully',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error freezing product:', error);
      toast({
        title: 'Error',
        description: 'Failed to freeze product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnfreeze = async (productId: string) => {
    try {
      await apiPut(`/api/admin/product/${productId}/unfreeze`);
      toast({
        title: 'Success',
        description: 'Product unfrozen successfully',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error unfreezing product:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfreeze product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await apiDelete(`/api/admin/product/${deleteDialog.productId}`);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      setDeleteDialog({ open: false, productId: '', productName: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Product Management</DialogTitle>
            <DialogDescription>
              Manage all marketplace products. You can freeze, unfreeze, or remove products from the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by title, city, category, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex-1 overflow-y-auto border rounded-lg">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {searchQuery ? 'No products found matching your search.' : 'No products available.'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">{product.title}</h3>
                            <Badge
                              variant={product.approvalStatus === 'approved' ? 'default' : 'secondary'}
                            >
                              {product.approvalStatus}
                            </Badge>
                            <Badge
                              variant={product.status === 'active' ? 'default' : 'outline'}
                            >
                              {product.status}
                            </Badge>
                            {product.isFrozen && (
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                Frozen
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <span className="font-medium">Price:</span> PKR {product.price.toLocaleString()}
                            </p>
                            <p>
                              <span className="font-medium">Category:</span> {product.category}
                            </p>
                            <p>
                              <span className="font-medium">Condition:</span> {product.condition}
                            </p>
                            <p>
                              <span className="font-medium">Location:</span> {product.city}{product.country && product.country !== 'Pakistan' ? `, ${product.country}` : ''}
                            </p>
                            {product.owner && (
                              <p>
                                <span className="font-medium">Owner:</span>{' '}
                                {product.owner.fullName || product.owner.username || product.owner.email || 'N/A'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {product.isFrozen ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnfreeze(product._id)}
                              className="flex items-center gap-1"
                            >
                              <Unlock className="h-4 w-4" />
                              Unfreeze
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFreeze(product._id)}
                              className="flex items-center gap-1"
                            >
                              <Snowflake className="h-4 w-4" />
                              Freeze
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({ open: true, productId: product._id, productName: product.title })
                            }
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{deleteDialog.productName}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


