import React, { useEffect, useState } from "react";
import { Car, Plus, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { VehicleCard } from "@/components/VehicleCard";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { vehicleApi } from "@/services/api";

const vehicleTypeOptions = ["Car", "SUV", "Bike", "Van", "Truck"];
const fuelTypeOptions = ["Petrol", "Diesel", "EV", "CNG"];

const placeholderImage =
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=70";

function normalizeVehicle(vehicle) {
  return {
    ...vehicle,
    id: vehicle._id || vehicle.id,
    color: vehicle.color || "Standard",
    image: vehicle.image || placeholderImage,
    lastService: vehicle.lastService || "Never",
  };
}

/**
 * Owner Vehicle Management Page
 */
export function Vehicles() {
  const [vehicleList, setVehicleList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [type, setType] = useState("Car");
  const [fuel, setFuel] = useState("Petrol");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isActive = true;

    const loadVehicles = async () => {
      try {
        const response = await vehicleApi.list();
        if (isActive) {
          setVehicleList((response.data || []).map(normalizeVehicle));
        }
      } catch (error) {
        if (isActive) setPageError(error.message || "Unable to load your vehicles.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadVehicles();
    return () => {
      isActive = false;
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setName("");
    setRegistration("");
    setType("Car");
    setFuel("Petrol");
    setErrors({});
    setFormError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setName(vehicle.name);
    setRegistration(vehicle.registration);
    setType(vehicle.type);
    setFuel(vehicle.fuel);
    setErrors({});
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setFormError("");
    const nextErrors = {};

    if (!name.trim() || name.trim().length < 2) {
      nextErrors.name = "Enter vehicle make and model (e.g., Hyundai i20).";
    }

    const regPattern = /^[A-Z]{2}-?\d{2}-?[A-Z]{1,2}-?\d{1,4}$/i;
    if (!registration.trim() || !regPattern.test(registration.trim().replace(/\s/g, ""))) {
      nextErrors.registration = "Use a valid format like KL-07-BX-1234.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setFormError("");
    setIsSaving(true);

    const payload = {
      name: name.trim(),
      registration: registration.trim().replace(/\s/g, "").toUpperCase(),
      type,
      fuel,
    };

    try {
      const response = editingVehicle
        ? await vehicleApi.update(editingVehicle.id, payload)
        : await vehicleApi.create({
            ...payload,
            lastService: "Never",
            image: placeholderImage,
            color: "Standard",
          });
      const savedVehicle = normalizeVehicle(response.data);

      if (editingVehicle) {
        setVehicleList((prev) =>
          prev.map((vehicle) => (vehicle.id === savedVehicle.id ? savedVehicle : vehicle)),
        );
      } else {
        setVehicleList((prev) => [savedVehicle, ...prev]);
      }

      setPageError("");
      setModalOpen(false);
    } catch (error) {
      setFormError(error.message || "Unable to save the vehicle. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete || isDeleting) return;

    setDeleteError("");
    setIsDeleting(true);
    try {
      await vehicleApi.remove(vehicleToDelete.id);
      setVehicleList((prev) => prev.filter((vehicle) => vehicle.id !== vehicleToDelete.id));
      setDeleteModalOpen(false);
      setVehicleToDelete(null);
    } catch (error) {
      setDeleteError(error.message || "Unable to remove the vehicle. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout role="owner">
      <div className="space-y-6">
        <PageHeader
          title="My Vehicles"
          description="Add, edit and manage the vehicles linked to your RoadGuard account for 1-tap dispatch."
          action={
            <Button onClick={handleOpenAdd} variant="accent">
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          }
        />
        {pageError && (
          <p className="text-sm text-destructive" role="alert">
            {pageError}
          </p>
        )}

        {/* Vehicles Grid */}
        {isLoading ? (
          <div className="surface-card p-12 text-center">
            <p className="text-sm text-muted-foreground">Loading vehicles...</p>
          </div>
        ) : vehicleList.length === 0 ? (
          <div className="surface-card p-12 text-center space-y-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary mx-auto text-muted-foreground">
              <Car className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold">No vehicles registered</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Add your primary car, SUV or bike so our mechanics know what parts and tools to bring.
            </p>
            <Button onClick={handleOpenAdd} variant="accent">
              <Plus className="h-4 w-4" /> Add your first vehicle
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {vehicleList.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEdit={() => handleOpenEdit(vehicle)}
                onDelete={() => {
                  setVehicleToDelete(vehicle);
                  setDeleteError("");
                  setDeleteModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Vehicle Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingVehicle ? "Edit Vehicle Details" : "Register New Vehicle"}
          description="Vehicle information helps arriving mechanics bring the correct tools and fluids."
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : editingVehicle ? "Save Changes" : "Register Vehicle"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSave} className="space-y-4">
            {formError && (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            )}
            <div>
              <label htmlFor="veh-name" className="block text-sm font-medium mb-1">
                Make &amp; Model
              </label>
              <input
                id="veh-name"
                type="text"
                placeholder="e.g. Toyota Innova Crysta"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="veh-reg" className="block text-sm font-medium mb-1">
                Registration Number
              </label>
              <input
                id="veh-reg"
                type="text"
                placeholder="e.g. KL-07-BX-1234"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.registration && (
                <p className="mt-1 text-xs text-destructive">{errors.registration}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="veh-type" className="block text-sm font-medium mb-1">
                  Type
                </label>
                <select
                  id="veh-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {vehicleTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="veh-fuel" className="block text-sm font-medium mb-1">
                  Fuel Type
                </label>
                <select
                  id="veh-fuel"
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {fuelTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Remove Vehicle?"
          description={`Are you sure you want to remove ${vehicleToDelete?.name} (${vehicleToDelete?.registration}) from your account?`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Vehicle"}
              </Button>
            </>
          }
        >
          <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-3 text-destructive text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>
              Past completed service invoices associated with this vehicle will remain in your
              history.
            </span>
          </div>
          {deleteError && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
export default Vehicles;
