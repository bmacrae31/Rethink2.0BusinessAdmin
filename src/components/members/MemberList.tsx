import React, { useState } from 'react';
import { Search, Filter, UserPlus, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddMemberModal from './AddMemberModal';
import BulkImportModal from './BulkImportModal';
import MemberListTable from './MemberListTable';
import { useMemberStore } from '../../store/memberStore';
import ErrorBoundary from '../common/ErrorBoundary';

export default function MemberList() {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const members = useMemberStore((state) => Object.values(state.members));
  const createMember = useMemberStore((state) => state.createMember);
  const updateMember = useMemberStore((state) => state.updateMember);
  const deleteMember = useMemberStore((state) => state.deleteMember);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ErrorBoundary>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Members</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your membership program and view member details.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
            <button
              onClick={() => setIsBulkImportOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Members
            </button>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg border-gray-300 pl-11 pr-4 py-3 text-base focus:border-gray-900 focus:ring-gray-900"
                  placeholder="Search members by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-gray-900 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No members</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new member.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(true)}
                  className="inline-flex items-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </button>
              </div>
            </div>
          ) : (
            <MemberListTable
              members={filteredMembers}
              onUpdate={(id, updates) => updateMember(id, updates)}
              onDelete={deleteMember}
            />
          )}
        </div>

        <AddMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          onMemberAdded={createMember}
        />

        <BulkImportModal
          isOpen={isBulkImportOpen}
          onClose={() => setIsBulkImportOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}