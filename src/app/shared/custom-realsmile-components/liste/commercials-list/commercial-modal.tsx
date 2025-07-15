'use client';

import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Password, Text } from "rizzui";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import CountrySelector from "@/components/custom-realsmile-components/country-selector";
import PhoneNumber from "@/components/ui/phone-input";
import { useAuth } from "@/context/AuthContext";

type CommercialModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    password?: string;
  }) => void;
  initialData?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
  };
  mode: "create" | "edit";
};

export default function CommercialModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: CommercialModalProps) {
  const [formData, setFormData] = useState(
    initialData || {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      country: "US", // Default to "US"
      password: "", // Password is empty by default
    }
  );
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false); // State for country selector
  const {user} = useAuth()

  useEffect(() => {
    setFormData(
      initialData
        ? {
            ...initialData,
            password: "", // Ensure password is not prefilled during edit
          }
        : {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            country: "US", // Default to "US"
            password: "",
          }
    );
  }, [initialData]);

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      toast.error("All fields except password are required");
      return;
    }

    try {
      if (mode === "create") {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/commercials`, formData, {
          withCredentials: true
        });
        toast.success("Commercial created successfully");
        window.location.reload();
      } else {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/commercials/${initialData?.id}`,
          formData,
          {
            withCredentials: true
          }
        );
        toast.success("Commercial updated successfully");
      }
      onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error saving commercial:", error);
      toast.error("Failed to save commercial");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <Text as="strong" className="mb-4 text-lg font-bold">
          {mode === "create" ? "Add Commercial" : "Edit Commercial"}
        </Text>
        <div className="mt-8 grid gap-4">
          <Input
            label="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
          <Input
            label="Last Name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
          <Input
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <CountrySelector
            id="country-selector"
            open={isCountrySelectorOpen}
            selectedValue={{
              label: formData.country,
              value: formData.country,
            }}
            onChange={(value) => setFormData({ ...formData, country: value })}
            onToggle={() => setIsCountrySelectorOpen((prev) => !prev)}
          />
          <PhoneNumber
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            label="Phone Number"
            enableSearch
            clearable
            required
          />
          <Password
            label={mode === "create" ? "Password" : "Password (optional)"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={mode === "create"} // Required only during creation
            placeholder={mode === "edit" ? "Enter a new password if updating" : "Enter password"}
          />
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{mode === "create" ? "Create" : "Update"}</Button>
        </div>
      </div>
    </Modal>
  );
}
