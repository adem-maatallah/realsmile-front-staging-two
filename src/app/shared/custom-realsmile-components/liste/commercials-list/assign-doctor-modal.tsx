import { useState, useEffect } from "react";
import { Modal, Button, Text, MultiSelect, ActionIcon } from "rizzui";
import { XMarkIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import { Spin } from "antd";
import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";

export default function AssignDoctorModal({
  isOpen,
  onClose,
  assignedDoctors = [],
  onSave,
  commercialId,
}: {
  isOpen: boolean;
  onClose: () => void;
  assignedDoctors: { id: number; first_name: string; last_name: string }[];
  onSave: (doctorIds: string[]) => void;
  commercialId: number | null;
}) {
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>(
    assignedDoctors.map((doc) => doc.id.toString())
  );
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const {user} = useAuth()

  useEffect(() => {
    if (!isOpen || !commercialId) return;

    const fetchDoctors = async () => {
      if (!user) return;
      setIsLoadingDoctors(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/doctors`,
          {withCredentials: true}
        );
        setDoctors(response.data.doctors || []);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [isOpen, commercialId]);

  useEffect(() => {
    setSelectedDoctors(assignedDoctors.map((doc) => doc.id.toString()));
  }, [assignedDoctors]);

  const handleSave = () => {
    onSave(selectedDoctors);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="m-auto px-7 pb-8 pt-6">
        <div className="mb-7 flex items-center justify-between">
          <Text as="strong">Assign Doctors</Text>
          <ActionIcon size="sm" variant="text" onClick={onClose}>
            <XMarkIcon className="h-auto w-6" strokeWidth={1.8} />
          </ActionIcon>
        </div>
        {isLoadingDoctors ? (
          <div className="flex justify-center items-center mb-6">
            <Spin />
          </div>
        ) : (
          <MultiSelect
            label="Assigned Doctors *"
            options={doctors.map((doctor) => ({
              label: `${doctor.first_name} ${doctor.last_name}`,
              value: doctor.id.toString(),
            }))}
            value={selectedDoctors}
            onChange={(selected) => setSelectedDoctors(selected)}
            className="mb-6"
            clearable={true}
            searchable={true}
            onClear={() => setSelectedDoctors([])}
          />
        )}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
