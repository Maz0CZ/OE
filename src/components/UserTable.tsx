import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface User {
  id: string;
  username: string; // Changed from 'name' to 'username'
  email: string;
  status: "active" | "banned";
}

interface UserTableProps {
  users: User[];
  onBanUser: (userId: string) => void;
  onUnbanUser: (userId: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onBanUser, onUnbanUser }) => {
  return (
    <div className="rounded-md border border-highlight/20">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            <TableHead className="text-highlight">ID</TableHead>
            <TableHead className="text-highlight">Username</TableHead> {/* Changed to Username */}
            <TableHead className="text-highlight">Email</TableHead>
            <TableHead className="text-highlight">Status</TableHead>
            <TableHead className="text-highlight text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-accent/20">
              <TableCell className="font-medium text-muted-foreground">{user.id}</TableCell>
              <TableCell className="text-foreground">{user.username}</TableCell> {/* Changed to user.username */}
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  user.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {user.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {user.status === "active" ? (
                  <Button variant="destructive" size="sm" onClick={() => onBanUser(user.id)}>
                    Ban
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => onUnbanUser(user.id)} className="border-green-500 text-green-500 hover:bg-green-500/22">
                    Unban
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;