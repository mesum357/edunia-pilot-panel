import { useState, useMemo } from 'react';
import { PaymentRequest, RequestStatus, RequestType } from '@/types';
import { mockRequests } from '@/lib/mockData';
import { toast } from 'sonner';

export function useRequests(type?: RequestType) {
  const [requests, setRequests] = useState<PaymentRequest[]>(mockRequests);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const acceptRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'accepted' as RequestStatus,
              adminAction: {
                adminId: 'admin-1',
                action: 'accepted' as const,
                at: new Date().toISOString(),
              },
            }
          : req
      )
    );
    toast.success('Request accepted successfully');
  };

  const rejectRequest = (id: string, reason?: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: 'rejected' as RequestStatus,
              adminAction: {
                adminId: 'admin-1',
                action: 'rejected' as const,
                reason,
                at: new Date().toISOString(),
              },
            }
          : req
      )
    );
    toast.success('Request rejected');
  };

  return {
    requests: filteredRequests,
    allRequests: requests,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    acceptRequest,
    rejectRequest,
  };
}
