import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { diseaseService, chemicalService, diseaseCategoryService, isFirestorePermissionDenied } from '@/services/firestoreService';
import { mockDiseases, mockChemicals, mockDiseaseCategories, type Disease, type Chemical, type ChemicalTreatment, type DiseaseCategory } from '@/data/mockData';
import { toast } from 'sonner';

interface DiseaseFormData {
  name: { en: string; om: string; am: string };
  cropType: string;
  categoryId: string;
  featured: boolean;
  images: string[];
  symptoms: { en: string[]; om: string[]; am: string[] };
  treatments: ChemicalTreatment[];
}

const emptyFormData: DiseaseFormData = {
  name: { en: '', om: '', am: '' },
  cropType: '',
  categoryId: '',
  featured: false,
  images: [],
  symptoms: { en: [], om: [], am: [] },
  treatments: [],
};

export function DiseaseManagement() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [categories, setCategories] = useState<DiseaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DiseaseFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [symptomInputs, setSymptomInputs] = useState({ en: '', om: '', am: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      const [diseasesData, chemicalsData, categoriesData] = await Promise.all([
        diseaseService.getAll(),
        chemicalService.getAll(),
        diseaseCategoryService.getAll(),
      ]);
      // Use Firestore data or fallback to mock
      setDiseases(diseasesData.length > 0 ? diseasesData : mockDiseases);
      setChemicals(chemicalsData.length > 0 ? chemicalsData : mockChemicals);
      setCategories(categoriesData.length > 0 ? categoriesData : mockDiseaseCategories);
    } catch (error) {
      console.error('Error loading data:', error);
      if (isFirestorePermissionDenied(error)) {
        setPermissionDenied(true);
        setDiseases([]);
        setChemicals([]);
        setCategories([]);
        toast.error('Firebase permissions blocked. Allow admin read/write to diseases & chemicals in Firestore rules.');
      } else {
        setDiseases(mockDiseases);
        setChemicals(mockChemicals);
        setCategories(mockDiseaseCategories);
      }
    }
    setLoading(false);
  };

  const handleEdit = (disease: Disease) => {
    setEditingId(disease.id);
    setFormData({
      name: disease.name,
      cropType: disease.cropType,
      categoryId: disease.categoryId || '',
      featured: disease.featured || false,
      images: disease.images,
      symptoms: disease.symptoms,
      treatments: disease.treatments,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this disease?')) return;
    
    setDeleting(id);
    try {
      const success = await diseaseService.delete(id);
      if (success) {
        setDiseases(prev => prev.filter(d => d.id !== id));
        toast.success('Disease deleted successfully');
      } else {
        toast.error('Failed to delete disease');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin delete on diseases.'
          : 'Failed to delete disease'
      );
    }
    setDeleting(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.en.trim() || !formData.cropType.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const success = await diseaseService.update(editingId, formData);
        if (success) {
          setDiseases(prev => prev.map(d => d.id === editingId ? { ...d, ...formData } : d));
          toast.success('Disease updated successfully');
        } else {
          toast.error('Failed to update disease');
        }
      } else {
        const newId = await diseaseService.create(formData);
        if (newId) {
          setDiseases(prev => [...prev, { id: newId, ...formData }]);
          toast.success('Disease created successfully');
        } else {
          toast.error('Failed to create disease');
        }
      }
      resetForm();
    } catch (error) {
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin write to diseases.'
          : 'Failed to save disease'
      );
    }
    setSaving(false);
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingId(null);
    setShowForm(false);
    setSymptomInputs({ en: '', om: '', am: '' });
  };

  const addSymptom = (lang: 'en' | 'om' | 'am') => {
    const value = symptomInputs[lang].trim();
    if (!value) return;
    
    setFormData(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [lang]: [...prev.symptoms[lang], value]
      }
    }));
    setSymptomInputs(prev => ({ ...prev, [lang]: '' }));
  };

  const removeSymptom = (lang: 'en' | 'om' | 'am', index: number) => {
    setFormData(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [lang]: prev.symptoms[lang].filter((_, i) => i !== index)
      }
    }));
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
          Firestore permissions are blocking Diseases/Chemicals read/write for this account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-header">Manage Diseases ({diseases.length})</h2>
        <Button variant="farmer" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Disease
        </Button>
      </div>

      {/* Disease List */}
      <div className="space-y-3">
        {diseases.map((disease, index) => (
          <motion.div
            key={disease.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-farmer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">{disease.name?.en || 'Unnamed Disease'}</h3>
                  {disease.featured && (
                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full font-medium">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Crop: {disease.cropType || 'Unknown'}</p>
                {disease.categoryId && (
                  <p className="text-sm text-muted-foreground">
                    Category: {categories.find(c => c.id === disease.categoryId)?.name?.en || 'Unknown Category'}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {disease.symptoms?.en?.length || 0} symptoms • {disease.treatments?.length || 0} treatments
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(disease)} disabled={deleting === disease.id}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(disease.id)}
                  disabled={deleting === disease.id}
                >
                  {deleting === disease.id ? (
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
                  {editingId ? 'Edit Disease' : 'Add Disease'}
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
                    placeholder="Disease name in English"
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

                {/* Crop Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Crop Type *</label>
                  <Input
                    value={formData.cropType}
                    onChange={e => setFormData(prev => ({ ...prev, cropType: e.target.value }))}
                    placeholder="e.g., Potato, Tomato, Coffee"
                    required
                  />
                </div>

                {/* Disease Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Disease Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="">Select a category (optional)</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name?.en || 'Unnamed Category'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Featured Toggle */}
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={e => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="w-4 h-4 rounded border border-input bg-background checked:bg-primary checked:border-primary"
                    />
                    <div>
                      <span className="text-sm font-medium">Featured Disease</span>
                      <p className="text-xs text-muted-foreground">Show in "Common Diseases" section on home page</p>
                    </div>
                  </label>
                </div>

                {/* Symptoms */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Symptoms (English)</label>
                  <div className="flex gap-2">
                    <Input
                      value={symptomInputs.en}
                      onChange={e => setSymptomInputs(prev => ({ ...prev, en: e.target.value }))}
                      placeholder="Add symptom"
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSymptom('en'))}
                    />
                    <Button type="button" variant="outline" onClick={() => addSymptom('en')}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.symptoms.en.map((symptom, i) => (
                      <span key={i} className="badge-success flex items-center gap-1">
                        {symptom}
                        <button type="button" onClick={() => removeSymptom('en', i)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    value={formData.images[0] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, images: e.target.value ? [e.target.value] : [] }))}
                    placeholder="https://example.com/image.jpg"
                  />
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
