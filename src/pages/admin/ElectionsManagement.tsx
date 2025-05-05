
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash, Search, Check, X } from "lucide-react";
import { Election } from "@/types";

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  start_date: z.string().refine(date => new Date(date) > new Date(), {
    message: "Start date must be in the future",
  }),
  end_date: z.string().refine(date => new Date(date) > new Date(), {
    message: "End date must be in the future",
  }),
  is_private: z.boolean().default(false),
  access_code: z.string().optional(),
});

const ElectionsManagement = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      is_private: false,
      access_code: "",
    },
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setElections(data || []);
    } catch (error) {
      console.error("Error fetching elections:", error);
      toast.error("Failed to fetch elections");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      // Check that end date is after start date
      const startDate = new Date(values.start_date);
      const endDate = new Date(values.end_date);
      
      if (endDate <= startDate) {
        toast.error("End date must be after start date");
        return;
      }

      const { data, error } = await supabase
        .from('elections')
        .insert({
          title: values.title,
          description: values.description,
          start_date: values.start_date,
          end_date: values.end_date,
          created_by: user.id,
          is_private: values.is_private,
          access_code: values.is_private ? values.access_code : null,
        })
        .select();
      
      if (error) throw error;
      
      toast.success("Election created successfully");
      setIsDialogOpen(false);
      form.reset();
      
      // Update local state with new election
      if (data) {
        setElections([...data, ...elections]);
      }
      
      fetchElections();
    } catch (error) {
      console.error("Error creating election:", error);
      toast.error("Failed to create election");
    }
  };

  const handleDeleteElection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('elections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Election deleted successfully");
      
      // Update local state
      setElections(elections.filter(election => election.id !== id));
    } catch (error) {
      console.error("Error deleting election:", error);
      toast.error("Failed to delete election");
    }
  };

  const filteredElections = elections.filter(election => 
    election.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    election.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Elections Management</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Election
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Election</DialogTitle>
              <DialogDescription>
                Fill out this form to create a new election.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateElection)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter election title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter election description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="is_private"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                      <FormControl>
                        <input 
                          type="checkbox" 
                          checked={field.value} 
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Private Election</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch('is_private') && (
                  <FormField
                    control={form.control}
                    name="access_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter access code for private election" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <Button type="submit" className="w-full">Create Election</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Elections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search elections..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {loading ? (
            <div className="text-center py-4">Loading elections...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Private</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredElections.length > 0 ? (
                  filteredElections.map(election => (
                    <TableRow key={election.id}>
                      <TableCell>{election.title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          election.status === 'active' ? 'bg-green-100 text-green-800' : 
                          election.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(election.startDate)}</TableCell>
                      <TableCell>{formatDate(election.endDate)}</TableCell>
                      <TableCell>
                        {election.isPrivate ? <Check size={16} /> : <X size={16} />}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/elections/${election.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteElection(election.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No elections found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectionsManagement;
