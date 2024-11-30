import React, { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Edit, Ban, Trash2 } from 'lucide-react';
import { Member } from '../../types/member';
import EditMemberModal from './EditMemberModal';
import SuspendMemberModal from './SuspendMemberModal';
import DeleteMemberModal from './DeleteMemberModal';

interface MemberActionsProps {
  member: Member;
  onUpdate: (updatedMember: Member) => void;
  onDelete: (memberId: string) => void;
}

export default function MemberActions({ member, onUpdate, onDelete }: MemberActionsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="flex items-center text-gray-400 hover:text-gray-500">
          <span className="sr-only">Open options</span>
          <MoreVertical className="h-5 w-5" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <Edit className="mr-3 h-5 w-5 text-gray-400" />
                    Edit Details
                  </button>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsSuspendModalOpen(true)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <Ban className="mr-3 h-5 w-5 text-gray-400" />
                    {member.status === 'active' ? 'Make Inactive' : 'Make Active'}
                  </button>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex w-full items-center px-4 py-2 text-sm text-red-700`}
                  >
                    <Trash2 className="mr-3 h-5 w-5 text-red-400" />
                    Delete Member
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={member}
        onUpdate={onUpdate}
      />

      <SuspendMemberModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        member={member}
        onUpdate={onUpdate}
      />

      <DeleteMemberModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        member={member}
        onDelete={onDelete}
      />
    </>
  );
}