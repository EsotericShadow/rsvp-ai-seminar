'use client';

import { useState, useEffect } from 'react';
import AdminNavigation from '@/components/admin/AdminNavigation';
import TemplateEditor from '@/components/admin/TemplateEditor';

interface CampaignTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<CampaignTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState('all');
  const [variantFilter, setVariantFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<CampaignTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch templates on component mount
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/admin/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
          setFilteredTemplates(data);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTemplates();
  }, []);

  // Save template function
  const handleSaveTemplate = async (updatedTemplate: Partial<CampaignTemplate>) => {
    if (!editingTemplate) return;

    try {
      const response = await fetch(`/api/admin/templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTemplate),
      });

      if (response.ok) {
        // Update the template in the local state
        setTemplates(prev => 
          prev.map(t => 
            t.id === editingTemplate.id 
              ? { ...t, ...updatedTemplate, updatedAt: new Date().toISOString() }
              : t
          )
        );
        setEditingTemplate(null);
        
        // Refresh the filtered templates
        const updatedTemplates = templates.map(t => 
          t.id === editingTemplate.id 
            ? { ...t, ...updatedTemplate, updatedAt: new Date().toISOString() }
            : t
        );
        setFilteredTemplates(updatedTemplates);
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  // Get unique industries from template names
  const industries = Array.from(new Set(
    templates.map(t => {
      const match = t.name.match(/^([^-]+)/);
      return match ? match[1].trim() : 'Unknown';
    })
  )).sort();

  // Get unique email numbers
  const emailNumbers = Array.from(new Set(
    templates.map(t => {
      const match = t.name.match(/Email (\d+)/);
      return match ? match[1] : null;
    }).filter(Boolean)
  )).sort((a, b) => parseInt(a!) - parseInt(b!));

  // Get unique variants
  const variants = Array.from(new Set(
    templates.map(t => {
      if (t.name.includes('Variant A')) return 'A';
      if (t.name.includes('Variant B')) return 'B';
      if (t.name.includes('Variant C')) return 'C';
      return 'Original';
    })
  )).sort();

  // Filter and sort templates
  useEffect(() => {
    let filtered = templates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().startsWith(industryFilter.toLowerCase())
      );
    }

    // Email number filter
    if (emailFilter !== 'all') {
      filtered = filtered.filter(t => 
        t.name.includes(`Email ${emailFilter}`)
      );
    }

    // Variant filter
    if (variantFilter !== 'all') {
      if (variantFilter === 'Original') {
        filtered = filtered.filter(t => 
          !t.name.includes('Variant')
        );
      } else {
        filtered = filtered.filter(t => 
          t.name.includes(`Variant ${variantFilter}`)
        );
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'subject':
          aValue = a.subject;
          bValue = b.subject;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updated':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, searchTerm, industryFilter, emailFilter, variantFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm('');
    setIndustryFilter('all');
    setEmailFilter('all');
    setVariantFilter('all');
  };

  const getTemplateStats = () => {
    const total = templates.length;
    const byIndustry = industries.reduce((acc, industry) => {
      acc[industry] = templates.filter(t => 
        t.name.toLowerCase().startsWith(industry.toLowerCase())
      ).length;
      return acc;
    }, {} as Record<string, number>);

    return { total, byIndustry };
  };

  const stats = getTemplateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
          <p className="text-gray-600">Manage and organize your campaign email templates</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Template Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-800">Total Templates</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{industries.length}</div>
              <div className="text-sm text-green-800">Industries</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{emailNumbers.length}</div>
              <div className="text-sm text-purple-800">Email Sequences</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{variants.length}</div>
              <div className="text-sm text-orange-800">A/B/C Variants</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry} ({stats.byIndustry[industry]})
                  </option>
                ))}
              </select>
            </div>

            {/* Email Number Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email #
              </label>
              <select
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Emails</option>
                {emailNumbers.map(emailNum => (
                  <option key={emailNum} value={emailNum!}>
                    Email {emailNum}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variant
              </label>
              <select
                value={variantFilter}
                onChange={(e) => setVariantFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Variants</option>
                {variants.map(variant => (
                  <option key={variant} value={variant}>
                    Variant {variant}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="subject">Subject</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear all filters
            </button>
            <div className="text-sm text-gray-600">
              Showing {filteredTemplates.length} of {templates.length} templates
            </div>
          </div>
        </div>

        {/* Templates List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Templates</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 mb-2">{template.subject}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {template.name.split(' - ')[0]}
                      </span>
                      {template.name.match(/Email (\d+)/) && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          Email {template.name.match(/Email (\d+)/)![1]}
                        </span>
                      )}
                      {template.name.includes('Variant') && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {template.name.includes('Variant A') ? 'Variant A' :
                           template.name.includes('Variant B') ? 'Variant B' :
                           template.name.includes('Variant C') ? 'Variant C' : 'Variant'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTemplate(template);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <div className="text-sm text-gray-500">
                      <div>Created: {new Date(template.createdAt).toLocaleDateString()}</div>
                      <div>Updated: {new Date(template.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold">{selectedTemplate.name}</h2>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Subject Line</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedTemplate.subject}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">HTML Content</h3>
                    <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedTemplate.htmlBody}
                      </pre>
                    </div>
                  </div>
                  {selectedTemplate.textBody && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Text Content</h3>
                      <div className="bg-gray-50 p-4 rounded">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedTemplate.textBody}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Editor Modal */}
        {editingTemplate && (
          <TemplateEditor
            template={editingTemplate}
            onSave={handleSaveTemplate}
            onCancel={() => setEditingTemplate(null)}
          />
        )}
        </div>
      </div>
    </div>
  );
}
