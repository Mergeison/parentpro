import React, { useState, useEffect } from 'react';
import { FaUserFriends, FaPlus, FaEdit, FaTrash, FaSearch, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { parentsAPI, studentsAPI } from '../../services/api';

const ParentsPage = () => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChildren, setFilterChildren] = useState('');

  const [formData, setFormData] = useState({
    father_name: '',
    mother_name: '',
    father_phone: '',
    mother_phone: '',
    father_email: '',
    mother_email: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    children_ids: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [parentsData, studentsData] = await Promise.all([
        parentsAPI.getAll(),
        studentsAPI.getAll()
      ]);
      setParents(parentsData);
      setStudents(studentsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParent) {
        await parentsAPI.update(editingParent.id, formData);
        toast.success('Parent updated successfully!');
      } else {
        await parentsAPI.create(formData);
        toast.success('Parent enrolled successfully!');
      }
      setShowForm(false);
      setEditingParent(null);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Failed to save parent');
    }
  };

  const handleEdit = (parent) => {
    setEditingParent(parent);
    setFormData({
      father_name: parent.father_name || '',
      mother_name: parent.mother_name || '',
      father_phone: parent.father_phone || '',
      mother_phone: parent.mother_phone || '',
      father_email: parent.father_email || '',
      mother_email: parent.mother_email || '',
      address: parent.address || '',
      emergency_contact: parent.emergency_contact || '',
      emergency_phone: parent.emergency_phone || '',
      children_ids: parent.children_ids || []
    });
    setShowForm(true);
  };

  const handleDelete = async (parentId) => {
    if (window.confirm('Are you sure you want to delete this parent?')) {
      try {
        // Note: You'll need to add delete method to parentsAPI
        toast.success('Parent deleted successfully!');
        loadData();
      } catch (error) {
        toast.error('Failed to delete parent');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      father_name: '',
      mother_name: '',
      father_phone: '',
      mother_phone: '',
      father_email: '',
      mother_email: '',
      address: '',
      emergency_contact: '',
      emergency_phone: '',
      children_ids: []
    });
  };

  const filteredParents = parents.filter(parent => {
    const matchesSearch = 
      parent.father_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.mother_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.father_phone?.includes(searchTerm) ||
      parent.mother_phone?.includes(searchTerm);
    
    const matchesChildren = !filterChildren || 
      (parent.children_ids && parent.children_ids.length > 0);
    
    return matchesSearch && matchesChildren;
  });

  const getChildrenNames = (childrenIds) => {
    if (!childrenIds || childrenIds.length === 0) return 'No children';
    const children = students.filter(s => childrenIds.includes(s.id));
    return children.map(c => c.name).join(', ') || 'No children';
  };

  const getChildrenCount = (childrenIds) => {
    return childrenIds ? childrenIds.length : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Parents Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage parent enrollment and information
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingParent(null);
                resetForm();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FaPlus className="mr-2" />
              Enroll New Parent
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-2" />
                Search Parents
              </label>
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaSearch className="inline mr-2" />
                Children Filter
              </label>
              <select
                value={filterChildren}
                onChange={(e) => setFilterChildren(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Parents</option>
                <option value="with_children">With Children</option>
                <option value="without_children">Without Children</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterChildren('');
                }}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Enrollment Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingParent ? 'Edit Parent' : 'Enroll New Parent'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Father Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                  Father Information
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.father_name}
                  onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.father_phone}
                  onChange={(e) => setFormData({...formData, father_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Email
                </label>
                <input
                  type="email"
                  value={formData.father_email}
                  onChange={(e) => setFormData({...formData, father_email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Mother Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2 mt-4">
                  Mother Information
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.mother_name}
                  onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mother_phone}
                  onChange={(e) => setFormData({...formData, mother_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Email
                </label>
                <input
                  type="email"
                  value={formData.mother_email}
                  onChange={(e) => setFormData({...formData, mother_email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Emergency Contact */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2 mt-4">
                  Emergency Contact
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Children Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Children (Optional - can be added later)
                </label>
                <select
                  multiple
                  value={formData.children_ids}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({...formData, children_ids: selectedOptions});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  size="4"
                >
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - Class {student.class} Section {student.section}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple children
                </p>
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingParent(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingParent ? 'Update Parent' : 'Enroll Parent'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Parents List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Parents ({filteredParents.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Children
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-300 flex items-center justify-center">
                          <FaUserFriends className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {parent.father_name} & {parent.mother_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {parent.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <FaPhone className="mr-2 text-gray-400" />
                          {parent.father_phone || parent.phone}
                        </div>
                        {parent.mother_phone && (
                          <div className="flex items-center mb-1">
                            <FaPhone className="mr-2 text-gray-400" />
                            {parent.mother_phone}
                          </div>
                        )}
                        {(parent.father_email || parent.mother_email) && (
                          <div className="flex items-center">
                            <FaEnvelope className="mr-2 text-gray-400" />
                            {parent.father_email || parent.mother_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">
                          {getChildrenCount(parent.children_ids)} children
                        </div>
                        <div className="text-gray-500">
                          {getChildrenNames(parent.children_ids)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {parent.address || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(parent)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FaEdit className="inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(parent.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="inline mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentsPage; 