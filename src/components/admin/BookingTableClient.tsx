"use client";

import { useState } from "react";
import { Eye, RefreshCcw } from "lucide-react";
import styles from "@/styles/admin.module.css";
import Modal from "@/components/ui/Modal";
import { formatPrice, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function BookingTableClient({ bookings }: { bookings: any[] }) {
  const router = useRouter();
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState("ALL");

  const openModal = (booking: any) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedBooking) return;
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedBooking) return;
    if (!confirm("Are you sure you want to issue a full refund?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/refund/${selectedBooking.id}`, {
        method: "POST",
      });

      if (res.ok) {
        alert("Refund initiated successfully!");
        setIsModalOpen(false);
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Failed to refund: ${error.error}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = statusFilter === "ALL" 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Booking Management</h1>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#ffffff", color: "#0f172a", border: "1px solid rgba(0,0,0,0.1)" }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID / Code</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Dates</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id}>
                <td style={{ fontFamily: "monospace" }}>{b.confirmationCode}</td>
                <td>
                  <div>{b.user.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{b.user.email}</div>
                </td>
                <td>{b.vehicle.make} {b.vehicle.model}</td>
                <td>
                  <div>{formatDate(b.pickupDate)}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>to {formatDate(b.dropoffDate)}</div>
                </td>
                <td style={{ fontWeight: 500 }}>{formatPrice(b.totalPrice)}</td>
                <td>
                  <span className={`${styles.badge} ${
                    b.status === "CONFIRMED" || b.status === "COMPLETED" ? styles.badgeSuccess :
                    b.status === "PENDING" ? styles.badgeWarning :
                    b.status === "CANCELLED" ? styles.badgeDanger : styles.badgeInfo
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => openModal(b)}
                    style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '4px' }}
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Booking ${selectedBooking?.confirmationCode}`}>
        {selectedBooking && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <h4 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '4px' }}>Customer Details</h4>
                <p style={{ margin: 0, fontWeight: 500 }}>{selectedBooking.user.name}</p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1' }}>{selectedBooking.user.email}</p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1' }}>{selectedBooking.user.phone || "No phone provided"}</p>
              </div>
              <div>
                <h4 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '4px' }}>Vehicle Details</h4>
                <p style={{ margin: 0, fontWeight: 500 }}>{selectedBooking.vehicle.make} {selectedBooking.vehicle.model}</p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1' }}>{selectedBooking.vehicle.year} • {selectedBooking.vehicle.type}</p>
              </div>
              <div>
                <h4 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '4px' }}>Dates & Locations</h4>
                <p style={{ margin: 0, fontSize: '0.875rem' }}><strong>Pickup:</strong> {formatDate(selectedBooking.pickupDate)} at {selectedBooking.pickupLocation.name}</p>
                <p style={{ margin: 0, fontSize: '0.875rem' }}><strong>Dropoff:</strong> {formatDate(selectedBooking.dropoffDate)} at {selectedBooking.dropoffLocation.name}</p>
              </div>
              <div>
                <h4 style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '4px' }}>Financials</h4>
                <p style={{ margin: 0, fontSize: '0.875rem' }}><strong>Total:</strong> {formatPrice(selectedBooking.totalPrice)}</p>
                <p style={{ margin: 0, fontSize: '0.875rem' }}><strong>Tax:</strong> {formatPrice(selectedBooking.taxAmount)}</p>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  <strong>Payment:</strong> {selectedBooking.payment ? selectedBooking.payment.status : "No record"}
                </p>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <h4 style={{ width: "100%", margin: "0 0 12px 0", color: "#0f172a" }}>Update Status</h4>
              
              {selectedBooking.status === "PENDING" && (
                <>
                  <button className={styles.btnPrimary} onClick={() => handleStatusChange("CONFIRMED")} disabled={isLoading}>Mark Confirmed</button>
                  <button className={styles.btnSecondary} onClick={() => handleStatusChange("CANCELLED")} disabled={isLoading}>Cancel Booking</button>
                </>
              )}
              {selectedBooking.status === "CONFIRMED" && (
                <>
                  <button className={styles.btnPrimary} onClick={() => handleStatusChange("ACTIVE")} disabled={isLoading}>Mark Active (Picked Up)</button>
                  <button className={styles.btnSecondary} onClick={() => handleStatusChange("CANCELLED")} disabled={isLoading}>Cancel Booking</button>
                </>
              )}
              {selectedBooking.status === "ACTIVE" && (
                <button className={styles.btnPrimary} onClick={() => handleStatusChange("COMPLETED")} disabled={isLoading}>Mark Completed (Dropped Off)</button>
              )}
              
              {selectedBooking.status === "CANCELLED" && selectedBooking.payment?.status === "SUCCEEDED" && (
                <button 
                   className={styles.btnSecondary} 
                   style={{ borderColor: "#ef4444", color: "#ef4444" }} 
                   onClick={handleRefund} 
                   disabled={isLoading}
                >
                  <RefreshCcw size={16} /> Issue Full Refund
                </button>
              )}
              
              {selectedBooking.status === "COMPLETED" && (
                 <p style={{ margin: 0, color: "#10b981", fontSize: "0.875rem" }}>This booking is completed and closed.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
