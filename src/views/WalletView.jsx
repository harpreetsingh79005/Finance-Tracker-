import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Building, Banknote, TrendingUp, Wallet as WalletIcon, Coins, Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export function WalletView() {
  const { walletAssets, walletTotal, addAsset, updateAsset, deleteAsset } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [amount, setAmount] = useState('');

  const getIcon = (type) => {
    switch (type) {
      case 'bank': return <Building className="w-6 h-6 text-blue-400" />;
      case 'cash': return <Banknote className="w-6 h-6 text-green-400" />;
      case 'coins': return <Coins className="w-6 h-6 text-yellow-400" />;
      case 'investment': return <TrendingUp className="w-6 h-6 text-purple-400" />;
      default: return <WalletIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getGlow = (type) => {
    switch (type) {
      case 'bank': return 'shadow-[0_0_15px_rgba(96,165,250,0.2)] bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'cash': return 'shadow-[0_0_15px_rgba(74,222,128,0.2)] bg-green-500/10 border-green-500/20 text-green-400';
      case 'coins': return 'shadow-[0_0_15px_rgba(250,204,21,0.2)] bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'investment': return 'shadow-[0_0_15px_rgba(192,132,252,0.2)] bg-purple-500/10 border-purple-500/20 text-purple-400';
      default: return 'bg-muted border-border';
    }
  };

  const getHoverGlow = (type) => {
    switch (type) {
      case 'bank': return 'hover:shadow-[0_8px_30px_rgba(96,165,250,0.2)] hover:border-blue-500/40';
      case 'cash': return 'hover:shadow-[0_8px_30px_rgba(74,222,128,0.2)] hover:border-green-500/40';
      case 'coins': return 'hover:shadow-[0_8px_30px_rgba(250,204,21,0.2)] hover:border-yellow-500/40';
      case 'investment': return 'hover:shadow-[0_8px_30px_rgba(192,132,252,0.2)] hover:border-purple-500/40';
      default: return '';
    }
  };

  const handleOpenModal = (asset = null) => {
    if (asset) {
      setEditingId(asset.id);
      setName(asset.name);
      setType(asset.type);
      setAmount(asset.amount || 0);
    } else {
      setEditingId(null);
      setName('');
      setType('bank');
      setAmount('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const assetData = { name, type, amount: parseFloat(amount) || 0 };

    if (editingId) {
      await updateAsset(editingId, assetData);
    } else {
      await addAsset(assetData);
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset? This action cannot be undone.")) {
      await deleteAsset(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground">Overview of your complete net worth across all asset classes.</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      </div>

      <div className="flex justify-center py-6">
        <Card className="w-full max-w-2xl bg-gradient-to-br from-primary/20 to-purple-900/20 border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.15)] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
          <CardContent className="flex flex-col items-center justify-center p-12 text-center relative z-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">Total Net Worth</p>
            <h2 className="text-5xl md:text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-500">
              {formatCurrency(walletTotal)}
            </h2>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold tracking-tight border-b border-border/50 pb-2">Your Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {walletAssets.map((asset) => (
            <Card key={asset.id} className={`group hover:-translate-y-1 transition-all duration-300 relative ${getHoverGlow(asset.type)}`}>
              {/* Action Buttons (visible on hover) */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2 z-10">
                <button 
                  onClick={() => handleOpenModal(asset)}
                  className="p-1.5 rounded-md bg-slate-800/80 hover:bg-primary/80 text-gray-300 hover:text-white transition-colors border border-white/10"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(asset.id)}
                  className="p-1.5 rounded-md bg-slate-800/80 hover:bg-destructive/80 text-gray-300 hover:text-white transition-colors border border-white/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <CardContent className="p-6 flex flex-col h-full justify-center">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className={`p-3 rounded-xl inline-flex border ${getGlow(asset.type)} transition-colors duration-300`}>
                      {getIcon(asset.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{asset.name}</p>
                      <p className="text-2xl font-bold mt-1 tracking-tight">{formatCurrency(asset.balance)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add/Edit Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-slate-900 border border-primary/20 shadow-[0_0_40px_rgba(139,92,246,0.15)] relative">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6">
                {editingId ? 'Edit Asset' : 'Add New Asset'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-md px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="e.g. Robinhood Account"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Asset Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash / Wallet</option>
                    <option value="investment">Investment / Stocks</option>
                    <option value="coins">Crypto / Coins</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Initial Balance (Amount)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-md px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <Button type="button" variant="ghost" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                    {editingId ? 'Save Changes' : 'Add Asset'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
