import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { X, Lock, User, Copy, Trash2, ChevronDown, Edit, Eye } from 'lucide-react';
import { BACKEND_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
// --- Type Definitions ---
type AccessType = 'private' | 'public';
type Role = 'view' | 'edit';

interface Collaborator {
  id: string;
  email: string;
  role: Role;
}

interface AccessControlModalProps {
  setIsSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectId?: string; // Optional, as it has a default value
  ownerEmail?:string
}

// --- Constants ---


// --- Component ---
const AccessControlModal: React.FC<AccessControlModalProps> = ({
  setIsSettingsModalOpen,
  projectId,
  ownerEmail
}) => {
  const [accessType, setAccessType] = useState<AccessType>('private');
  const [publicRole, setPublicRole] = useState<Role>('view');
  const [owner, setOwner] = useState<string | undefined>(ownerEmail);
  const [users, setUsers] = useState<Collaborator[]>([]);
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<Role>('view');
  
  const projectLink: string = `${window.location.href}`;
  const [copied, setCopied] = useState<boolean>(false);

  const navigate= useNavigate();

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleAddUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !/\S+@\S+\.\S+/.test(newUserEmail.trim())) {
      alert('Please enter a valid email address.');
      return;
    }
    if (users.find(user => user.email === newUserEmail.trim())) {
      alert('This user has already been added.');
      return;
    }
    if (newUserEmail.trim() === owner) {
      alert('The owner cannot be added as a collaborator.');
      return;
    }

    setUsers(prevUsers => [
      ...prevUsers,
      { id: Date.now().toString(), email: newUserEmail.trim(), role: newUserRole },
    ]);
    setNewUserEmail('');
    setNewUserRole('view');
  };

  const handleRemoveUser = (userIdToRemove: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userIdToRemove));
  };

  const handleUserRoleChange = (userIdToUpdate: string, newRole: Role) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userIdToUpdate ? { ...user, role: newRole } : user
      )
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(projectLink)
      .then(() => setCopied(true))
      .catch(err => console.error('Failed to copy: ', err));
  };


  
  const handleAccessTypeChange = (type: AccessType) => {
    setAccessType(type);
  };

  const getAccessDescription = (): string => {
    if (accessType === 'public') {
      return `Anyone with the link can ${publicRole}.`;
    }
    return 'Only people added can open with this link.';
  };

  const saveconfiguration=async()=>{
    const view = users
    .filter(user => user.role === 'view' )
    .map(user => user.email);

    const edit=users
    .filter(user => user.role === 'edit')
    .map(user => user.email);

    let Mode;

    if(accessType==="private"){
        Mode="private"
    }else if(accessType==="public" && publicRole==="edit"){
        Mode="publicEdit"
    }else if(accessType==="public" && publicRole==="view"){
        Mode="publicView"
    }

    try {
    const response = await fetch(`${BACKEND_URL}/diagrams/${projectId}`, {
      method: 'PUT',
      credentials: 'include', // 🔐 Include cookies in the request
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        views:view,
        edits:edit,
        mode:Mode,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save configuration');
    }

    const data = await response.json();
    console.log('Fetched diagram:', data);
    navigate(`/diagram/create/${projectId}/${Mode}`)

  } catch (err:any) {
    console.error('Error fetching diagram:', err.message);
  }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 rounded-full p-1"
          onClick={() => setIsSettingsModalOpen(false)}
          aria-label="Close settings"
        >
          <X size={20} color="#333" />
        </button>
        <h2 className="text-2xl mb-6 font-bold text-gray-800">Share "{projectId}"</h2>

        {/* Add People Section */}
        <form onSubmit={handleAddUser} className="mb-6 flex items-center gap-2">
          <input
            type="email"
            value={newUserEmail}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewUserEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-grow border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={accessType === 'public'}
          />
          <div className="relative">
            <select
              value={newUserRole}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewUserRole(e.target.value as Role)}
              className="border p-2 rounded-md appearance-none pr-8 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={accessType === 'public'}
            >
              <option value="view">Can View</option>
              <option value="edit">Can Edit</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          <button
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors ${accessType === 'public' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={accessType === 'public'}
          >
            Add
          </button>
        </form>

        {/* Current Users List */}
        {users.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">People with access</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {/* Owner (always listed) */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <User size={20} className="text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">{owner}</p>
                    <p className="text-xs text-gray-500">Owner</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 px-2 py-1 rounded-full bg-gray-200">Owner</span>
              </div>

              {/* Collaborators */}
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md">
                  <div className="flex items-center">
                     {user.role === 'view' ? <Eye size={20} className="text-gray-600 mr-3" /> : <Edit size={20} className="text-gray-600 mr-3" />}
                    <div>
                        <p className="font-medium text-gray-800">{user.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {accessType === 'private' && (
                       <div className="relative">
                        <select
                          value={user.role}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => handleUserRoleChange(user.id, e.target.value as Role)}
                          className="border p-1.5 text-sm rounded-md appearance-none pr-7 bg-white focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="view">Can View</option>
                          <option value="edit">Can Edit</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                      aria-label={`Remove ${user.email}`}
                      disabled={accessType === 'public'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* General Access Section */}
        <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">General access</h3>
            <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-full ${accessType === 'private' ? 'bg-red-100' : 'bg-green-100'}`}>
                    {accessType === 'private' ? <Lock size={24} className="text-red-600" /> : <User size={24} className="text-green-600" />}
                </div>
                <div>
                    <div className="relative">
                        <select
                            value={accessType}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleAccessTypeChange(e.target.value as AccessType)}
                            className="font-semibold text-gray-800 text-md p-1 pr-8 appearance-none bg-transparent focus:outline-none cursor-pointer"
                        >
                            <option value="private">Private</option>
                            <option value="public">Public</option>
                        </select>
                         <ChevronDown size={16} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    <p className="text-sm text-gray-600">{getAccessDescription()}</p>
                </div>
                {accessType === 'public' && (
                    <div className="relative ml-auto">
                        <select
                            value={publicRole}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setPublicRole(e.target.value as Role)}
                            className="border p-2 text-sm rounded-md appearance-none pr-8 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="view">Anyone can view</option>
                            <option value="edit">Anyone can edit</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                )}
            </div>

            {/* Link Copying */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={projectLink}
                readOnly
                className="flex-grow border p-2 rounded-md bg-gray-100 text-gray-700 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md flex items-center gap-1 transition-colors"
              >
                <Copy size={16} /> {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
        </div>

        {/* Owner Section */}
       

        <div className="mt-8 flex justify-end">
            <button
                onClick={() => {
                setIsSettingsModalOpen(false)
                saveconfiguration()
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
            >
                Done
            </button>
        </div>

      </div>
    </div>
  );
};



export default AccessControlModal;