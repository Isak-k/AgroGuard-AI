import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Loader2, Palette, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { diseaseCategoryService, isFirestorePermissionDenied } from '@/services/firestoreService';
import { mockDiseaseCategories, type DiseaseCategory } from '@/data/mockData';
import { toast } from 'sonner';

interface CategoryFormData {
  name: { en: string; om: string; am: string };
  description: { en: string; om: string; am: string };
  color: string;
  icon: string;
}

const emptyFormData: CategoryFormData = {
  name: { en: '', om: '', am: '' },
  description: { en: '', om: '', am: '' },
  color: '#6B7280',
  icon: 'Folder',
};

const availableColors = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', 
  '#EC4899', '#6B7280', '#059669', '#DC2626', '#7C3AED'
];

const availableIcons = [
  'Folder', 'Bug', 'Leaf', 'Microscope', 'Zap', 'Cloud', 
  'Shield', 'AlertTriangle', 'Activity', 'Target'
];

export function DiseaseCategoryManagement() {
  const [categories, setCategories] = useState<DiseaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      const data = await diseaseCategoryService.getAll();
      setCategories(data.length > 0 ? data : mockDiseaseCategories);
    } catch (error) {
      console.error('Error loading disease categories:', error);
      if (isFirestorePermissionDenied(error)) {
        setPermissionDenied(true);
        setCategories([]);
        toast.error('Firebase permissions blocked. Allow admin read/write to disease categories in Firestore rules.');
      } else {
        setCategories(mockDiseaseCategories);
      }
    }
    setLoading(false);
  };

  const handleEdit = (category: DiseaseCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this disease category?')) return;
    
    setDeleting(id);
    try {
      const success = await diseaseCategoryService.delete(id);
      if (success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success('Disease category deleted successfully');
      } else {
        toast.error('Failed to delete disease category');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin delete on disease categories.'
          : 'Failed to delete disease category'
      );
    }
    setDeleting(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.en.trim() || !formData.description.en.trim()) {
      toast.error('Please fill in required fields (English name and description)');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const success = await diseaseCategoryService.update(editingId, formData);
        if (success) {
          setCategories(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } : c));
          toast.success('Disease category updated successfully');
        } else {
          toast.error('Failed to update disease category');
        }
      } else {
        const newId = await diseaseCategoryService.create(formData);
        if (newId) {
          setCategories(prev => [...prev, { id: newId, ...formData }]);
          toast.success('Disease category created successfully');
        } else {
          toast.error('Failed to create disease category');
        }
      }
      resetForm();
    } catch (error) {
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin write to disease categories.'
          : 'Failed to save disease category'
      );
    }
    setSaving(false);
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Firestore permissions are blocking Disease Categories read/write for this account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-header">Disease Categories ({categories.length})</h2>
        <Button variant="farmer" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Category List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-farmer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: category.color }}
                >
                  <Tag className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{category.name?.en || 'Unnamed Category'}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {category.description?.en || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-xs text-muted-foreground">{category.icon}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(category)} disabled={deleting === category.id}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(category.id)}
                  disabled={deleting === category.id}
                >
                  {deleting === category.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-destructive" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={resetForm}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-card w-full max-w-lg max-h-[90vh] rounded-t-3xl p-6 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  {editingId ? 'Edit Category' : 'Add Category'}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name fields */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name (English) *</label>
                  <Input
                    value={formData.name.en}
                    onChange={e => setFormData(prev => ({ ...prev, name: { ...prev.name, en: e.target.value } }))}
                    placeholder="Category name in English"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name (Oromo)</label>
                    <Input
                      value={formData.name.om}
                      onChange={e => setFormData(prev => ({ ...prev, name: { ...prev.name, om: e.target.value } }))}
                      placeholder="Afaan Oromoo"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name (Amharic)</label>
                    <Input
                      value={formData.name.am}
                      onChange={e => setFormData(prev => ({ ...prev, name: { ...prev.name, am: e.target.value } }))}
                      placeholder="አማርኛ"
                    />
                  </div>
                </div>

                {/* Description fields */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (English) *</label>
                  <Textarea
                    value={formData.description.en}
                    onChange={e => setFormData(prev => ({ ...prev, description: { ...prev.description, en: e.target.value } }))}
                    placeholder="Category description in English"
                    rows={2}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Oromo)</label>
                    <Textarea
                      value={formData.description.om}
                      onChange={e => setFormData(prev => ({ ...prev, description: { ...prev.description, om: e.target.value } }))}
                      placeholder="Afaan Oromoo"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Amharic)</label>
                    <Textarea
                      value={formData.description.am}
                      onChange={e => setFormData(prev => ({ ...prev, description: { ...prev.description, am: e.target.value } }))}
                      placeholder="አማርኛ"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Category Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-foreground' : 'border-muted'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <Input
                    value={formData.color}
                    onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#6B7280"
                    className="mt-2"
                  />
                </div>

                {/* Icon Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                  >
                    {availableIcons.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="farmer" className="flex-1" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}