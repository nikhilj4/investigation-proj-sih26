import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Bell,
  BarChart3,
  FolderOpen,
  FileText,
  Users,
  Share2,
  ListTree,
  Phone,
  WalletCards,
  Link2,
  Lightbulb,
  Sparkles,
  ClipboardCheck,
  Shield,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import api from './api';

// --- MAIN GLOBAL SIDEBAR ---
function MainSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCaseWorkspace = location.pathname.startsWith('/cases/');
  const currentCaseId = isCaseWorkspace ? location.pathname.split('/')[2] : null;

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const globalNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: '3' },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const caseWorkspaceItems = [
    { label: 'Overview', path: `/cases/${currentCaseId}`, icon: FolderOpen },
    { label: 'Case Information', path: `/cases/${currentCaseId}/info`, icon: FileText },
    { label: 'Evidence', path: `/cases/${currentCaseId}/evidence`, icon: Shield },
    { label: 'Documents', path: `/cases/${currentCaseId}/documents`, icon: FileText },
    { label: 'Entities', path: `/cases/${currentCaseId}/entities`, icon: Users },
    { label: 'Network', path: `/cases/${currentCaseId}/network`, icon: Share2 },
    { label: 'Timeline', path: `/cases/${currentCaseId}/timeline`, icon: ListTree },
    { label: 'Communications', path: `/cases/${currentCaseId}/communications`, icon: Phone },
    { label: 'Financial', path: `/cases/${currentCaseId}/financial`, icon: WalletCards },
    { label: 'Related Cases', path: `/cases/${currentCaseId}/related`, icon: Link2 },
    { label: 'Intelligence', path: `/cases/${currentCaseId}/intelligence`, icon: Lightbulb },
    { label: 'AI Assistant', path: `/cases/${currentCaseId}/ai`, icon: Sparkles },
    { label: 'Audit', path: `/cases/${currentCaseId}/audit`, icon: ClipboardCheck },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Shield size={20} />
        </div>
        <div>
          <div className="brand-title">INVESTIGATION</div>
          <div className="brand-sub">INTELLIGENCE PLATFORM</div>
        </div>
      </div>

      <div className="nav-label">CORE WORKSPACE</div>
      {globalNavItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-item ${isActive ? 'selected' : ''}`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
            {item.badge && <span className="notif">{item.badge}</span>}
          </button>
        );
      })}

      {isCaseWorkspace && (
        <>
          <div className="divider" />
          <div className="nav-label">CASE WORKSPACE</div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {caseWorkspaceItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`nav-item ${isActive ? 'selected' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="sidebar-bottom">
        <button onClick={() => navigate('/settings')} className="nav-item">
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button onClick={handleLogout} className="nav-item" style={{ color: '#dc2626' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

// --- GLOBAL TOP HEADER BAR ---
function HeaderBar({ user, station }: { user: any, station: any }) {
  const getInitials = (name: string) => {
    if (!name) return 'INV';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="topbar">
      <div className="global-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search cases, entities, documents, intelligence..."
        />
        <kbd>⌘K</kbd>
      </div>

      <div className="session">
        <div className="green-dot" />
        <div>
          <b>{station?.station_name || 'Central Command'}</b>
          <small>{user?.role || 'Level 3 Clearance'}</small>
        </div>
      </div>

      <div className="v-divider" />

      <div className="profile">
        <div className="avatar">{getInitials(user?.name)}</div>
        <div>
          <b>{user?.name || 'Agent D. Vance'}</b>
          <small>{user?.designation || 'Senior Investigator'}</small>
        </div>
      </div>
    </header>
  );
}

// --- 1. LOGIN VIEW ---
function LoginView({ onLoginSuccess }: { onLoginSuccess: (data: any) => void }) {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('INV-2026-001');
  const [password, setPassword] = useState('admin123');
  const [stationId, setStationId] = useState<number>(1);
  const [stations, setStations] = useState<any[]>([]);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    api.get('/auth/stations')
      .then(res => {
        setStations(res.data || []);
        if (res.data && res.data.length > 0) {
          setStationId(res.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.post('/auth/login', {
        employee_id: employeeId,
        station_id: Number(stationId),
        password: password
      });
      localStorage.setItem('token', res.data.access_token);
      onLoginSuccess(res.data);
      navigate('/dashboard');
    } catch (err: any) {
      setLoginError(err.response?.data?.detail || 'Authentication failed. Verify credentials.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '16px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div className="brand-mark" style={{ width: '48px', height: '48px', marginBottom: '12px' }}>
            <Shield size={24} />
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 750, color: '#172033', margin: 0 }}>INVESTIGATION INTELLIGENCE</h1>
          <p style={{ fontSize: '12px', color: '#7b8494', margin: '4px 0 0' }}>Secure Investigator Enclave</p>
        </div>

        {loginError && (
          <div style={{ background: '#fef2f2', border: '1px solid #dc2626', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
            {loginError}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#687386', marginBottom: '4px' }}>STATION / DIVISION</label>
            <select
              value={stationId}
              onChange={e => setStationId(Number(e.target.value))}
              style={{ width: '100%', height: '40px', padding: '0 12px', background: '#f8fafc', border: '1px solid #d8e0ea', borderRadius: '8px', fontSize: '13px', outline: 0 }}
            >
              {stations.map(st => (
                <option key={st.id} value={st.id}>
                  {st.station_name} ({st.station_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#687386', marginBottom: '4px' }}>INVESTIGATOR ID</label>
            <input
              type="text"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              style={{ width: '100%', height: '40px', padding: '0 12px', background: '#f8fafc', border: '1px solid #d8e0ea', borderRadius: '8px', fontSize: '13px', outline: 0 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#687386', marginBottom: '4px' }}>PASSPHRASE</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', height: '40px', padding: '0 12px', background: '#f8fafc', border: '1px solid #d8e0ea', borderRadius: '8px', fontSize: '13px', outline: 0 }}
            />
          </div>

          <button type="submit" className="primary" style={{ height: '40px', width: '100%', marginTop: '8px' }}>
            Authenticate Session
          </button>
        </form>
      </div>
    </div>
  );
}

// --- CREATE CASE MODAL ---
function CreateCaseModal({ isOpen, onClose, onCaseCreated }: { isOpen: boolean, onClose: () => void, onCaseCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [firNumber, setFirNumber] = useState('');
  const [caseType, setCaseType] = useState('FRAUD');
  const [priority, setPriority] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/cases', {
        title,
        fir_number: firNumber,
        case_type: caseType,
        priority,
        description,
        incident_location: incidentLocation
      });
      setSubmitting(false);
      onCaseCreated();
      onClose();
    } catch (err) {
      setSubmitting(false);
      alert('Failed to create case. Check fields.');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 100, display: 'grid', placeItems: 'center', padding: '16px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 750, color: '#172033' }}>Register New Investigation Case</h2>
          <button onClick={onClose} style={{ border: 0, background: 'transparent', color: '#7b8494' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#687386', marginBottom: '4px' }}>CASE TITLE *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Operation Phantom Wire"
              style={{ width: '100%', height: '40px', padding: '0 12px', background: '#fff', border: '1px solid #d8e0ea', borderRadius: '8px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#687386', marginBottom: '4px' }}>FIR NUMBER</label>
              <input
                type="text"
                value={firNumber}
                onChange={e => setFirNumber(e.target.value)}
                placeholder="FIR-00891/2026"
                style={{ width: '100%', height: '40px', padding: '0 12px', background: '#fff', border: '1px solid #d8e0ea', borderRadius: '8px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#687386', marginBottom: '4px' }}>CASE TYPE</label>
              <select
                value={caseType}
                onChange={e => setCaseType(e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 12px', background: '#fff', border: '1px solid #d8e0ea', borderRadius: '8px', fontSize: '13px' }}
              >
                <option value="FRAUD">Financial Fraud</option>
                <option value="CYBERCRIME">Cybercrime</option>
                <option value="NARCOTICS">Narcotics</option>
                <option value="ROBBERY">Organized Crime / Robbery</option>
                <option value="THEFT">Theft</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#687386', marginBottom: '4px' }}>PRIORITY LEVEL</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 12px', background: '#fff', border: '1px solid #d8e0ea', borderRadius: '8px', fontSize: '13px' }}
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#687386', marginBottom: '4px' }}>INCIDENT LOCATION</label>
              <input
                type="text"
                value={incidentLocation}
                onChange={e => setIncidentLocation(e.target.value)}
                placeholder="Metropolitan Office Hub"
                style={{ width: '100%', height: '40px', padding: '0 12px', background: '#fff', border: '1px solid #d8e0ea', borderRadius: '8px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#687386', marginBottom: '4px' }}>CASE DESCRIPTION / SYNOPSIS</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide executive case background..."
              style={{ width: '100%', padding: '8px 12px', background: '#fff', border: '1px solid #d8e0ea', borderRadius: '8px', fontSize: '13px', outline: 0 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="primary">
              {submitting ? 'Registering...' : 'Register Case Dossier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- 2. DASHBOARD / CASE REGISTRY ONLY ---
function DashboardView() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCases = () => {
    setLoading(true);
    api.get('/cases')
      .then(res => {
        setCases(res.data.cases || res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const sampleCases = [
    {
      id: 1,
      case_number: 'FIR-2026-0891',
      title: 'Operation Phantom Wire',
      subtitle: 'Multi-State Financial Fraud',
      case_type: 'Financial Crime',
      status: 'Under Investigation',
      priority: 'High',
      creator_name: 'Agent D. Vance',
      document_count: 142,
      entity_count: 19,
      relationships_count: 43,
      linked_cases_count: 3,
      updated_at: '24 Oct 2024\n19:48',
      alerts_count: 2
    },
    {
      id: 2,
      case_number: 'FIR-2026-0723',
      title: 'Metro Nexus',
      subtitle: 'Organized Crime Network',
      case_type: 'Organized Crime',
      status: 'Active',
      priority: 'High',
      creator_name: 'Priya Sharma',
      document_count: 87,
      entity_count: 26,
      relationships_count: 63,
      linked_cases_count: 5,
      updated_at: '24 Oct 2024\n17:32',
      alerts_count: 1
    },
    {
      id: 3,
      case_number: 'FIR-2026-0611',
      title: 'Silent Route',
      subtitle: 'Narcotics Investigation',
      case_type: 'Narcotics',
      status: 'Under Review',
      priority: 'High',
      creator_name: 'Arjun Mehta',
      document_count: 51,
      entity_count: 14,
      relationships_count: 29,
      linked_cases_count: 2,
      updated_at: '24 Oct 2024\n14:11',
      alerts_count: 0
    }
  ];

  const displayCases = cases.length > 0 ? cases : sampleCases;

  const filteredCases = displayCases.filter(c => {
    if (activeTab === 'MY' && c.creator_name !== 'Agent D. Vance') return false;
    if (activeTab === 'ACTIVE' && c.status !== 'Active' && c.status !== 'Under Investigation' && c.status !== 'REGISTERED') return false;
    if (activeTab === 'REVIEW' && c.status !== 'Under Review') return false;
    if (activeTab === 'CRITICAL' && c.priority !== 'High' && c.priority !== 'Critical' && c.priority !== 'CRITICAL' && c.priority !== 'HIGH') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = c.case_number?.toLowerCase().includes(q);
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchSub = c.subtitle?.toLowerCase().includes(q);
      const matchInv = c.creator_name?.toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchSub && !matchInv) return false;
    }

    if (typeFilter !== 'ALL' && c.case_type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;

    return true;
  });

  return (
    <div>
      <CreateCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCaseCreated={fetchCases}
      />

      {/* Page Header */}
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Case registry and investigation status</p>
        </div>

        <div className="head-actions">
          <div className="today">
            <Calendar size={18} />
            <div>
              <b>Today</b>
              <span>24 Oct 2024</span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="primary"
          >
            <Plus size={16} />
            <span>Create New Case</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-icon">
            <FolderOpen size={20} />
          </div>
          <div>
            <div className="kpi-label">Total Cases</div>
            <div className="kpi-value">{displayCases.length}</div>
            <div className="kpi-detail positive">+2 this month</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-icon" style={{ background: '#ecfdf3', color: '#16a34a' }}>
            <Shield size={20} />
          </div>
          <div>
            <div className="kpi-label">Active Cases</div>
            <div className="kpi-value">
              {displayCases.filter(c => c.status === 'Active' || c.status === 'REGISTERED' || c.status === 'Under Investigation').length}
            </div>
            <div className="kpi-detail">Ongoing investigation</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-icon" style={{ background: '#fff7e6', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="kpi-label">Under Review</div>
            <div className="kpi-value">4</div>
            <div className="kpi-detail">Pending clearance</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="kpi-label">Priority Cases</div>
            <div className="kpi-value">
              {displayCases.filter(c => c.priority === 'High' || c.priority === 'HIGH' || c.priority === 'CRITICAL').length}
            </div>
            <div className="kpi-detail" style={{ color: '#dc2626' }}>Requires immediate action</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-icon">
            <Link2 size={20} />
          </div>
          <div>
            <div className="kpi-label">Linked Cases</div>
            <div className="kpi-value">8</div>
            <div className="kpi-detail">Cross-jurisdictional</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-icon">
            <FileText size={20} />
          </div>
          <div>
            <div className="kpi-label">Total Documents</div>
            <div className="kpi-value">156</div>
            <div className="kpi-detail positive">+18 index updates</div>
          </div>
        </div>
      </div>

      {/* Case Registry Card */}
      <div className="card registry">
        {/* Tabs */}
        <div className="tabs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`tab ${activeTab === 'ALL' ? 'active' : ''}`}
          >
            All Cases ({displayCases.length})
          </button>
          <button
            onClick={() => setActiveTab('MY')}
            className={`tab ${activeTab === 'MY' ? 'active' : ''}`}
          >
            My Cases (6)
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`tab ${activeTab === 'ACTIVE' ? 'active' : ''}`}
          >
            Active Inquiries (5)
          </button>
          <button
            onClick={() => setActiveTab('REVIEW')}
            className={`tab ${activeTab === 'REVIEW' ? 'active' : ''}`}
          >
            Under Review (4)
          </button>
          <button
            onClick={() => setActiveTab('CRITICAL')}
            className={`tab ${activeTab === 'CRITICAL' ? 'active' : ''}`}
          >
            Critical / High (3)
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-search">
            <Search size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by case ID, title, investigator..."
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="ALL">Case Type: All</option>
            <option value="Financial Crime">Financial Crime</option>
            <option value="FRAUD">Financial Fraud</option>
            <option value="CYBERCRIME">Cyber Crime</option>
            <option value="NARCOTICS">Narcotics</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Status: All</option>
            <option value="Active">Active</option>
            <option value="REGISTERED">Registered</option>
            <option value="Under Review">Under Review</option>
            <option value="Under Investigation">Under Investigation</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">Priority: All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('ALL');
              setStatusFilter('ALL');
              setPriorityFilter('ALL');
            }}
            className="reset"
          >
            Reset
          </button>
        </div>

        {/* Table Wrap */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>CASE ID</th>
                <th>CASE OVERVIEW</th>
                <th>CASE TYPE</th>
                <th>STATUS</th>
                <th>PRIORITY</th>
                <th>ASSIGNED INVESTIGATOR</th>
                <th className="num">DOCS</th>
                <th className="num">ENTITIES</th>
                <th className="num">RELATIONSHIPS</th>
                <th className="num">LINKED</th>
                <th>LAST UPDATED</th>
                <th className="num">ALERTS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={13} style={{ textAlign: 'center', padding: '30px' }}>Loading cases...</td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={13} style={{ textAlign: 'center', padding: '40px' }}>
                    <FolderOpen size={32} style={{ margin: '0 auto 8px', color: '#8993a3' }} />
                    <div className="case-title">No cases found</div>
                    <div className="case-sub">Create a new case or adjust search filters.</div>
                  </td>
                </tr>
              ) : (
                filteredCases.map(c => (
                  <tr key={c.id} onClick={() => navigate(`/cases/${c.id}`)}>
                    <td>
                      <button className="case-link" onClick={() => navigate(`/cases/${c.id}`)}>
                        {c.case_number}
                      </button>
                    </td>
                    <td>
                      <div className="case-title">{c.title}</div>
                      <div className="case-sub">{c.subtitle || c.description || 'Active Case Dossier'}</div>
                    </td>
                    <td>
                      <span className="type-pill">{c.case_type || 'Financial Crime'}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        c.status === 'Active' || c.status === 'REGISTERED' ? 'status-active' :
                        c.status === 'Under Review' ? 'status-under-review' : 'status-under-investigation'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        c.priority === 'Critical' || c.priority === 'CRITICAL' ? 'priority-critical' :
                        c.priority === 'High' || c.priority === 'HIGH' ? 'priority-high' :
                        c.priority === 'Medium' || c.priority === 'MEDIUM' ? 'priority-medium' : 'priority-low'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <div className="assigned">
                        {c.creator_name || 'Agent D. Vance'}
                        <small>Senior Officer</small>
                      </div>
                    </td>
                    <td className="num">{c.document_count || 142}</td>
                    <td className="num">{c.entity_count || 19}</td>
                    <td className="num">{c.relationships_count || 43}</td>
                    <td className="num">{c.linked_cases_count || 3}</td>
                    <td className="updated">
                      {typeof c.updated_at === 'string' ? c.updated_at.slice(0, 10) : '24 Oct 2024'}
                      <span>19:48 IST</span>
                    </td>
                    <td className="alerts">
                      {c.alerts_count && c.alerts_count > 0 ? c.alerts_count : '-'}
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="open-btn"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="table-footer">
          <div>Showing 1 to {filteredCases.length} of {displayCases.length} entries</div>
          <div className="pagination">
            <button className="current">1</button>
            <button>2</button>
            <button>3</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- AUXILIARY CASE WORKSPACE SUB-VIEWS ---

function CaseInfoSubView({ caseData }: { caseData: any }) {
  return (
    <div className="card" style={{ padding: '28px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 750, color: '#172033' }}>Detailed Case File Information</h2>
      <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="detail">
          <span>FIR / Reference Number</span>
          <b>{caseData?.case_number || 'FIR-2026-0891'}</b>
        </div>
        <div className="detail">
          <span>Official Title</span>
          <b>{caseData?.title || 'Operation Phantom Wire'}</b>
        </div>
        <div className="detail">
          <span>Crime Category</span>
          <b>{caseData?.case_type || 'CYBERCRIME'}</b>
        </div>
        <div className="detail">
          <span>Investigation Status</span>
          <b>{caseData?.status || 'UNDER_INVESTIGATION'}</b>
        </div>
        <div className="detail">
          <span>Priority Rating</span>
          <b>{caseData?.priority || 'HIGH'}</b>
        </div>
        <div className="detail">
          <span>Assigned Police Station</span>
          <b>{caseData?.station_name || 'Central Command Station'}</b>
        </div>
        <div className="detail">
          <span>Primary Investigator</span>
          <b>{caseData?.creator_name || 'Agent D. Vance'}</b>
        </div>
        <div className="detail">
          <span>Incident Location</span>
          <b>{caseData?.incident_location || 'Metropolitan Financial Hub'}</b>
        </div>
      </div>
      <div className="section-divider" style={{ margin: '20px 0' }} />
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172033', marginBottom: '8px' }}>Full Case Synopsis</h3>
      <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
        {caseData?.description || 'Cross-jurisdictional shell company network laundering money via cryptocurrency exchanges and fake invoice payments across state borders. Requires active monitoring of bank accounts and communication logs.'}
      </p>
    </div>
  );
}

function CaseEvidenceSubView({ caseId }: { caseId: string }) {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      api.post(`/cases/${caseId}/upload`, formData);
    }
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 750, color: '#172033' }}>Chain of Custody Evidence Items (24)</h2>
        <label className="primary" style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Log New Evidence
          <input type="file" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EVIDENCE ID</th>
              <th>ITEM DESCRIPTION</th>
              <th>TYPE</th>
              <th>LOCATION FOUND</th>
              <th>SEIZED BY</th>
              <th>CUSTODY STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>EVD-8891-01</b></td>
              <td>Encrypted Mobile Handset (iPhone 14 Pro)</td>
              <td><span className="type-pill">Digital Device</span></td>
              <td>Suspect Premises A</td>
              <td>Inspector Rajesh Kumar</td>
              <td><span className="badge status-active">In Vault</span></td>
            </tr>
            <tr>
              <td><b>EVD-8891-02</b></td>
              <td>Hard Drive - Ledger Dump (4TB)</td>
              <td><span className="type-pill">Hardware Storage</span></td>
              <td>Shell Office Cyber hub</td>
              <td>Agent D. Vance</td>
              <td><span className="badge priority-high">Forensic Lab</span></td>
            </tr>
            <tr>
              <td><b>EVD-8891-03</b></td>
              <td>Forged Bank Stamp & Letterheads</td>
              <td><span className="type-pill">Physical Document</span></td>
              <td>Branch Office #4</td>
              <td>S. Officer Miller</td>
              <td><span className="badge status-active">In Vault</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CaseTimelineSubView() {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 750, color: '#172033' }}>Chronological Investigation Timeline</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid #e2e8f0', paddingLeft: '20px', marginLeft: '10px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>24 OCT 2024 • 19:48 IST</span>
          <h4 style={{ margin: '4px 0 2px', fontSize: '14px', color: '#172033' }}>Subpoena Financial Records Ingested</h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Bank statements ingested and parsed into vector chunks. 14 new transactions flagged.</p>
        </div>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>18 OCT 2024 • 11:20 IST</span>
          <h4 style={{ margin: '4px 0 2px', fontSize: '14px', color: '#172033' }}>Primary Suspect Identified</h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Vikram Malhotra linked to Shell Company A via matching passport record in FIR registry.</p>
        </div>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>12 OCT 2024 • 09:00 IST</span>
          <h4 style={{ margin: '4px 0 2px', fontSize: '14px', color: '#172033' }}>Case File Formally Registered</h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>FIR registered by Inspector Rajesh Kumar under Cybercrime & Financial Fraud Unit.</p>
        </div>
      </div>
    </div>
  );
}

function CaseCommunicationsSubView() {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 750, color: '#172033' }}>Intercepted Communications & Call Data Records</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>RECORD ID</th>
              <th>SOURCE NUMBER / ID</th>
              <th>DESTINATION</th>
              <th>DURATION</th>
              <th>INTERCEPT DATE</th>
              <th>FLAGGED KEYWORDS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>CDR-00912</b></td>
              <td>+91 98765 43210</td>
              <td>+91 91234 56789</td>
              <td>4m 12s</td>
              <td>23 Oct 2024</td>
              <td><span className="badge priority-critical">crypto transfer, wire</span></td>
            </tr>
            <tr>
              <td><b>CDR-00915</b></td>
              <td>+91 98765 43210</td>
              <td>+91 99887 76655</td>
              <td>12m 45s</td>
              <td>22 Oct 2024</td>
              <td><span className="badge priority-medium">invoice #402</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CaseFinancialSubView() {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 750, color: '#172033' }}>Financial Audit & Laundering Trace</h2>
      <div className="details-grid" style={{ marginBottom: '20px' }}>
        <div className="detail">
          <span>Total Fraud Volume</span>
          <b style={{ color: '#dc2626' }}>$4,250,000 USD</b>
        </div>
        <div className="detail">
          <span>Traced Accounts</span>
          <b>14 Accounts (4 Banks)</b>
        </div>
        <div className="detail">
          <span>Frozen Capital</span>
          <b style={{ color: '#16a34a' }}>$1,120,000 USD</b>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>TX HASH / ID</th>
              <th>SENDER ACCOUNT</th>
              <th>BENEFICIARY ACCOUNT</th>
              <th>AMOUNT</th>
              <th>TIMESTAMP</th>
              <th>RISK SCORE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>TX-990123</b></td>
              <td>HDFC Shell Corp A (#908123)</td>
              <td>Offshore Cayman Crypto Exchange</td>
              <td>$450,000</td>
              <td>24 Oct 2024 14:22</td>
              <td><span className="badge priority-critical">High Risk (98%)</span></td>
            </tr>
            <tr>
              <td><b>TX-990124</b></td>
              <td>Axis Bank Mule (#112049)</td>
              <td>HDFC Shell Corp A (#908123)</td>
              <td>$120,000</td>
              <td>23 Oct 2024 09:15</td>
              <td><span className="badge priority-high">Medium Risk (74%)</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CaseRelatedSubView() {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 750, color: '#172033' }}>Cross-Jurisdictional Linked Cases (3)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="card" style={{ padding: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ color: '#2563eb' }}>FIR-2026-0723: Metro Nexus Fraud Ring</b>
            <span className="badge priority-high">Shared Suspect: Vikram Malhotra</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0' }}>Overlapping mule account #908123 detected across Mumbai and Delhi branches.</p>
        </div>
        <div className="card" style={{ padding: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ color: '#2563eb' }}>FIR-2026-0611: Silent Route Crypto Syndicate</b>
            <span className="badge priority-medium">Shared Phone Target</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0' }}>Same encrypted Telegram channel handle found in device forensics dump.</p>
        </div>
      </div>
    </div>
  );
}

function NotificationsView() {
  return (
    <div className="card" style={{ padding: '28px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 750, color: '#172033' }}>System Intelligence Alerts</h1>
      <p style={{ margin: '0 0 20px', color: '#697386', fontSize: '13px' }}>Real-time cross-case match alerts and automated index sync status.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #dc2626' }}>
          <b style={{ color: '#dc2626' }}>CRITICAL MATCH: Suspect Entity Re-identification</b>
          <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0 0' }}>Vikram Malhotra was identified in newly uploaded document <span style={{ fontStyle: 'italic' }}>Bank_Statement_Sept.pdf</span> under FIR-2026-0891.</p>
          <small style={{ color: '#94a3b8' }}>10 minutes ago</small>
        </div>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #d97706' }}>
          <b style={{ color: '#d97706' }}>UNUSUAL TRANSACTION PATTERN DETECTED</b>
          <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0 0' }}>Wire transfer of $450,000 exceeds 30-day velocity baseline for HDFC Account #908123.</p>
          <small style={{ color: '#94a3b8' }}>1 hour ago</small>
        </div>
      </div>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="card" style={{ padding: '28px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 750, color: '#172033' }}>Investigation Reports & Executive Dossiers</h1>
      <p style={{ margin: '0 0 20px', color: '#697386', fontSize: '13px' }}>Generate court-admissible forensic dossiers, entity summaries, and timeline exports.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ padding: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Executive Case Brief</h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Summarizes FIR details, suspect graph, and evidence count for senior clearance officers.</p>
          <button className="primary"><FileText size={16} /> Export PDF Report</button>
        </div>
        <div className="card" style={{ padding: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Chain of Custody Audit Trail</h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Cryptographically signed audit trail of evidence access, uploads, and AI queries.</p>
          <button className="secondary"><ClipboardCheck size={16} /> Export Audit Log</button>
        </div>
      </div>
    </div>
  );
}

// --- DOCUMENT PREVIEW MODAL ---
function DocumentPreviewModal({ doc, caseId, onClose }: { doc: any; caseId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doc?.id) return;
    api.get(`/cases/${caseId}/documents/${doc.id}`)
      .then(res => {
        setDetail(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [doc, caseId]);

  if (!doc) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="card" style={{ width: '720px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', padding: '28px', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 750, color: '#172033' }}>{doc.original_name || doc.file_name}</h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Document ID #{doc.id} • Uploaded by {detail?.uploader_name || 'Investigator'}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 0, cursor: 'pointer', padding: '4px', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
          <div className="detail">
            <span>File Format</span>
            <b style={{ textTransform: 'uppercase' }}>{doc.file_type || 'PDF'}</b>
          </div>
          <div className="detail">
            <span>File Size</span>
            <b>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'N/A'}</b>
          </div>
          <div className="detail">
            <span>Processing Status</span>
            <b style={{ color: doc.processing_status === 'COMPLETED' ? '#16a34a' : '#d97706' }}>{doc.processing_status || 'COMPLETED'}</b>
          </div>
        </div>

        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172033', marginBottom: '8px' }}>Extracted Document Content & Summary</h3>
        <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.6, maxHeight: '300px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
          {loading ? 'Fetching extracted content...' : (detail?.extracted_text || doc.extracted_text || 'No text extracted for this evidence file yet.')}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <button className="secondary" onClick={onClose}>Close Preview</button>
        </div>
      </div>
    </div>
  );
}

function CaseDocumentsSubView({ caseId, onDocumentUploaded }: { caseId: string; onDocumentUploaded?: () => void }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = () => {
    setLoading(true);
    api.get(`/cases/${caseId}/documents`)
      .then(res => {
        setDocuments(res.data.documents || res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, [caseId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', 'EVIDENCE');

    try {
      await api.post(`/cases/${caseId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploading(false);
      fetchDocuments();
      if (onDocumentUploaded) onDocumentUploaded();
    } catch (err) {
      setUploading(false);
      alert('Failed to upload file. Ensure server backend is running.');
    }
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      {selectedDoc && (
        <DocumentPreviewModal
          doc={selectedDoc}
          caseId={caseId}
          onClose={() => setSelectedDoc(null)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 750, color: '#172033' }}>Case Evidence Documents ({documents.length})</h2>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Uploaded files, forensic reports, bank statements, and witness statements</span>
        </div>

        <label className="primary" style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> {uploading ? 'Uploading File...' : 'Upload Evidence Document'}
          <input type="file" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>DOCUMENT NAME</th>
              <th>TYPE</th>
              <th>FILE SIZE</th>
              <th>PARSED CHUNKS</th>
              <th>STATUS</th>
              <th>DATE ADDED</th>
              <th style={{ textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>Loading case documents...</td></tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#7b8494' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>No Evidence Documents Uploaded Yet</div>
                  <div style={{ fontSize: '12px', marginBottom: '16px' }}>Please upload PDF, Word, images, or bank statements to begin AI extraction and link analysis.</div>
                  <label className="primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
                    <Plus size={16} /> Choose File to Upload
                    <input type="file" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                  </label>
                </td>
              </tr>
            ) : (
              documents.map((doc: any) => (
                <tr key={doc.id}>
                  <td><b>{doc.original_name || doc.file_name}</b></td>
                  <td><span className="type-pill">{doc.document_type || doc.file_type?.toUpperCase() || 'EVIDENCE'}</span></td>
                  <td>{doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : '1.2 MB'}</td>
                  <td className="num">{doc.total_chunks || doc.chunk_count || 0}</td>
                  <td>
                    <span className={`badge ${doc.processing_status === 'COMPLETED' ? 'status-active' : 'status-under-review'}`}>
                      {doc.processing_status || 'COMPLETED'}
                    </span>
                  </td>
                  <td>{doc.uploaded_at ? doc.uploaded_at.slice(0, 10) : 'Just now'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="open-btn" onClick={() => setSelectedDoc(doc)}>
                      Preview File
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CaseEntitiesSubView({ caseId }: { caseId: string }) {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/cases/${caseId}/graph`)
      .then(res => {
        setEntities(res.data.nodes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [caseId]);

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 750, color: '#172033' }}>Extracted Entities & Suspects ({entities.length})</h2>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ENTITY LABEL</th>
              <th>TYPE</th>
              <th>MENTION COUNT</th>
              <th>CONFIDENCE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>Extracting entities...</td></tr>
            ) : entities.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#7b8494' }}>No extracted entities found for this case. Upload documents to auto-extract suspect entities.</td></tr>
            ) : (
              entities.map((ent: any) => (
                <tr key={ent.id}>
                  <td><b>{ent.label}</b></td>
                  <td><span className="type-pill">{ent.type}</span></td>
                  <td className="num">{ent.mention_count || 1}</td>
                  <td><span className="badge status-active">High Confidence</span></td>
                  <td><span className="badge priority-medium">Verified</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CaseNetworkSubView({ caseId }: { caseId: string }) {
  const [graphData, setGraphData] = useState<any>({ nodes: [], edges: [] });

  useEffect(() => {
    api.get(`/cases/${caseId}/graph`)
      .then(res => setGraphData(res.data))
      .catch(() => {});
  }, [caseId]);

  return (
    <div className="card" style={{ padding: '24px', minHeight: '400px' }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 750, color: '#172033' }}>Entity-Relationship Intelligence Graph</h2>
      <p style={{ fontSize: '13px', color: '#5b6577', marginBottom: '20px' }}>
        Showing {graphData.nodes?.length || 0} extracted nodes and {graphData.edges?.length || 0} interconnected relationship edges across case evidence.
      </p>

      {graphData.nodes?.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '1px border #e3e8ef', borderRadius: '10px', height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Share2 size={36} className="text-[#94a3b8]" />
          <b style={{ color: '#64748b' }}>No Graph Links Extracted Yet</b>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Upload evidence files under the 'Documents' tab to construct the suspect entity graph.</span>
        </div>
      ) : (
        <div style={{ background: '#f8fafc', border: '1px border #e3e8ef', borderRadius: '10px', height: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Share2 size={40} className="text-[#2563eb]" />
          <b style={{ color: '#172033' }}>Interactive Link Analysis Graph Active</b>
          <span style={{ fontSize: '12px', color: '#7b8494' }}>Nodes: {graphData.nodes?.map((n: any) => n.label).join(', ')}</span>
        </div>
      )}
    </div>
  );
}

function CaseAiAssistantSubView({ caseId }: { caseId: string }) {
  const [messages, setMessages] = useState<any[]>([
    { role: 'ASSISTANT', content: 'Greetings Investigator. I am your Evidence-Grounded AI Assistant. Ask me anything regarding documents, wire transfers, or suspect connections in this case dossier.' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || sending) return;
    const userText = inputMsg;
    setInputMsg('');
    setMessages(prev => [...prev, { role: 'USER', content: userText }]);
    setSending(true);

    try {
      const res = await api.post(`/cases/${caseId}/chat`, { message: userText });
      setSending(false);
      setMessages(prev => [...prev, { role: 'ASSISTANT', content: res.data.answer, sources: res.data.sources }]);
    } catch (err) {
      setSending(false);
      setMessages(prev => [...prev, { role: 'ASSISTANT', content: 'Analyzed case records: Please upload evidence files to query AI RAG index.' }]);
    }
  };

  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '500px' }}>
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 750, color: '#172033' }}>Evidence-Grounded RAG AI Assistant</h2>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e3e8ef', maxHeight: '360px' }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ alignSelf: m.role === 'USER' ? 'flex-end' : 'flex-start', maxWidth: '80%', background: m.role === 'USER' ? '#2563eb' : '#fff', color: m.role === 'USER' ? '#fff' : '#172033', padding: '12px 16px', borderRadius: '10px', border: m.role === 'USER' ? '0' : '1px solid #e3e8ef', fontSize: '13px', lineHeight: 1.5 }}>
            <b>{m.role === 'USER' ? 'You' : 'AI Investigation Engine'}:</b>
            <div style={{ marginTop: '4px' }}>{m.content}</div>
          </div>
        ))}
        {sending && <div style={{ fontSize: '12px', color: '#7b8494' }}>Querying neural vector index and case knowledge base...</div>}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputMsg}
          onChange={e => setInputMsg(e.target.value)}
          placeholder="Ask AI assistant about financial transfers, evidence summary, or entities..."
          style={{ flex: 1, height: '42px', padding: '0 14px', background: '#fff', border: '1px solid #d8e0ea', borderRadius: '8px', fontSize: '13px', outline: 0 }}
        />
        <button type="submit" disabled={sending} className="primary" style={{ height: '42px' }}>
          Query AI
        </button>
      </form>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="card" style={{ padding: '28px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 750, color: '#172033' }}>Platform & Security Settings</h1>
      <p style={{ margin: '0 0 20px', color: '#697386', fontSize: '13px' }}>Manage agency node endpoints, vector index parameters, and officer clearance credentials.</p>
      <div className="details-grid" style={{ maxWidth: '600px' }}>
        <div className="detail">
          <span>API Backend URL</span>
          <b>http://localhost:8000/api/v1</b>
        </div>
        <div className="detail">
          <span>Database Connection</span>
          <b style={{ color: '#16a34a' }}>MySQL Active (Connected)</b>
        </div>
        <div className="detail">
          <span>Vector Index Engine</span>
          <b>Hybrid Vector & BM25 Active</b>
        </div>
      </div>
    </div>
  );
}

// --- CASE WORKSPACE MAIN WRAPPER ---
function CaseOverviewView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState<any>(null);

  const fetchCaseDetails = () => {
    api.get(`/cases/${caseId || 1}`)
      .then(res => setCaseData(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  const cData = caseData || {};
  const currentTab = location.pathname.split('/')[3] || 'overview';
  const docCount = cData?.document_count ?? 0;
  const entityCount = cData?.entity_count ?? 0;

  return (
    <div>
      {/* Case Header */}
      <button onClick={() => navigate('/dashboard')} className="back">
        ← Back to Case Registry
      </button>

      <div className="case-head">
        <div>
          <h1>{cData?.title || 'Operation Phantom Wire'}</h1>
          <div className="case-meta">
            <span className="case-id">
              <Shield size={14} />
              {cData?.case_number || 'CASE-2026-00000'}
            </span>
            <span>•</span>
            <span className="type-pill">{cData?.case_type || 'CYBERCRIME'}</span>
            <span>•</span>
            <span className="badge status-under-investigation">{cData?.status || 'ACTIVE'}</span>
            <span>•</span>
            <span className="badge priority-high">{cData?.priority || 'MEDIUM'} Priority</span>
          </div>
        </div>

        <div className="case-head-right">
          <div>
            <button className="primary" style={{ marginRight: '8px' }} onClick={() => navigate(`/cases/${caseId}/documents`)}>
              <Plus size={16} />
              Add Evidence
            </button>
            <button className="secondary" onClick={() => navigate('/reports')}>Generate Report</button>
          </div>
          <small>Created by <b>{cData?.creator_name || 'Inspector Rajesh Kumar'}</b></small>
        </div>
      </div>

      {/* Case Tabs Navigation */}
      <div className="case-tabs">
        <button className={currentTab === 'overview' ? 'active' : ''} onClick={() => navigate(`/cases/${caseId}`)}>Overview</button>
        <button className={currentTab === 'info' ? 'active' : ''} onClick={() => navigate(`/cases/${caseId}/info`)}>Case Information</button>
        <button className={currentTab === 'evidence' ? 'active' : ''} onClick={() => navigate(`/cases/${caseId}/evidence`)}>Evidence ({docCount})</button>
        <button className={currentTab === 'documents' ? 'active' : ''} onClick={() => navigate(`/cases/${caseId}/documents`)}>Documents ({docCount})</button>
        <button className={currentTab === 'entities' ? 'active' : ''} onClick={() => navigate(`/cases/${caseId}/entities`)}>Entities ({entityCount})</button>
        <button className={currentTab === 'network' ? 'active' : ''} onClick={() => navigate(`/cases/${caseId}/network`)}>Network Graph</button>
        <button className={currentTab === 'timeline' ? 'active' : ''} onClick={() => navigate(`/cases/${caseId}/timeline`)}>Timeline</button>
        <button className={currentTab === 'communications' ? 'active' : ''} onClick={() => navigate(`/cases/${caseId}/communications`)}>Communications</button>
        <button className={currentTab === 'financial' ? 'active' : ''} onClick={() => navigate(`/cases/${caseId}/financial`)}>Financial</button>
        <button className={currentTab === 'related' ? 'active' : ''} onClick={() => navigate(`/cases/${caseId}/related`)}>Related Cases</button>
        <button className={currentTab === 'ai' ? 'active' : ''} onClick={() => navigate(`/cases/${caseId}/ai`)}>AI Assistant</button>
      </div>

      {/* Render Active Tab Sub View */}
      {currentTab === 'info' ? (
        <CaseInfoSubView caseData={cData} />
      ) : currentTab === 'evidence' ? (
        <CaseEvidenceSubView caseId={caseId || '1'} />
      ) : currentTab === 'documents' ? (
        <CaseDocumentsSubView caseId={caseId || '1'} onDocumentUploaded={fetchCaseDetails} />
      ) : currentTab === 'entities' ? (
        <CaseEntitiesSubView caseId={caseId || '1'} />
      ) : currentTab === 'network' ? (
        <CaseNetworkSubView caseId={caseId || '1'} />
      ) : currentTab === 'timeline' ? (
        <CaseTimelineSubView />
      ) : currentTab === 'communications' ? (
        <CaseCommunicationsSubView />
      ) : currentTab === 'financial' ? (
        <CaseFinancialSubView />
      ) : currentTab === 'related' ? (
        <CaseRelatedSubView />
      ) : currentTab === 'ai' ? (
        <CaseAiAssistantSubView caseId={caseId || '1'} />
      ) : (
        <>
          {/* Default Overview Case KPIs */}
          <div className="case-kpis">
            <div className="kpi">
              <div className="kpi-icon">
                <FileText size={20} />
              </div>
              <div>
                <div className="kpi-label">Indexed Documents</div>
                <div className="kpi-value">{docCount}</div>
                <div className="kpi-detail positive">{docCount > 0 ? '100% Parsed' : '0 Documents Uploaded'}</div>
              </div>
            </div>

            <div className="kpi">
              <div className="kpi-icon" style={{ background: '#ecfdf3', color: '#16a34a' }}>
                <Users size={20} />
              </div>
              <div>
                <div className="kpi-label">Extracted Entities</div>
                <div className="kpi-value">{entityCount}</div>
                <div className="kpi-detail">{entityCount > 0 ? `${entityCount} Identified` : 'Pending Document Ingestion'}</div>
              </div>
            </div>

            <div className="kpi">
              <div className="kpi-icon" style={{ background: '#fff7e6', color: '#d97706' }}>
                <Share2 size={20} />
              </div>
              <div>
                <div className="kpi-label">Graph Connections</div>
                <div className="kpi-value">{entityCount > 1 ? Math.floor(entityCount * 1.5) : 0}</div>
                <div className="kpi-detail">{entityCount > 1 ? 'High Confidence' : 'No Connections Yet'}</div>
              </div>
            </div>
          </div>

          {/* Workspace Main Grid */}
          <div className="workspace-grid">
            {/* Left Column: Summary & Details */}
            <div className="card summary">
              <div className="section-title">
                <div>
                  <FolderOpen size={18} />
                  <h2>Executive Case Summary</h2>
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
                {cData?.description || 'No synopsis provided for this case file.'}
              </p>

              <div className="section-divider" />

              <h3>CASE METADATA & DETAILS</h3>
              <div className="details-grid">
                <div className="detail">
                  <span>Assigned Station</span>
                  <b>{cData?.station_name || 'Central Command Station'}</b>
                </div>
                <div className="detail">
                  <span>Lead Investigator</span>
                  <b>{cData?.creator_name || 'Inspector Rajesh Kumar'}</b>
                </div>
                <div className="detail">
                  <span>Incident Location</span>
                  <b>{cData?.incident_location || 'Not Specified'}</b>
                </div>
                <div className="detail">
                  <span>Classification</span>
                  <b>Level 3 Confidential Clearance</b>
                </div>
                <div className="detail">
                  <span>Date Created</span>
                  <b>{cData?.created_at ? cData.created_at.slice(0, 10) : '24 October 2024'}</b>
                </div>
                <div className="detail">
                  <span>Last Intelligence Sync</span>
                  <b>{cData?.updated_at ? cData.updated_at.slice(0, 19) : 'Just now'}</b>
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar Tasks & Activity */}
            <div className="workspace-side">
              {/* Pending Tasks */}
              <div className="card side-card">
                <div className="side-title">
                  <h2>Required Investigation Actions</h2>
                  <Clock size={16} />
                </div>

                {docCount === 0 ? (
                  <div style={{ padding: '12px 0', fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>
                    ⚠️ Action Required: Upload primary FIR or bank statement documents to trigger AI parsing and vector extraction.
                  </div>
                ) : (
                  <div className="task">
                    <div className="task-icon">
                      <FileText size={16} />
                    </div>
                    <div className="task-text">
                      <b>Review Ingested Evidence</b>
                      <span>{docCount} files ready</span>
                    </div>
                    <span className="badge priority-high">High</span>
                  </div>
                )}
              </div>
              {/* Recent Activity */}
              <div className="card side-card activity-card">
                <div className="side-title">
                  <h2>Recent Activity Log</h2>
                  <ListTree size={16} />
                </div>
                <div className="activity-list">
                  <div className="activity">
                    <div className="dot green" />
                    <div>
                      <b>Case Dossier Registered</b>
                      <span>{cData?.case_number || 'New Case'}</span>
                    </div>
                    <time>Just now</time>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


// --- GLOBAL SEARCH PAGE VIEW ---
function GlobalSearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(res.data.results || []);
      setSearching(false);
    } catch (err) {
      setSearching(false);
    }
  };

  return (
    <div className="card" style={{ padding: '28px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 750, color: '#172033' }}>Cross-Case Intelligence Search</h1>
      <p style={{ margin: '0 0 20px', color: '#697386', fontSize: '13px' }}>Perform hybrid semantic and keyword search across all indexed evidence documents and entities.</p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by suspect name, phone number, vehicle plate, or transaction hash..."
          style={{ flex: 1, height: '44px', padding: '0 16px', background: '#f8fafc', border: '1px solid #d8e0ea', borderRadius: '8px', fontSize: '14px', outline: 0 }}
        />
        <button type="submit" className="primary" style={{ height: '44px' }}>
          <Search size={18} /> Search Intelligence
        </button>
      </form>

      {searching ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#7b8494' }}>Executing hybrid vector & BM25 search across case index...</div>
      ) : results.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {results.map((r, i) => (
            <div key={i} className="card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1d4ed8' }}>{r.document_name}</div>
              <div style={{ fontSize: '11px', color: '#7b8494', marginTop: '2px' }}>Case Number: {r.case_number} | Match Score: {(r.hybrid_score * 100).toFixed(1)}%</div>
              <p style={{ fontSize: '13px', color: '#374151', margin: '8px 0 0', lineHeight: 1.5 }}>{r.content}</p>
            </div>
          ))}
        </div>
      ) : query ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#7b8494' }}>No matching evidence chunks found. Try another query keyword.</div>
      ) : null}
    </div>
  );
}

// --- 4. APP COMPONENT & ROUTER ROUTING ---
export default function App() {
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUserSession(res.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginView onLoginSuccess={(data) => setUserSession(data)} />
          }
        />

        {/* Main Application Layout using custom CSS architecture */}
        <Route
          path="*"
          element={
            <div className="app">
              <MainSidebar />
              <div className="main">
                <HeaderBar user={userSession?.user} station={userSession?.station} />
                <div className="content">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardView />} />
                    <Route path="/search" element={<GlobalSearchView />} />
                    <Route path="/notifications" element={<NotificationsView />} />
                    <Route path="/reports" element={<ReportsView />} />
                    <Route path="/settings" element={<SettingsView />} />
                    <Route path="/cases/:caseId" element={<CaseOverviewView />} />
                    <Route path="/cases/:caseId/*" element={<CaseOverviewView />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
