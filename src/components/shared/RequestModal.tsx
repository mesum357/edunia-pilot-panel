import { PaymentRequest } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RequestModalProps {
  request: PaymentRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onShowImage: (images: string[]) => void;
}

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  accepted: 'bg-accent/10 text-accent border-accent/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const typeLabels = {
  shop: 'Shop',
  hospital: 'Hospital',
  education: 'Educational Institute',
  marketplace: 'Marketplace Product',
};

export function RequestModal({ request, open, onOpenChange, onAccept, onReject, onShowImage }: RequestModalProps) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Request Details</span>
            <Badge variant="outline" className={statusColors[request.status]}>
              {request.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Owner Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <img
              src={request.owner.avatar}
              alt={request.ownerName}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-foreground">{request.ownerName}</h3>
              <p className="text-sm text-muted-foreground">{typeLabels[request.type]}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Resource Name</span>
              </div>
              <p className="text-foreground font-medium">{request.resourceName}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Amount</span>
              </div>
              <p className="text-foreground font-medium">
                {request.currency} {request.amount.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Submitted</span>
              </div>
              <p className="text-foreground">
                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Request ID</span>
              </div>
              <p className="text-foreground font-mono text-sm">{request.id}</p>
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Additional Notes</h4>
              <p className="text-foreground p-4 bg-muted rounded-lg">{request.notes}</p>
            </div>
          )}

          {/* Images */}
          {request.images.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Attached Documents</h4>
              <div className="grid grid-cols-3 gap-2">
                {request.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Document ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onShowImage(request.images)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Admin Action */}
          {request.adminAction && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Admin Action</h4>
              <p className="text-foreground">
                <span className="font-medium capitalize">{request.adminAction.action}</span>
                {' by Admin at '}
                {new Date(request.adminAction.at).toLocaleString()}
              </p>
              {request.adminAction.reason && (
                <p className="text-sm text-muted-foreground">Reason: {request.adminAction.reason}</p>
              )}
            </div>
          )}
        </div>

        {request.status === 'pending' && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onReject(request.id);
                onOpenChange(false);
              }}
            >
              Reject Request
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90"
              onClick={() => {
                onAccept(request.id);
                onOpenChange(false);
              }}
            >
              Accept Request
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
