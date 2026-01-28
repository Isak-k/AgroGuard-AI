import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, Loader2, Package, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { marketService, chemicalService, isFirestorePermissionDenied } from '@/services/firestoreService';
import { mockMarkets, mockChemicals, type Market, type MarketChemical, type Chemical } from '@/data/mockData';
import { getRegions, getLocationsByRegion } from '@/data/ethiopiaLocations';
import { toast } from 'sonner';

interface MarketFormData {
  name: string;
  location: string;
  region: string;
  chemicals: MarketChemical[];
}

const emptyFormData: MarketFormData = {
  name: '',
  location: '',
  region: '',
  chemicals: [],
};

export function MarketManagement() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MarketFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showChemicalPicker, setShowChemicalPicker] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  
  const regions = getRegions();
  const locationsByRegion = selectedRegion ? getLocationsByRegion(selectedRegion) : [];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      const [marketsData, chemicalsData] = await Promise.all([
        marketService.getAll(),
        chemicalService.getAll(),
      ]);
      setMarkets(marketsData.length > 0 ? marketsData : mockMarkets);
      setChemicals(chemicalsData.length > 0 ? chemicalsData : mockChemicals);
    } catch (error) {
      console.error('Error loading data:', error);
      if (isFirestorePermissionDenied(error)) {
        setPermissionDenied(true);
        setMarkets([]);
        setChemicals([]);
        toast.error('Firebase permissions blocked. Allow admin read/write to markets & chemicals in Firestore rules.');
      } else {
        setMarkets(mockMarkets);
        setChemicals(mockChemicals);
      }
    }
    setLoading(false);
  };

  const handleEdit = (market: Market) => {
    setEditingId(market.id);
    // Find region from location if possible
    const region = regions.find(r => getLocationsByRegion(r.name).includes(market.location));
    if (region) {
      setSelectedRegion(region.name);
    }
    setFormData({
      name: market.name,
      location: market.location,
      region: market.region,
      chemicals: market.chemicals,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this market?')) return;
    
    setDeleting(id);
    try {
      const success = await marketService.delete(id);
      if (success) {
        setMarkets(prev => prev.filter(m => m.id !== id));
        toast.success('Market deleted successfully');
      } else {
        toast.error('Failed to delete market');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin delete on markets.'
          : 'Failed to delete market'
      );
    }
    setDeleting(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.location.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const success = await marketService.update(editingId, formData);
        if (success) {
          setMarkets(prev => prev.map(m => m.id === editingId ? { ...m, ...formData } : m));
          toast.success('Market updated successfully');
        } else {
          toast.error('Failed to update market');
        }
      } else {
        const newId = await marketService.create(formData);
        if (newId) {
          setMarkets(prev => [...prev, { id: newId, ...formData }]);
          toast.success('Market created successfully');
        } else {
          toast.error('Failed to create market');
        }
      }
      resetForm();
    } catch (error) {
      toast.error(
        isFirestorePermissionDenied(error)
          ? 'Firebase permissions blocked. Allow admin write to markets.'
          : 'Failed to save market'
      );
    }
    setSaving(false);
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingId(null);
    setShowForm(false);
    setShowChemicalPicker(false);
  };

  const addChemicalToMarket = (chemical: Chemical) => {
    const exists = formData.chemicals.some(c => c.chemicalId === chemical.id);
    if (exists) {
      toast.error('Chemical already added');
      return;
    }
    
    const newMarketChemical: MarketChemical = {
      chemicalId: chemical.id,
      chemicalName: chemical.name,
      price: 0,
      available: true,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    
    setFormData(prev => ({
      ...prev,
      chemicals: [...prev.chemicals, newMarketChemical],
    }));
    setShowChemicalPicker(false);
  };

  const updateChemicalPrice = (chemicalId: string, price: number) => {
    setFormData(prev => ({
      ...prev,
      chemicals: prev.chemicals.map(c => 
        c.chemicalId === chemicalId ? { ...c, price, lastUpdated: new Date().toISOString().split('T')[0] } : c
      ),
    }));
  };

  const toggleChemicalAvailability = (chemicalId: string) => {
    setFormData(prev => ({
      ...prev,
      chemicals: prev.chemicals.map(c => 
        c.chemicalId === chemicalId ? { ...c, available: !c.available } : c
      ),
    }));
  };

  const removeChemicalFromMarket = (chemicalId: string) => {
    setFormData(prev => ({
      ...prev,
      chemicals: prev.chemicals.filter(c => c.chemicalId !== chemicalId),
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
          Firestore permissions are blocking Markets read/write for this account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-header">Manage Markets ({markets.length})</h2>
        <Button variant="farmer" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Market
        </Button>
      </div>

      {/* Market List */}
      <div className="space-y-3">
        {markets.map((market, index) => (
          <motion.div
            key={market.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-farmer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{market.name}</h3>
                <p className="text-sm text-muted-foreground">{market.location}, {market.region}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">
                    {market.chemicals.length} chemicals • 
                    {market.chemicals.filter(c => c.available).length} in stock
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(market)} disabled={deleting === market.id}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(market.id)}
                  disabled={deleting === market.id}
                >
                  {deleting === market.id ? (
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
                  {editingId ? 'Edit Market' : 'Add Market'}
                </h3>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Market Name *</label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Haramaya Agricultural Center"
                    required
                  />
                </div>

                {/* Region Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Region
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={e => {
                      setSelectedRegion(e.target.value);
                      setFormData(prev => ({ ...prev, region: e.target.value, location: '' }));
                    }}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="">Select region</option>
                    {regions.map(region => (
                      <option key={region.name} value={region.name}>
                        {region.name} ({region.nameAmharic})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location *</label>
                  <select
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                    required
                    disabled={!selectedRegion}
                  >
                    <option value="">
                      {selectedRegion ? 'Select location' : 'Select region first'}
                    </option>
                    {locationsByRegion.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Chemicals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Chemicals & Prices</label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowChemicalPicker(true)}
                    >
                      <Plus className="w-3 h-3" /> Add
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.chemicals.map(chem => (
                      <div key={chem.chemicalId} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{chem.chemicalName}</p>
                        </div>
                        <Input
                          type="number"
                          value={chem.price}
                          onChange={e => updateChemicalPrice(chem.chemicalId, Number(e.target.value))}
                          className="w-24 h-8"
                          placeholder="ETB"
                        />
                        <Button
                          type="button"
                          variant={chem.available ? 'success' : 'outline'}
                          size="sm"
                          onClick={() => toggleChemicalAvailability(chem.chemicalId)}
                        >
                          {chem.available ? 'In Stock' : 'Out'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeChemicalFromMarket(chem.chemicalId)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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

              {/* Chemical Picker */}
              <AnimatePresence>
                {showChemicalPicker && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-card rounded-t-3xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold">Select Chemical</h4>
                      <Button variant="ghost" size="icon" onClick={() => setShowChemicalPicker(false)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                      {chemicals.map(chemical => (
                        <button
                          key={chemical.id}
                          type="button"
                          onClick={() => addChemicalToMarket(chemical)}
                          className="w-full p-3 text-left rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <p className="font-medium">{chemical.name}</p>
                          <p className="text-sm text-muted-foreground">{chemical.type}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
