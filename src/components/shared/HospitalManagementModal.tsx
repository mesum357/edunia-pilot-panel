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

interface Hospital {
  _id: string;
  name: string;
  type: string;
  country?: string;
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

interface HospitalManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HospitalManagementModal({ open, onOpenChange }: HospitalManagementModalProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; hospitalId: string; hospitalName: string }>({
    open: false,
    hospitalId: '',
    hospitalName: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchHospitals();
    }
  }, [open]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredHospitals(hospitals);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredHospitals(
        hospitals.filter(
          (hospital) =>
            hospital.name.toLowerCase().includes(query) ||
            hospital.city.toLowerCase().includes(query) ||
            hospital.type.toLowerCase().includes(query) ||
            (hospital.specialization && hospital.specialization.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, hospitals]);

  const fetchHospitals = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<{ hospitals: Hospital[] }>('/api/admin/hospitals');
      setHospitals(data.hospitals || []);
      setFilteredHospitals(data.hospitals || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch hospitals. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeze = async (hospitalId: string) => {
    try {
      await apiPut(`/api/admin/hospital/${hospitalId}/freeze`);
      toast({
        title: 'Success',
        description: 'Hospital frozen successfully',
      });
      fetchHospitals();
    } catch (error) {
      console.error('Error freezing hospital:', error);
      toast({
        title: 'Error',
        description: 'Failed to freeze hospital. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnfreeze = async (hospitalId: string) => {
    try {
      await apiPut(`/api/admin/hospital/${hospitalId}/unfreeze`);
      toast({
        title: 'Success',
        description: 'Hospital unfrozen successfully',
      });
      fetchHospitals();
    } catch (error) {
      console.error('Error unfreezing hospital:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfreeze hospital. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await apiDelete(`/api/admin/hospital/${deleteDialog.hospitalId}`);
      toast({
        title: 'Success',
        description: 'Hospital deleted successfully',
      });
      setDeleteDialog({ open: false, hospitalId: '', hospitalName: '' });
      fetchHospitals();
    } catch (error) {
      console.error('Error deleting hospital:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete hospital. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Hospital Management</DialogTitle>
            <DialogDescription>
              Manage all hospitals. You can freeze, unfreeze, or remove hospitals from the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hospitals by name, city, type, or specialization..."
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
              ) : filteredHospitals.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {searchQuery ? 'No hospitals found matching your search.' : 'No hospitals available.'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredHospitals.map((hospital) => (
                    <div key={hospital._id} className="p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">{hospital.name}</h3>
                            <Badge
                              variant={hospital.approvalStatus === 'approved' ? 'default' : 'secondary'}
                            >
                              {hospital.approvalStatus}
                            </Badge>
                            {hospital.isFrozen && (
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                Frozen
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              <span className="font-medium">Type:</span> {hospital.type}
                            </p>
                            <p>
                              <span className="font-medium">Location:</span> {hospital.city}
                              {hospital.province && `, ${hospital.province}`}
                              {hospital.country && hospital.country !== 'Pakistan' && `, ${hospital.country}`}
                            </p>
                            {hospital.specialization && (
                              <p>
                                <span className="font-medium">Specialization:</span> {hospital.specialization}
                              </p>
                            )}
                            {hospital.owner && (
                              <p>
                                <span className="font-medium">Owner:</span>{' '}
                                {hospital.owner.fullName || hospital.owner.username || hospital.owner.email || 'N/A'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {hospital.isFrozen ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnfreeze(hospital._id)}
                              className="flex items-center gap-1"
                            >
                              <Unlock className="h-4 w-4" />
                              Unfreeze
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFreeze(hospital._id)}
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
                              setDeleteDialog({ open: true, hospitalId: hospital._id, hospitalName: hospital.name })
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
              This will permanently delete the hospital "{deleteDialog.hospitalName}". This action cannot be undone.
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

