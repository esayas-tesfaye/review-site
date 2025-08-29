import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { getAllServicesForAdmin, approveService, rejectService, getUsers, promoteUser } from '@/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Role } from '@/types';

const ServiceManagementTab = () => {
    const queryClient = useQueryClient();
    const { data: services, isLoading, isError, error } = useQuery({
        queryKey: ['adminAllServices'],
        queryFn: getAllServicesForAdmin
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAllServices'] });
        },
        onError: (error: Error) => { toast.error('Action Failed', { description: error.message }); },
    };

    const approveMutation = useMutation({ ...mutationOptions, mutationFn: approveService });
    const rejectMutation = useMutation({ ...mutationOptions, mutationFn: rejectService });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'default';
            case 'REJECTED': return 'destructive';
            default: return 'secondary';
        }
    };

    if (isLoading) return <div className="space-y-2 pt-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
    if (isError) return <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{(error as Error).message}</AlertDescription></Alert>

    return (
        <Table>
            <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Provider</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
                {services?.map(service => (
                    <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.providerName}</TableCell>
                        <TableCell>{service.category}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(service.approvalStatus)}>{service.approvalStatus}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                            {service.approvalStatus === 'PENDING' && (
                                <>
                                    <Button size="icon" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => approveMutation.mutate(service.id)}><Check className="h-4 w-4" /></Button>
                                    <Button size="icon" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => rejectMutation.mutate(service.id)}><X className="h-4 w-4"/></Button>
                                </>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const UserManagementTab = () => {
    const queryClient = useQueryClient();
    const { data: users, isLoading, isError, error } = useQuery({ queryKey: ['adminAllUsers'], queryFn: getUsers });

    const promoteMutation = useMutation({
        mutationFn: promoteUser,
        onSuccess: (data) => {
            toast.success(`${data.name} has been promoted to Admin.`);
            queryClient.invalidateQueries({ queryKey: ['adminAllUsers'] });
        },
        onError: (error: Error) => { toast.error('Promotion Failed', { description: error.message }); },
    });

    if (isLoading) return <div className="space-y-2 pt-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
    if (isError) return <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{(error as Error).message}</AlertDescription></Alert>

    return (
        <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
                {users?.map(user => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant={user.role === Role.ADMIN ? 'destructive' : 'secondary'}>{user.role}</Badge></TableCell>
                        <TableCell className="text-right">
                            {user.role !== Role.ADMIN && (
                                <Button size="sm" variant="outline" onClick={() => promoteMutation.mutate(user.id)} disabled={promoteMutation.isPending}>
                                    <ShieldCheck className="mr-2 h-4 w-4" /> Promote to Admin
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};


const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto py-12 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Dashboard</CardTitle>
                        <CardDescription>Manage services and users across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="services">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="services">Service Management</TabsTrigger>
                                <TabsTrigger value="users">User Management</TabsTrigger>
                            </TabsList>
                            <TabsContent value="services">
                                <ServiceManagementTab />
                            </TabsContent>
                            <TabsContent value="users">
                                <UserManagementTab />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;