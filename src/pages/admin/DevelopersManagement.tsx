
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useRole } from "@/features/auth/context/RoleContext";
import { UploadButton } from "@/components/ui/upload-button";

interface Developer {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  email: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface DeveloperForm {
  name: string;
  role: string;
  bio: string;
  image_url: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  email: string;
  display_order: number;
  is_active: boolean;
}

const initialForm: DeveloperForm = {
  name: '',
  role: '',
  bio: '',
  image_url: '',
  github_url: '',
  linkedin_url: '',
  twitter_url: '',
  email: '',
  display_order: 0,
  is_active: true,
};

const DevelopersManagement = () => {
  const { user } = useAuth();
  const { isAdmin } = useRole();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [form, setForm] = useState<DeveloperForm>(initialForm);

  useEffect(() => {
    if (isAdmin) {
      fetchDevelopers();
    }
  }, [isAdmin]);

  const fetchDevelopers = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching developers:', error);
        toast.error('Failed to load developers');
        return;
      }

      setDevelopers(data || []);
    } catch (error) {
      console.error('Error fetching developers:', error);
      toast.error('Failed to load developers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.role.trim()) {
      toast.error('Name and role are required');
      return;
    }

    try {
      const developerData = {
        ...form,
        created_by: user?.id,
      };

      let result;
      if (editingDeveloper) {
        result = await supabase
          .from('developers')
          .update(developerData)
          .eq('id', editingDeveloper.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('developers')
          .insert([developerData])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving developer:', result.error);
        toast.error('Failed to save developer');
        return;
      }

      toast.success(editingDeveloper ? 'Developer updated successfully' : 'Developer added successfully');
      setIsDialogOpen(false);
      setEditingDeveloper(null);
      setForm(initialForm);
      fetchDevelopers();
    } catch (error) {
      console.error('Error saving developer:', error);
      toast.error('Failed to save developer');
    }
  };

  const handleEdit = (developer: Developer) => {
    setEditingDeveloper(developer);
    setForm({
      name: developer.name,
      role: developer.role,
      bio: developer.bio || '',
      image_url: developer.image_url || '',
      github_url: developer.github_url || '',
      linkedin_url: developer.linkedin_url || '',
      twitter_url: developer.twitter_url || '',
      email: developer.email || '',
      display_order: developer.display_order,
      is_active: developer.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (developerId: string) => {
    try {
      const { error } = await supabase
        .from('developers')
        .delete()
        .eq('id', developerId);

      if (error) {
        console.error('Error deleting developer:', error);
        toast.error('Failed to delete developer');
        return;
      }

      toast.success('Developer deleted successfully');
      fetchDevelopers();
    } catch (error) {
      console.error('Error deleting developer:', error);
      toast.error('Failed to delete developer');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingDeveloper(null);
    setForm(initialForm);
  };

  const handleImageUpload = (url: string) => {
    setForm({ ...form, image_url: url });
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Developers Management</h1>
          <p className="text-muted-foreground mt-2">Manage the team members displayed on the About Us page</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Developer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDeveloper ? 'Edit Developer' : 'Add Developer'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g., Lead Developer, UI/UX Designer"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Brief description about the developer..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Profile Image</Label>
                <div className="space-y-4">
                  {form.image_url && (
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={form.image_url} alt="Preview" />
                        <AvatarFallback>Preview</AvatarFallback>
                      </Avatar>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setForm({ ...form, image_url: '' })}
                      >
                        Remove Image
                      </Button>
                    </div>
                  )}
                  <UploadButton
                    bucketName="developers"
                    folderPath="profile-images"
                    onUploadComplete={handleImageUpload}
                    accept="image/*"
                    maxSizeMB={2}
                    buttonText="Upload Profile Image"
                    variant="outline"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="developer@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input
                    id="github_url"
                    value={form.github_url}
                    onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    value={form.linkedin_url}
                    onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter_url">Twitter URL</Label>
                  <Input
                    id="twitter_url"
                    value={form.twitter_url}
                    onChange={(e) => setForm({ ...form, twitter_url: e.target.value })}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label htmlFor="is_active">Active (visible on About page)</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingDeveloper ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading developers...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {developers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">No developers found</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first team member.</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Developer
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            developers.map((developer) => (
              <Card key={developer.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={developer.image_url || undefined} alt={developer.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {developer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold">{developer.name}</h3>
                          <Badge variant="secondary">{developer.role}</Badge>
                          <Badge variant={developer.is_active ? "default" : "destructive"}>
                            {developer.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {developer.bio && (
                          <p className="text-muted-foreground mb-2">{developer.bio}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {developer.email && <span>📧 {developer.email}</span>}
                          {developer.github_url && <span>🔗 GitHub</span>}
                          {developer.linkedin_url && <span>🔗 LinkedIn</span>}
                          {developer.twitter_url && <span>🔗 Twitter</span>}
                          <span>📊 Order: {developer.display_order}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(developer)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Developer</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {developer.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(developer.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DevelopersManagement;
