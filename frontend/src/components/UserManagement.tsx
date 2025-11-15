import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { UserPlus, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { UserRole } from '../contexts/AuthContext';

interface User {
  uid: string;
  email: string;
  role: UserRole;
  active: boolean;
  displayName?: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'chef' as UserRole,
    displayName: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Note: In a real application, user creation should be done server-side
      // This is a simplified version for demonstration
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Store user data in Firestore
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        email: formData.email,
        role: formData.role,
        active: true,
        displayName: formData.displayName || formData.email.split('@')[0],
      });

      toast.success('User created successfully!');
      setIsAddDialogOpen(false);
      setFormData({ email: '', password: '', role: 'chef', displayName: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const userDoc = users.find(u => u.uid === userId);
      if (!userDoc) return;

      await updateDoc(doc(db, 'users', userId), {
        active: !currentStatus,
      });

      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-500';
      case 'chef': return 'bg-blue-500';
      case 'manager': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name (Optional)</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="chef">Chef</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">Create User</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.uid} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    user.active ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {user.active ? (
                      <UserCheck className="w-6 h-6 text-green-600" />
                    ) : (
                      <UserX className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p>{user.displayName || user.email}</p>
                      <Badge className={`${getRoleBadgeColor(user.role)} text-white`}>
                        {user.role}
                      </Badge>
                      {!user.active && (
                        <Badge variant="outline" className="text-gray-600">
                          Deactivated
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <Button
                  variant={user.active ? 'outline' : 'default'}
                  onClick={() => toggleUserStatus(user.uid, user.active)}
                >
                  {user.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            ))}

            {users.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No users found. Create one to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
