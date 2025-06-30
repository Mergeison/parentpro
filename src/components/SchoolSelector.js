import React, { useState, useEffect } from 'react';
import { FaSchool, FaSearch, FaSpinner } from 'react-icons/fa';
import { schoolsAPI } from '../services/api';

const SchoolSelector = ({ onSchoolSelect, selectedSchool }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const schoolsData = await schoolsAPI.getAll();
      setSchools(schoolsData);
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSchoolSelect = (school) => {
    onSchoolSelect(school);
    setShowDropdown(false);
    setSearchTerm(school.name);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <FaSchool className="inline mr-2" />
        Select Your School
      </label>
      
      <div className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Search for your school..."
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {loading ? (
                <FaSpinner className="h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <FaSearch className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredSchools.length > 0 ? (
              filteredSchools.map((school) => (
                <div
                  key={school.id}
                  onClick={() => handleSchoolSelect(school)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaSchool className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {school.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Domain: {school.domain}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                No schools found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected School Display */}
      {selectedSchool && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FaSchool className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-blue-900">
                {selectedSchool.name}
              </div>
              <div className="text-sm text-blue-700">
                You'll be logging into {selectedSchool.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolSelector; 