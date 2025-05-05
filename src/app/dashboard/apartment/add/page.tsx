"use client";
import { useState } from 'react';

interface FormDataType {
  name: string;
  number_of_bedroom: number;
  kitchen_inside: boolean;
  kitchen_outside: boolean;
  number_of_floor: number;
  address: string;
  coordinate: {
    lat: string;
    lng: string;
  };
  annexes: string;
  description: string;
  status: string;
}

export default function ApartmentForm() {
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    number_of_bedroom: 1,
    kitchen_inside: false,
    kitchen_outside: false,
    number_of_floor: 1,
    address: '',
    coordinate: { lat: '', lng: '' },
    annexes: '',
    description: '',
    status: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
  
    if (name === 'lat' || name === 'lng') {
      setFormData((prevData) => ({
        ...prevData,
        coordinate: {
          ...prevData.coordinate,
          [name]: value,
        },
      }));
    } else if (type === 'checkbox' && target instanceof HTMLInputElement) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: target.checked,
      }));
    } else if (name === 'number_of_bedroom' || name === 'number_of_floor') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: parseInt(value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  

  const handlePhotoChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newPhotos = [...photos];
      newPhotos[index] = e.target.files[0];
      setPhotos(newPhotos);
    }
  };

  const addPhotoField = () => {
    setPhotos([...photos, new File([], "")]); // Placeholder to render an input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formPayload = new FormData();

    formPayload.append("name", formData.name);
    formPayload.append("address", formData.address);
    formPayload.append("description", formData.description);
    formPayload.append("number_of_bedroom", formData.number_of_bedroom.toString());
    formPayload.append("kitchen_inside", formData.kitchen_inside ? '1' : '0');
    formPayload.append("kitchen_outside", formData.kitchen_outside ? '1' : '0');
    formPayload.append("number_of_floor", formData.number_of_floor.toString());
    formPayload.append("status", formData.status);
    formPayload.append("coordinate", `${formData.coordinate.lat},${formData.coordinate.lng}`);
    formPayload.append("annexes", formData.annexes);

    photos.forEach((photo) => {
      if (photo instanceof File) {
        formPayload.append("photos[]", photo);
      }
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/apartments`, {
        method: 'POST',
        body: formPayload,
      });

      if (response.ok) {
        alert('Apartment successfully added!');
        setFormData({
          name: '',
          number_of_bedroom: 1,
          kitchen_inside: false,
          kitchen_outside: false,
          number_of_floor: 1,
          address: '',
          coordinate: { lat: '', lng: '' },
          annexes: '',
          description: '',
          status: '',
        });
        setPhotos([]);
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error('Failed to add apartment');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error adding the apartment.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Apartment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Apartment Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 mt-1 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 mt-1 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Latitude</label>
          <input
            type="text"
            name="lat"
            value={formData.coordinate.lat}
            onChange={handleChange}
            className="w-full p-2 mt-1 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Longitude</label>
          <input
            type="text"
            name="lng"
            value={formData.coordinate.lng}
            onChange={handleChange}
            className="w-full p-2 mt-1 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 mt-1 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Bedrooms</label>
          <input
            type="number"
            name="number_of_bedroom"
            value={formData.number_of_bedroom}
            onChange={handleChange}
            min={1}
            className="w-full p-2 mt-1 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Floors</label>
          <input
            type="number"
            name="number_of_floor"
            value={formData.number_of_floor}
            onChange={handleChange}
            min={1}
            className="w-full p-2 mt-1 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Kitchen Inside</label>
          <input
            type="checkbox"
            name="kitchen_inside"
            checked={formData.kitchen_inside}
            onChange={handleChange}
            className="w-full mt-1 text-gray-800 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Kitchen Outside</label>
          <input
            type="checkbox"
            name="kitchen_outside"
            checked={formData.kitchen_outside}
            onChange={handleChange}
            className="w-full mt-1 text-gray-800 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Annexes</label>
          <input
            type="text"
            name="annexes"
            value={formData.annexes}
            onChange={handleChange}
            className="w-full p-2 mt-1 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 mt-1 text-gray-800 border border-gray-300 rounded focus:ring focus:ring-blue-500"
            required
          >
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Photo Upload Section */}
      <div className="mt-4">
      <label className="block text-sm font-medium text-gray-800 mb-2">Photos</label>
  
      <div className="space-y-2">
        {photos.map((_, index) => (
          <input
            key={index}
            type="file"
            accept="image/*"
            name="photos"
            multiple
            onChange={(e) => handlePhotoChange(index, e)}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                       file:rounded file:border-0 file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100 border border-gray-300 rounded"
          />
        ))}
      </div>

        <button
          type="button"
          onClick={addPhotoField}
          className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          + Add Another Photo
        </button>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full py-3 text-white bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Submit Apartment
        </button>
      </div>
    </form>
  );
}
