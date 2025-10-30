import { PaymentRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RequestRowProps {
  request: PaymentRequest;
  onShowImage: (images: string[]) => void;
  onShowDetails: (request: PaymentRequest) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  accepted: 'bg-accent/10 text-accent border-accent/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function RequestRow({ request, onShowImage, onShowDetails, onAccept, onReject }: RequestRowProps) {
  return (
    <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onShowDetails(request)}>
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <img
          src={request.owner.avatar}
          alt={request.ownerName}
          className="w-12 h-12 rounded-full bg-muted flex-shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">{request.resourceName}</h3>
              <p className="text-sm text-muted-foreground truncate">{request.ownerName}</p>
            </div>
            <Badge variant="outline" className={statusColors[request.status]}>
              {request.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {request.currency} {request.amount.toLocaleString()}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Actions */}
        {request.status === 'pending' && (
          <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onShowImage(request.images);
              }}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Picture
            </Button>
            <Button
              size="sm"
              variant="default"
              className="bg-accent hover:bg-accent/90"
              onClick={(e) => {
                e.stopPropagation();
                onAccept(request.id);
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onReject(request.id);
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
