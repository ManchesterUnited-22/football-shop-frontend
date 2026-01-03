'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hook/useAuth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Package, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { apiFetch } from '../../utils/apiFetch';

interface LowStockItem {
  id: number;
  stock: number;
  sizeValue: string;
  product: { name: string; slug: string };
}

interface SalesPerformanceItem {
  variantId: number;
  productName: string;
  sizeValue: string;
  totalSold: number;
}

interface Category {
  id: number;
  name: string;
}



const formatSize = (value: string): string => {
  if (!value || value.toUpperCase() === 'NONE') return '';
  return value;
};

const getLowStockChartData = (items: LowStockItem[]) => {
  return items.map(item => {
    const sizeString = formatSize(item.sizeValue);
    const label = `${item.product.name}${sizeString ? ` (${sizeString})` : ''}`;
    return { name: label, 'Tồn kho': item.stock };
  });
};

const getSalesChartData = (items: SalesPerformanceItem[]) => {
  return items.map(item => {
    const sizeString = formatSize(item.sizeValue);
    const label = `${item.productName}${sizeString ? ` (${sizeString})` : ''}`;
    return { name: label, 'Đã bán': item.totalSold };
  });
};

const InventoryReportPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Low Stock Report
  const [reportData, setReportData] = useState<LowStockItem[] | null>(null);
  const [threshold, setThreshold] = useState<number>(10);
  const [inputThreshold, setInputThreshold] = useState<string>('10');
  const [limit, setLimit] = useState<number>(20);
  const [inputLimit, setInputLimit] = useState<string>('20');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Sales Report
  const [salesReportData, setSalesReportData] = useState<SalesPerformanceItem[] | null>(null);
  const [salesType, setSalesType] = useState<'best' | 'worst'>('best');
  const [salesPeriod, setSalesPeriod] = useState<'allTime' | '7days' | '30days' | '6months' | 'year'>('30days');
  const [salesLimit, setSalesLimit] = useState<number>(10);
  const [inputSalesLimit, setInputSalesLimit] = useState<string>('10');

  // Restock Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LowStockItem | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);

  // Đồng bộ input với state khi giá trị thay đổi từ bên ngoài
  useEffect(() => {
    setInputThreshold(threshold.toString());
  }, [threshold]);

  useEffect(() => {
    setInputLimit(limit.toString());
  }, [limit]);

  useEffect(() => {
    setInputSalesLimit(salesLimit.toString());
  }, [salesLimit]);

  // Handlers áp dụng khi Enter hoặc blur
  const applyThreshold = () => {
    const value = parseInt(inputThreshold) || 10;
    setThreshold(Math.max(1, value));
  };

  const applyLimit = () => {
    const value = parseInt(inputLimit) || 20;
    setLimit(Math.max(1, Math.min(100, value)));
  };

  const applySalesLimit = () => {
    const value = parseInt(inputSalesLimit) || 10;
    setSalesLimit(Math.max(1, Math.min(50, value)));
  };

  // Modal handlers
  const handleOpenModal = (item: LowStockItem) => {
    setSelectedItem(item);
    setNewStockValue(item.stock + 10);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setNewStockValue(0);
  };

  const handleRestockSubmit = async () => {
    if (!selectedItem || newStockValue <= selectedItem.stock) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      setReportData(prev =>
        prev
          ? prev
              .map(item => (item.id === selectedItem.id ? { ...item, stock: newStockValue } : item))
              .filter(item => item.stock <= threshold)
          : null
      );

      alert(`✅ Đã cập nhật tồn kho cho "${selectedItem.product.name}" lên ${newStockValue} sản phẩm.`);
      handleCloseModal();
    } catch {
      setError('Lỗi khi cập nhật tồn kho.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch functions
  const fetchCategories = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCategories(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLowStockData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    let url = `${API_URL}/reports/low-stock?threshold=${threshold}&limit=${limit}`;
    if (selectedCategory) url += `&categoryId=${selectedCategory}`;

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Lỗi tải báo cáo tồn kho');
      setReportData(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchSalesData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoading(true);
    try {
      const url = `${API_URL}/reports/sales-performance?type=${salesType}&period=${salesPeriod}&limit=${salesLimit}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Lỗi tải báo cáo bán hàng');
      setSalesReportData(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchCategories();
      fetchLowStockData();
      fetchSalesData();
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, threshold, limit, selectedCategory, salesType, salesPeriod, salesLimit]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mb-6"></div>
          <p className="text-xl text-gray-600 font-medium">Đang tải báo cáo kho hàng...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <div className="p-8 text-center text-red-600 text-2xl">Vui lòng đăng nhập để xem báo cáo.</div>;
  if (error) return <div className="p-8 text-center text-red-600 text-xl">Lỗi: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-10 mb-10 border border-gray-200">
          <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tight text-center mb-4">
            Báo cáo kho & doanh thu
          </h1>
          <p className="text-center text-gray-600 text-lg">Theo dõi tồn kho và hiệu suất bán hàng theo thời gian thực</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {/* === BÁO CÁO TỒN KHO THẤP === */}
          <section className="bg-white rounded-3xl shadow-xl border border-red-200 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-red-100 rounded-2xl">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Tồn kho thấp</h2>
                <p className="text-gray-600">Cảnh báo sản phẩm sắp hết hàng</p>
              </div>
            </div>

            {/* Filters - Đã bỏ nút Áp dụng */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-red-50 rounded-2xl">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ngưỡng tồn kho thấp</label>
                <input
                  type="number"
                  min="1"
                  value={inputThreshold}
                  onChange={(e) => setInputThreshold(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyThreshold()}
                  onBlur={applyThreshold}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-red-500/30 focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng hiển thị</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={inputLimit}
                  onChange={(e) => setInputLimit(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyLimit()}
                  onBlur={applyLimit}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-red-500/30 focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lọc theo danh mục</label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-red-500/30 focus:border-red-500 bg-white transition"
                >
                  <option value="">Tất cả</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chart & List */}
            {reportData && reportData.length > 0 ? (
              <>
                <div className="h-96 mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold mb-4 text-center">Biểu đồ tồn kho thấp</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getLowStockChartData(reportData)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="6 6" label={{ value: `Ngưỡng: ${threshold}`, position: 'insideTop' }} />
                      <Bar dataKey="Tồn kho" fill="#ef4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {reportData.map(item => (
                    <div
                      key={item.id}
                      className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between hover:shadow-lg transition"
                    >
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {item.product.name}
                          {formatSize(item.sizeValue) && <span className="text-gray-600 ml-2">(Size {formatSize(item.sizeValue)})</span>}
                        </h4>
                        <p className="text-3xl font-black text-red-600 mt-2">{item.stock} sản phẩm</p>
                      </div>
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="flex items-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition shadow-md hover:scale-105"
                      >
                        <Plus className="w-6 h-6" />
                        Nhập hàng
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-emerald-50 rounded-2xl border border-emerald-200">
                <Package className="w-20 h-20 text-emerald-600 mx-auto mb-4" />
                <p className="text-2xl font-bold text-emerald-700">Tất cả sản phẩm đều có tồn kho an toàn!</p>
              </div>
            )}
          </section>

          {/* === BÁO CÁO DOANH THU === */}
          <section className="bg-white rounded-3xl shadow-xl border border-emerald-200 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-emerald-100 rounded-2xl">
                <TrendingUp className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">Hiệu suất bán hàng</h2>
                <p className="text-gray-600">Top sản phẩm bán chạy / kém</p>
              </div>
            </div>

            {/* Filters - Đã bỏ nút Áp dụng */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Loại báo cáo</label>
                <select
                  value={salesType}
                  onChange={(e) => setSalesType(e.target.value as 'best' | 'worst')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white transition"
                >
                  <option value="best">Bán chạy nhất</option>
                  <option value="worst">Bán kém nhất</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Khoảng thời gian</label>
                <select
                  value={salesPeriod}
                  onChange={(e) => setSalesPeriod(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white transition"
                >
                  <option value="7days">7 ngày qua</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="6months">6 tháng qua</option>
                  <option value="year">1 năm qua</option>
                  <option value="allTime">Toàn thời gian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng hiển thị</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={inputSalesLimit}
                  onChange={(e) => setInputSalesLimit(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applySalesLimit()}
                  onBlur={applySalesLimit}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Chart & List */}
            {salesReportData && salesReportData.length > 0 ? (
              <>
                <div className="h-96 mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold mb-4 text-center">
                    {salesType === 'best' ? 'Top sản phẩm bán chạy' : 'Sản phẩm bán kém'}
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getSalesChartData(salesReportData)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="Đã bán"
                        fill={salesType === 'best' ? '#10b981' : '#f59e0b'}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {salesReportData.map((item, index) => (
                    <div
                      key={item.variantId}
                      className={`p-6 rounded-2xl border ${salesType === 'best' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} hover:shadow-lg transition`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-3xl font-black text-gray-700 mr-4">#{index + 1}</span>
                          <span className="text-xl font-bold">
                            {item.productName}
                            {formatSize(item.sizeValue) && <span className="text-gray-600 ml-2">(Size {formatSize(item.sizeValue)})</span>}
                          </span>
                        </div>
                        <div className={`text-4xl font-black ${salesType === 'best' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.totalSold.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <p className="text-xl text-gray-500">Không có dữ liệu phù hợp với bộ lọc hiện tại.</p>
              </div>
            )}
          </section>
        </div>

        {/* Modal Nhập Hàng */}
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4">
              <h3 className="text-3xl font-black text-gray-900 mb-6 text-center">Nhập hàng nhanh</h3>

              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <p className="text-lg font-bold text-gray-900 mb-2">
                  {selectedItem.product.name}
                  {formatSize(selectedItem.sizeValue) && ` (Size ${formatSize(selectedItem.sizeValue)})`}
                </p>
                <p className="text-4xl font-black text-red-600">Tồn kho hiện tại: {selectedItem.stock}</p>
              </div>

              <label className="block text-lg font-bold text-gray-700 mb-3">Số lượng sau khi nhập</label>
              <input
                type="number"
                value={newStockValue}
                onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                min={selectedItem.stock + 1}
                className="w-full px-6 py-5 text-2xl font-bold text-center rounded-2xl border-2 border-emerald-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/30 mb-8"
              />

              <div className="flex gap-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-2xl transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRestockSubmit}
                  disabled={newStockValue <= selectedItem.stock}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black rounded-2xl transition shadow-xl disabled:opacity-60"
                >
                  Xác nhận nhập hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryReportPage;