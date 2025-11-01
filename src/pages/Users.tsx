import { Header } from '@/components/Layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { useToast } from '@/components/ui/use-toast';
import { apiGet, apiPut, apiDelete } from '@/lib/api';
import { useState, useEffect } from 'react';
import { Search, UserX, Snowflake, RefreshCw, Trash2 } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  verified: boolean;
  isFrozen: boolean;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({ 
    open: false, 
    userId: null 
  });
  const { toast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: '20',
      };
      if (searchQuery) {
        params.search = searchQuery;
      }

      const data = await apiGet<{ users: User[]; totalPages: number; currentPage: number; total: number }>(
        '/api/admin/public/users',
        params
      );

      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (page === 1) {
        loadUsers();
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleFreeze = async (userId: string) => {
    try {
      await apiPut(`/api/admin/user/${userId}/freeze`);
      sonnerToast.success('User frozen successfully');
      loadUsers();
    } catch (error) {
      console.error('Error freezing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to freeze user',
        variant: 'destructive',
      });
    }
  };

  const handleUnfreeze = async (userId: string) => {
    try {
      await apiPut(`/api/admin/user/${userId}/unfreeze`);
      sonnerToast.success('User unfrozen successfully');
      loadUsers();
    } catch (error) {
      console.error('Error unfreezing user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unfreeze user',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.userId) return;
    
    try {
      await apiDelete(`/api/admin/user/${deleteDialog.userId}`);
      sonnerToast.success('User deleted successfully');
      setDeleteDialog({ open: false, userId: null });
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Users" description="Manage user accounts" />
      
      <div className="flex-1 p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users by name, email, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-lg border">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No users found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.fullName || user.username}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.isFrozen && (
                          <Badge variant="destructive">Frozen</Badge>
                        )}
                        {user.verified && !user.isFrozen && (
                          <Badge variant="default">Verified</Badge>
                        )}
                        {!user.verified && !user.isFrozen && (
                          <Badge variant="secondary">Unverified</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.isFrozen ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnfreeze(user._id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Unfreeze
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFreeze(user._id)}
                          >
                            <Snowflake className="h-4 w-4 mr-2" />
                            Freeze
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, userId: user._id })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog({ open, userId: open ? deleteDialog.userId : null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and all associated data.
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
    </div>
  );
}

