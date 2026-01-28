import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chemicalService, isFirestorePermissionDenied } from '@/services/firestoreService';
import { mockChemicals, type Chemical } from '@/data/mockData';
import { toast } from 'sonner';

interface ChemicalFormData {
  name: string;
  type: string;
  activeIngredient: string;
  dosage: string;
  safetyInstructions: { en: string; om: string; am: string };
}

const emptyFormData: ChemicalFormData = {
  name: '',
  type: '',
  activeIngredient: '',
  dosage: '',
  safetyInstructions: { en: '', om: '', am: '' },
};

const chemicalTypes = ['Fungicide', 'Insecticide', 'Herbicide', 'Bactericide', 'Nematicide'];

export function ChemicalManagement() {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChemicalFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      const data = await chemicalService.getAll();
      setChemicals(data.length > 0 ? data : mockChemicals);
    } catch (error) {
      console.error('Error loading chemicals:', error);
      if (isFirestorePermissionDenied(error)) {
        setPermissionDenied(true);
        setChemicals([]);
        toast.error('Firebase permissions blocked. Allow admin read/write to chemicals in Firestore rules.');
      } else {
        setChemicals(mockChemicals);
      }
    }
    setLoading(false);
  };

  const handleEdit = (chemical: Chemical) => {
    setEditingId(chemical.id);
    setFormData({
      name: chemical.name,
      type: chemical.type,
      activeIngredient: chemical.activeIngredient,
      dosage: chemical.dosage,
      safetyInstructions: chemical.safetyInstructions,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this chemical?')) return;
    
    setDeleting(id);
    try {
      const success = await chemicalService.delete(id);
      if (success) {
        setChemicals(prev => prev.filter(c => c.id !== id));
        toast.success('Chemical deleted successfully');
      } else {
        toast.error('Failed to delete chemical');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin delete on chemicals.'
          : 'Failed to delete chemical'
      );
    }
    setDeleting(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.type.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const success = await chemicalService.update(editingId, formData);
        if (success) {
          setChemicals(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } : c));
          toast.success('Chemical updated successfully');
        } else {
          toast.error('Failed to update chemical');
        }
      } else {
        const newId = await chemicalService.create(formData);
        if (newId) {
          setChemicals(prev => [...prev, { id: newId, ...formData }]);
          toast.success('Chemical created successfully');
        } else {
          toast.error('Failed to create chemical');
        }
      }
      resetForm();
    } catch (error) {
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin write to chemicals.'
          : 'Failed to save chemical'
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
          Firestore permissions are blocking Chemicals read/write for this account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-header">Manage Chemicals ({chemicals.length})</h2>
        <Button variant="farmer" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Chemical
        </Button>
      </div>

      {/* Chemical List */}
      <div className="space-y-3">
        {chemicals.map((chemical, index) => (
          <motion.div
            key={chemical.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-farmer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{chemical.name}</h3>
                <p className="text-sm text-muted-foreground">Type: {chemical.type}</p>
                <p className="text-sm text-muted-foreground">Active: {chemical.activeIngredient}</p>
                <p className="text-sm text-primary font-medium">Dosage: {chemical.dosage}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(chemical)} disabled={deleting === chemical.id}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(chemical.id)}
                  disabled={deleting === chemical.id}
                >
                  {deleting === chemical.id ? (
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
                  {editingId ? 'Edit Chemical' : 'Add Chemical'}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chemical Name *</label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Ridomil Gold MZ"
                    required
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                    required
                  >
                    <option value="">Select type</option>
                    {chemicalTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Active Ingredient */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Active Ingredient</label>
                  <Input
                    value={formData.activeIngredient}
                    onChange={e => setFormData(prev => ({ ...prev, activeIngredient: e.target.value }))}
                    placeholder="e.g., Metalaxyl-M + Mancozeb"
                  />
                </div>

                {/* Dosage */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dosage</label>
                  <Input
                    value={formData.dosage}
                    onChange={e => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="e.g., 2.5 kg/ha"
                  />
                </div>

                {/* Safety Instructions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Safety Instructions (English)</label>
                  <Textarea
                    value={formData.safetyInstructions.en}
                    onChange={e => setFormData(prev => ({ 
                      ...prev, 
                      safetyInstructions: { ...prev.safetyInstructions, en: e.target.value } 
                    }))}
                    placeholder="Safety instructions in English"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Safety (Oromo)</label>
                    <Textarea
                      value={formData.safetyInstructions.om}
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        safetyInstructions: { ...prev.safetyInstructions, om: e.target.value } 
                      }))}
                      placeholder="Afaan Oromoo"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Safety (Amharic)</label>
                    <Textarea
                      value={formData.safetyInstructions.am}
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        safetyInstructions: { ...prev.safetyInstructions, am: e.target.value } 
                      }))}
                      placeholder="አማርኛ"
                      rows={2}
                    />
                  </div>
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
