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

interface Institute {
  _id: string;
  name: string;
  type: string;
  domain: 'education' | 'healthcare';
  city: string;
  province?: string;
  specialization?: string;
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

interface InstituteManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstituteManagementModal({ open, onOpenChange }: InstituteManagementModalProps) {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [filteredInstitutes, setFilteredInstitutes] = useState<Institute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; instituteId: string; instituteName: string }>({
    open: false,
    instituteId: '',
    instituteName: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchInstitutes();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredInstitutes(institutes);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredInstitutes(
        institutes.filter(
          (institute) =>
            institute.name.toLowerCase().includes(query) ||
            institute.city.toLowerCase().includes(query) ||
            institute.type.toLowerCase().includes(query) ||
            (institute.specialization && institute.specialization.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, institutes]);

  const fetchInstitutes = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<{ institutes: Institute[] }>('/api/admin/institutes');
      setInstitutes(data.institutes || []);
      setFilteredInstitutes(data.institutes || []);
    } catch (error) {
      console.error('Error fetching institutes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch institutes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeze = async (instituteId: string) => {
    try {
      await apiPut(`/api/admin/institute/${instituteId}/freeze`);
      toast({
        title: 'Success',
        description: 'Institute frozen successfully',
      });
      fetchInstitutes();
    } catch (error) {
      console.error('Error freezing institute:', error);
      toast({
        title: 'Error',
        description: 'Failed to freeze institute. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnfreeze = async (instituteId: string) => {
    try {
      await apiPut(`/api/admin/institute/${instituteId}/unfreeze`);
      toast({
        title: 'Success',
        description: 'Institute unfrozen successfully',
      });
      fetchInstitutes();
    } catch (error) {
      console.error('Error unfreezing institute:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfreeze institute. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await apiDelete(`/api/admin/institute/${deleteDialog.instituteId}`);
      toast({
        title: 'Success',
        description: 'Institute deleted successfully',
      });
      setDeleteDialog({ open: false, instituteId: '', instituteName: '' });
      fetchInstitutes();
    } catch (error) {
      console.error('Error deleting institute:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete institute. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Education Management</DialogTitle>
            <DialogDescription>
              Manage all education institutes. You can freeze, unfreeze, or remove institutes from the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search institutes by name, city, type, or specialization..."
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
              ) : filteredInstitutes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {searchQuery ? 'No institutes found matching your search.' : 'No institutes available.'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredInstitutes.map((institute) => (
                    <div key={institute._id} className="p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">{institute.name}</h3>
                            <Badge
                              variant={institute.approvalStatus === 'approved' ? 'default' : 'secondary'}
                            >
                              {institute.approvalStatus}
                            </Badge>
                            {institute.domain === 'healthcare' && (
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                Healthcare
                              </Badge>
                            )}
                            {institute.isFrozen && (
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                Frozen
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <span className="font-medium">Type:</span> {institute.type}
                            </p>
                            <p>
                              <span className="font-medium">City:</span> {institute.city}
                              {institute.province && `, ${institute.province}`}
                            </p>
                            {institute.specialization && (
                              <p>
                                <span className="font-medium">Specialization:</span> {institute.specialization}
                              </p>
                            )}
                            {institute.owner && (
                              <p>
                                <span className="font-medium">Owner:</span>{' '}
                                {institute.owner.fullName || institute.owner.username || institute.owner.email || 'N/A'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {institute.isFrozen ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnfreeze(institute._id)}
                              className="flex items-center gap-1"
                            >
                              <Unlock className="h-4 w-4" />
                              Unfreeze
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFreeze(institute._id)}
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
                              setDeleteDialog({ open: true, instituteId: institute._id, instituteName: institute.name })
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
              This will permanently delete the institute "{deleteDialog.instituteName}". This action cannot be undone.
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

