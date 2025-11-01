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
import { Shop } from '@/types';
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

interface ShopManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShopManagementModal({ open, onOpenChange }: ShopManagementModalProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; shopId: string; shopName: string }>({
    open: false,
    shopId: '',
    shopName: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchShops();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredShops(shops);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredShops(
        shops.filter(
          (shop) =>
            shop.shopName.toLowerCase().includes(query) ||
            shop.city.toLowerCase().includes(query) ||
            shop.shopType.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, shops]);

  const fetchShops = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<{ shops: Shop[] }>('/api/admin/shops');
      setShops(data.shops || []);
      setFilteredShops(data.shops || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch shops. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeze = async (shopId: string) => {
    try {
      await apiPut(`/api/admin/shop/${shopId}/freeze`);
      toast({
        title: 'Success',
        description: 'Shop frozen successfully',
      });
      fetchShops();
    } catch (error) {
      console.error('Error freezing shop:', error);
      toast({
        title: 'Error',
        description: 'Failed to freeze shop. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnfreeze = async (shopId: string) => {
    try {
      await apiPut(`/api/admin/shop/${shopId}/unfreeze`);
      toast({
        title: 'Success',
        description: 'Shop unfrozen successfully',
      });
      fetchShops();
    } catch (error) {
      console.error('Error unfreezing shop:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfreeze shop. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await apiDelete(`/api/admin/shop/${deleteDialog.shopId}`);
      toast({
        title: 'Success',
        description: 'Shop deleted successfully',
      });
      setDeleteDialog({ open: false, shopId: '', shopName: '' });
      fetchShops();
    } catch (error) {
      console.error('Error deleting shop:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete shop. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Shop Management</DialogTitle>
            <DialogDescription>
              Manage all shops. You can freeze, unfreeze, or remove shops from the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shops by name, city, or type..."
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
              ) : filteredShops.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {searchQuery ? 'No shops found matching your search.' : 'No shops available.'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredShops.map((shop) => (
                    <div key={shop._id} className="p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">{shop.shopName}</h3>
                            <Badge
                              variant={shop.approvalStatus === 'approved' ? 'default' : 'secondary'}
                            >
                              {shop.approvalStatus}
                            </Badge>
                            {shop.isFrozen && (
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                Frozen
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <span className="font-medium">City:</span> {shop.city}
                            </p>
                            <p>
                              <span className="font-medium">Type:</span> {shop.shopType}
                            </p>
                            {shop.owner && (
                              <p>
                                <span className="font-medium">Owner:</span>{' '}
                                {shop.owner.fullName || shop.owner.username || shop.owner.email || 'N/A'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {shop.isFrozen ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnfreeze(shop._id)}
                              className="flex items-center gap-1"
                            >
                              <Unlock className="h-4 w-4" />
                              Unfreeze
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFreeze(shop._id)}
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
                              setDeleteDialog({ open: true, shopId: shop._id, shopName: shop.shopName })
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
              This will permanently delete the shop "{deleteDialog.shopName}". This action cannot be undone.
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

