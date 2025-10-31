import { Header } from '@/components/Layout/Header';
import { RequestList } from '@/components/shared/RequestList';
import { RequestModal } from '@/components/shared/RequestModal';
import { ImageModal } from '@/components/shared/ImageModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useRequests } from '@/hooks/useRequests';
import { useState } from 'react';
import { PaymentRequest } from '@/types';

export default function Hospitals() {
  const { requests, statusFilter, setStatusFilter, acceptRequest, rejectRequest, setSearchQuery, page, pages, setPage } = useRequests('hospital');
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'accept' | 'reject';
    requestId: string;
  }>({ open: false, type: 'accept', requestId: '' });

  const handleShowImage = (images: string[]) => {
    setCurrentImages(images);
    setImageModalOpen(true);
  };

  const handleShowDetails = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleAccept = (id: string) => {
    setConfirmDialog({ open: true, type: 'accept', requestId: id });
  };

  const handleReject = (id: string) => {
    setConfirmDialog({ open: true, type: 'reject', requestId: id });
  };

  const handleConfirm = (reason?: string) => {
    if (confirmDialog.type === 'accept') {
      acceptRequest(confirmDialog.requestId);
    } else {
      rejectRequest(confirmDialog.requestId, reason);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Hospital Payment Requests" onSearch={setSearchQuery} />
      
      <main className="flex-1 p-6">
        <RequestList
          requests={requests}
          onShowImage={handleShowImage}
          onShowDetails={handleShowDetails}
          onAccept={handleAccept}
          onReject={handleReject}
          statusFilter={statusFilter === 'all' ? undefined : statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">Page {page} / {pages}</span>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page >= pages}
            >
              Next
            </button>
          </div>
        </div>
      </main>

      <RequestModal
        request={selectedRequest}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAccept={handleAccept}
        onReject={handleReject}
        onShowImage={handleShowImage}
      />

      <ImageModal images={currentImages} open={imageModalOpen} onOpenChange={setImageModalOpen} />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.type === 'accept' ? 'Accept Request' : 'Reject Request'}
        description={
          confirmDialog.type === 'accept'
            ? 'Are you sure you want to accept this payment request? This action will mark it as approved.'
            : 'Are you sure you want to reject this payment request?'
        }
        confirmText={confirmDialog.type === 'accept' ? 'Accept' : 'Reject'}
        destructive={confirmDialog.type === 'reject'}
        requireReason={confirmDialog.type === 'reject'}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
