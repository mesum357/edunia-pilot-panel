import { PaymentRequest } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toAbsoluteUrl } from '@/lib/api';

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

  // Normalize image URLs to ensure Cloudinary URLs are used
  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    
    // If already a Cloudinary URL or absolute URL, use it directly
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it contains Cloudinary domain but missing protocol
    if (url.includes('res.cloudinary.com') || url.includes('cloudinary.com')) {
      return url.startsWith('//') ? `https:${url}` : `https://${url}`;
    }
    
    // For local files, convert to absolute URL (fallback for old uploads)
    const path = url.includes('/') ? url : `/uploads/${url}`;
    return toAbsoluteUrl(path) || url;
  };

  const normalizedImages = request.images.map(normalizeImageUrl).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Request Details</span>
            <Badge variant="outline" className={statusColors[request.status]}>
              {request.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            View and manage payment request details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto pr-1">
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

            {request.agentId && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Agent ID</span>
                </div>
                <p className="text-foreground font-mono text-sm">{request.agentId}</p>
              </div>
            )}

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
          {normalizedImages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Attached Documents</h4>
              <div className="grid grid-cols-3 gap-2">
                {normalizedImages.map((image, index) => (
                  <div key={index} className="relative w-full h-24 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image}
                      alt={`Document ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onShowImage(normalizedImages)}
                      onError={(e) => {
                        // If image fails to load, hide it and show placeholder
                        const target = e.target as HTMLImageElement;
                        const container = target.parentElement;
                        if (container) {
                          target.style.display = 'none';
                          if (!container.querySelector('.image-placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'image-placeholder w-full h-full flex items-center justify-center text-xs text-muted-foreground';
                            placeholder.textContent = 'Image unavailable';
                            container.appendChild(placeholder);
                          }
                        }
                        console.warn('Image failed to load:', target.src);
                      }}
                    />
                  </div>
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
