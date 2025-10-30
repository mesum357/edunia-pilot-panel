import { Header } from '@/components/Layout/Header';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { RequestList } from '@/components/shared/RequestList';
import { RequestModal } from '@/components/shared/RequestModal';
import { ImageModal } from '@/components/shared/ImageModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Store, Hospital, GraduationCap, ShoppingCart, Clock } from 'lucide-react';
import { mockSummary } from '@/lib/mockData';
import { useRequests } from '@/hooks/useRequests';
import { useState } from 'react';
import { PaymentRequest } from '@/types';

export default function Dashboard() {
  const { requests, acceptRequest, rejectRequest, setSearchQuery } = useRequests();
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'accept' | 'reject';
    requestId: string;
  }>({ open: false, type: 'accept', requestId: '' });

  const recentRequests = requests.filter((r) => r.status === 'pending').slice(0, 5);

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
      <Header title="Dashboard" onSearch={setSearchQuery} />
      
      <main className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard
            title="Total Shops"
            value={mockSummary.totalShops}
            icon={Store}
            trend={{ value: 12, isPositive: true }}
          />
          <SummaryCard
            title="Total Hospitals"
            value={mockSummary.totalHospitals}
            icon={Hospital}
            trend={{ value: 8, isPositive: true }}
          />
          <SummaryCard
            title="Institutes"
            value={mockSummary.totalInstitutes}
            icon={GraduationCap}
            trend={{ value: 15, isPositive: true }}
          />
          <SummaryCard
            title="Marketplace"
            value={mockSummary.totalMarketplaceProducts}
            icon={ShoppingCart}
            trend={{ value: 23, isPositive: true }}
          />
          <SummaryCard
            title="Pending Requests"
            value={mockSummary.pendingRequests}
            icon={Clock}
          />
        </div>

        {/* Recent Requests */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Payment Requests</h3>
          <RequestList
            requests={recentRequests}
            onShowImage={handleShowImage}
            onShowDetails={handleShowDetails}
            onAccept={handleAccept}
            onReject={handleReject}
          />
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
