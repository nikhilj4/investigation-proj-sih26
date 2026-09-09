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

// --- 3. CASE WORKSPACE / CASE OVERVIEW ---
function CaseOverviewView() {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    api.get(`/cases/${caseId || 1}`)
      .then(res => setCaseData(res.data))
      .catch(() => {
        setCaseData({
          id: 1,
          case_number: 'FIR-2026-0891',
          title: 'Operation Phantom Wire',
          subtitle: 'Multi-State Financial Fraud',
          case_type: 'Financial Crime',
          status: 'Under Investigation',
          priority: 'High',
          creator_name: 'Agent D. Vance',
          summary: 'Investigation into a multi-state financial fraud syndicate utilizing shell entities, mule bank accounts, and encrypted communication channels to launder illicit funds exceeding $4.2M.'
        });
      });
  }, [caseId]);

  const cData = caseData || {};

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
              {cData?.case_number || 'FIR-2026-0891'}
            </span>
            <span>•</span>
            <span className="type-pill">{cData?.case_type || 'Financial Crime'}</span>
            <span>•</span>
            <span className="badge status-under-investigation">{cData?.status || 'Under Investigation'}</span>
            <span>•</span>
            <span className="badge priority-high">{cData?.priority || 'High'} Priority</span>
          </div>
        </div>

        <div className="case-head-right">
          <div>
            <button className="primary" style={{ marginRight: '8px' }}>
              <Plus size={16} />
              Add Evidence
            </button>
            <button className="secondary">Generate Report</button>
          </div>
          <small>Created on 12 Oct 2024 by <b>{cData?.creator_name || 'Agent D. Vance'}</b></small>
        </div>
      </div>

      {/* Case Tabs */}
      <div className="case-tabs">
        <button className="active">Overview</button>
        <button onClick={() => navigate(`/cases/${caseId}/info`)}>Case Information</button>
        <button onClick={() => navigate(`/cases/${caseId}/evidence`)}>Evidence (24)</button>
        <button onClick={() => navigate(`/cases/${caseId}/documents`)}>Documents ({cData?.document_count || 142})</button>
        <button onClick={() => navigate(`/cases/${caseId}/entities`)}>Entities ({cData?.entity_count || 19})</button>
        <button onClick={() => navigate(`/cases/${caseId}/network`)}>Network Graph</button>
        <button onClick={() => navigate(`/cases/${caseId}/timeline`)}>Timeline</button>
        <button onClick={() => navigate(`/cases/${caseId}/communications`)}>Communications</button>
        <button onClick={() => navigate(`/cases/${caseId}/financial`)}>Financial</button>
        <button onClick={() => navigate(`/cases/${caseId}/related`)}>Related Cases (3)</button>
      </div>

      {/* Case KPIs */}
      <div className="case-kpis">
        <div className="kpi">
          <div className="kpi-icon">
            <FileText size={20} />
          </div>
          <div>
            <div className="kpi-label">Indexed Documents</div>
            <div className="kpi-value">{cData?.document_count || 142}</div>
            <div className="kpi-detail positive">98.4% parsed</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-icon" style={{ background: '#ecfdf3', color: '#16a34a' }}>
            <Users size={20} />
          </div>
          <div>
            <div className="kpi-label">Extracted Entities</div>
            <div className="kpi-value">{cData?.entity_count || 19}</div>
            <div className="kpi-detail">4 Primary Suspects</div>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-icon" style={{ background: '#fff7e6', color: '#d97706' }}>
            <Share2 size={20} />
          </div>
          <div>
            <div className="kpi-label">Graph Connections</div>
            <div className="kpi-value">43</div>
            <div className="kpi-detail">12 High Confidence</div>
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
            <button className="text-btn">Edit Summary</button>
          </div>

          <p>
            {cData?.description || cData?.summary || 'Investigation into a multi-state financial fraud syndicate utilizing shell entities, mule bank accounts, and encrypted communication channels to launder illicit funds exceeding $4.2M. Key targets include international wire transfers routed through offshore accounts.'}
          </p>

          <div className="section-divider" />

          <h3>CASE METADATA & DETAILS</h3>
          <div className="details-grid">
            <div className="detail">
              <span>Primary Suspect</span>
              <b>Vikram Malhotra (Alias 'Phantom')</b>
            </div>
            <div className="detail">
              <span>Jurisdiction</span>
              <b>{cData?.station_name || 'Central Intelligence & Fraud Wing'}</b>
            </div>
            <div className="detail">
              <span>Lead Investigator</span>
              <b>{cData?.creator_name || 'Agent D. Vance'} (ID: INV-2026-001)</b>
            </div>
            <div className="detail">
              <span>Classification</span>
              <b>Confidential / Level 3 Clearance</b>
            </div>
            <div className="detail">
              <span>Date Opened</span>
              <b>12 October 2024</b>
            </div>
            <div className="detail">
              <span>Last Intelligence Sync</span>
              <b>{typeof cData?.updated_at === 'string' ? cData.updated_at.slice(0, 19) : '24 October 2024, 19:48 IST'}</b>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Tasks & Activity */}
        <div className="workspace-side">
          {/* Pending Tasks */}
          <div className="card side-card">
            <div className="side-title">
              <h2>Pending Action Items</h2>
              <Clock size={16} />
            </div>

            <div className="task">
              <div className="task-icon">
                <FileText size={16} />
              </div>
              <div className="task-text">
                <b>Review Subpoena Bank Records</b>
                <span>HDFC Account #908123</span>
              </div>
              <span className="badge priority-high">High</span>
            </div>

            <div className="task">
              <div className="task-icon">
                <Users size={16} />
              </div>
              <div className="task-text">
                <b>Verify Alias Connection</b>
                <span>Entity: Rahul Verma</span>
              </div>
              <span className="badge priority-medium">Medium</span>
            </div>

            <button className="view-all">
              View All Tasks →
            </button>
          </div>

          {/* Recent Activity */}
          <div className="card side-card activity-card">
            <div className="side-title">
              <h2>Recent Investigation Activity</h2>
              <ListTree size={16} />
            </div>

            <div className="activity-list">
              <div className="activity">
                <div className="dot" />
                <div>
                  <b>Document uploaded</b>
                  <span>Bank_Statement_Sept.pdf</span>
                </div>
                <time>19:48</time>
              </div>

              <div className="activity">
                <div className="dot green" />
                <div>
                  <b>Entity extracted</b>
                  <span>5 entities identified</span>
                </div>
                <time>19:42</time>
              </div>

              <div className="activity">
                <div className="dot amber" />
                <div>
                  <b>Relationship discovered</b>
                  <span>3 new connections</span>
                </div>
                <time>19:35</time>
              </div>
            </div>
          </div>
        </div>
      </div>
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
