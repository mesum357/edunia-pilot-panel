import { PaymentRequest, RequestStatus } from '@/types';
import { RequestRow } from './RequestRow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RequestListProps {
  requests: PaymentRequest[];
  onShowImage: (images: string[]) => void;
  onShowDetails: (request: PaymentRequest) => void;
  onAccept: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onDelete?: (id: string) => void;
  statusFilter?: RequestStatus;
  onStatusFilterChange?: (status: RequestStatus | 'all') => void;
}

export function RequestList({
  requests,
  onShowImage,
  onShowDetails,
  onAccept,
  onReject,
  onDelete,
  statusFilter,
  onStatusFilterChange,
}: RequestListProps) {
  return (
    <div className="space-y-4">
      {onStatusFilterChange && (
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) => onStatusFilterChange(value as RequestStatus | 'all')}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <Badge variant="outline" className="text-sm">
            {requests.length} {requests.length === 1 ? 'request' : 'requests'}
          </Badge>
        </div>
      )}

      <Card>
        <div className="divide-y divide-border">
          {requests.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No payment requests found</p>
            </div>
          ) : (
            requests.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                onShowImage={onShowImage}
                onShowDetails={onShowDetails}
                onAccept={onAccept}
                onReject={onReject}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
