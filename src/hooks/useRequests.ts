import { useEffect, useMemo, useState } from 'react';
import { PaymentRequest, RequestStatus, RequestType } from '@/types';
import { toast } from 'sonner';
import { apiGet, apiPut, toAbsoluteUrl } from '@/lib/api';

export function useRequests(type?: RequestType) {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 20;

  // Map UI type to backend entityType
  const mapTypeToEntity = (t?: RequestType): 'shop' | 'hospital' | 'institute' | 'marketplace' | undefined => {
    if (!t) return undefined;
    if (t === 'education') return 'institute';
    return t as any;
  };

  // Load from backend
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const params: Record<string, string> = {} as any;
        const entityType = mapTypeToEntity(type);
        if (entityType) params.entityType = entityType;
        // Map UI status to backend
        if (statusFilter !== 'all') {
          params.status = statusFilter === 'accepted' ? 'verified' : statusFilter;
        }
        params.page = String(page);
        params.limit = String(limit);

        const data = await apiGet<{ paymentRequests: any[]; totalPages?: number; currentPage?: number }>(`/api/admin/payment-requests`, params);
        const mapped: PaymentRequest[] = (data.paymentRequests || []).map((pr: any) => {
          const backendStatus: string = pr.status || 'pending';
          const statusMap: Record<string, RequestStatus> = {
            pending: 'pending',
            verified: 'accepted',
            completed: 'accepted',
            rejected: 'rejected',
          };
          const ownerName: string = pr.user?.fullName || pr.user?.username || 'User';
          const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ownerName)}`;
          // Normalize screenshot URL: support Cloudinary URLs, absolute URLs, and local uploads
          let img: string | null = null;
          if (pr.screenshotFile) {
            if (typeof pr.screenshotFile === 'string' && (pr.screenshotFile.startsWith('http://') || pr.screenshotFile.startsWith('https://'))) {
              img = pr.screenshotFile;
            } else if (typeof pr.screenshotFile === 'string') {
              const path = pr.screenshotFile.includes('/') ? pr.screenshotFile : `/uploads/${pr.screenshotFile}`;
              img = toAbsoluteUrl(path) as string;
            }
          }
          const typeMap: Record<string, RequestType> = {
            shop: 'shop',
            hospital: 'hospital',
            institute: 'education',
            marketplace: 'marketplace',
            product: 'marketplace',
          };
          const resourceName: string = pr.transactionId
            ? `Payment ${pr.transactionId}`
            : `${(pr.entityType || 'payment').toString().charAt(0).toUpperCase()}${(pr.entityType || 'payment')
                .toString()
                .slice(1)} payment`;

          return {
            id: pr._id,
            type: typeMap[pr.entityType] || 'shop',
            resourceId: pr.entityId || '',
            resourceName,
            ownerName,
            ownerId: pr.user?._id || '',
            owner: { id: pr.user?._id || '', name: ownerName, avatar },
            amount: Number(pr.amount ?? pr.totalAmount ?? 0),
            currency: 'PKR',
            status: statusMap[backendStatus] || 'pending',
            images: img ? [img] : [],
            agentId: pr.agentId || null,
            notes: pr.verificationNotes || pr.notes || '',
            createdAt: pr.createdAt,
            updatedAt: pr.updatedAt,
            adminAction: pr.verifiedAt
              ? {
                  adminId: pr.verifiedBy || 'admin',
                  action: backendStatus === 'rejected' ? 'rejected' : 'accepted',
                  reason: pr.verificationNotes,
                  at: pr.verifiedAt,
                }
              : undefined,
          } as PaymentRequest;
        });
        setRequests(mapped);
        setPages(Number(data.totalPages || 1));
        // If backend echoes currentPage, keep in sync; otherwise keep local state
        if (data.currentPage) {
          setPage(Number(data.currentPage));
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load payment requests');
      }
    };

    fetchData();
    return () => controller.abort();
  }, [type, statusFilter, page]);

  // Reset to first page when filters or type change
  useEffect(() => {
    setPage(1);
  }, [type, statusFilter, searchQuery]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesType = !type || request.type === type;
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        request.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [requests, type, statusFilter, searchQuery]);

  const acceptRequest = async (id: string) => {
    try {
      await apiPut(`/api/admin/payment-request/${id}/status`, { status: 'verified' });
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status: 'accepted' as RequestStatus,
                adminAction: {
                  adminId: 'admin',
                  action: 'accepted' as const,
                  at: new Date().toISOString(),
                },
              }
            : req
        )
      );
      toast.success('Request verified');
    } catch (e) {
      console.error(e);
      toast.error('Failed to verify request');
    }
  };

  const rejectRequest = async (id: string, reason?: string) => {
    try {
      await apiPut(`/api/admin/payment-request/${id}/status`, { status: 'rejected', verificationNotes: reason });
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status: 'rejected' as RequestStatus,
                adminAction: {
                  adminId: 'admin',
                  action: 'rejected' as const,
                  reason,
                  at: new Date().toISOString(),
                },
              }
            : req
        )
      );
      toast.success('Request rejected');
    } catch (e) {
      console.error(e);
      toast.error('Failed to reject request');
    }
  };

  return {
    requests: filteredRequests,
    allRequests: requests,
    page,
    pages,
    limit,
    setPage,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    acceptRequest,
    rejectRequest,
  };
}
