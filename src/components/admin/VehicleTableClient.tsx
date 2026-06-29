"use client";

import { useState } from "react";
import { Plus, Edit2, Ban, CheckCircle } from "lucide-react";
import styles from "@/styles/admin.module.css";
import Modal from "@/components/ui/Modal";
import modalStyles from "@/styles/modal.module.css";
import { Vehicle } from "@/types/vehicle";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function VehicleTableClient({ vehicles, locations }: { vehicles: any[], locations: any[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    make: "", model: "", year: new Date().getFullYear(), type: "SEDAN", 
    transmission: "AUTOMATIC", fuelType: "PETROL", seats: 5, doors: 4, 
    pricePerDay: 200000, description: "", locationId: locations[0]?.id || "",
    images: "", // comma separated for now
  });

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      make: "", model: "", year: new Date().getFullYear(), type: "SEDAN", 
      transmission: "AUTOMATIC", fuelType: "PETROL", seats: 5, doors: 4, 
      pricePerDay: 200000, description: "", locationId: locations[0]?.id || "",
      images: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make, model: vehicle.model, year: vehicle.year, type: vehicle.type, 
      transmission: vehicle.transmission, fuelType: vehicle.fuelType, seats: vehicle.seats, 
      doors: vehicle.doors, pricePerDay: vehicle.pricePerDay, description: vehicle.description, 
      locationId: vehicle.locationId, images: vehicle.images.join(", "),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      images: formData.images.split(",").map(s => s.trim()).filter(Boolean),
      pricePerDay: Number(formData.pricePerDay),
      year: Number(formData.year),
      seats: Number(formData.seats),
      doors: Number(formData.doors),
      features: { airConditioning: true, bluetooth: true }, // Default dummy features for now
    };

    try {
      const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : "/api/vehicles";
      const method = editingVehicle ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        router.refresh(); // Refresh server component data
      } else {
        const errorData = await res.json();
        alert(`Failed to save vehicle: ${JSON.stringify(errorData.details || errorData.error)}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this vehicle?")) return;
    try {
      await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Vehicle Management</h1>
        <button className={styles.btnPrimary} onClick={openAddModal}>
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Make & Model</th>
              <th>Type</th>
              <th>Location</th>
              <th>Price/Day</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td style={{ fontWeight: 500, color: "#0f172a" }}>{v.make} {v.model} ({v.year})</td>
                <td>{v.type}</td>
                <td>{v.location.name}</td>
                <td>{formatPrice(v.pricePerDay)}</td>
                <td>
                  <span className={`${styles.badge} ${v.isActive ? styles.badgeSuccess : styles.badgeDanger}`}>
                    {v.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => openEditModal(v)}
                      style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '4px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    {v.isActive && (
                      <button 
                        onClick={() => handleDeactivate(v.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                        title="Deactivate"
                      >
                        <Ban size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Make</label>
              <input className={modalStyles.input} required value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
            </div>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Model</label>
              <input className={modalStyles.input} required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
            </div>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Year</label>
              <input type="number" className={modalStyles.input} required value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
            </div>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Price/Day (paise)</label>
              <input type="number" className={modalStyles.input} required value={formData.pricePerDay} onChange={e => setFormData({...formData, pricePerDay: Number(e.target.value)})} />
            </div>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Type</label>
              <select className={modalStyles.select} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="SEDAN">Sedan</option><option value="SUV">SUV</option><option value="HATCHBACK">Hatchback</option>
                <option value="LUXURY">Luxury</option><option value="CONVERTIBLE">Convertible</option><option value="VAN">Van</option>
              </select>
            </div>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.label}>Location</label>
              <select className={modalStyles.select} required value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})}>
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
            </div>
          </div>
          <div className={modalStyles.formGroup} style={{ marginTop: '16px' }}>
            <label className={modalStyles.label}>Image URLs (comma separated)</label>
            <textarea className={modalStyles.textarea} required placeholder="https://..., https://..." value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} />
          </div>
          <div className={modalStyles.formGroup}>
            <label className={modalStyles.label}>Description</label>
            <textarea className={modalStyles.textarea} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className={styles.btnSecondary} onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Vehicle"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
