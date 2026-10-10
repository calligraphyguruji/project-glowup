"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Cpu,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Briefcase,
  Building,
  Sparkles,
} from "lucide-react";
import { CompanyId, CompanyProfile, TargetRole, ExperienceLevel } from "@/types/audit";
import { COMPANY_PROFILES } from "@/lib/companies";
import { PREDEFINED_ROLES } from "@/lib/roles";

const STORAGE_KEY_CUSTOM_COMPANIES = "projectglowup_custom_companies_v1";
const STORAGE_KEY_CUSTOM_ROLES = "projectglowup_custom_roles_v1";

interface AuditFormProps {
  onAudit: (params: {
    repoUrl: string;
    companyId?: CompanyId;
    customCompany?: CompanyProfile;
    roleId?: string;
    customRole?: TargetRole;
  }) => void;
  isLoading: boolean;
}

export function AuditForm({ onAudit, isLoading }: AuditFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("razorpay");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("sde_intern");
  const [urlError, setUrlError] = useState<string | null>(null);

  // Custom profiles state (stored in localStorage)
  const [customCompanies, setCustomCompanies] = useState<CompanyProfile[]>([]);
  const [customRoles, setCustomRoles] = useState<TargetRole[]>([]);

  // Modals / Editors state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Company form inputs
  const [compName, setCompName] = useState("");
  const [compDomain, setCompDomain] = useState("");
  const [compTagline, setCompTagline] = useState("");
  const [compConcerns, setCompConcerns] = useState("");
  const [compWebsite, setCompWebsite] = useState("");
  const [editingCompId, setEditingCompId] = useState<string | null>(null);

  // Role form inputs
  const [roleTitle, setRoleTitle] = useState("");
  const [roleLevel, setRoleLevel] = useState<ExperienceLevel>("entry_level");
  const [roleFocusAreas, setRoleFocusAreas] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Load custom profiles from localStorage safely on mount
  useEffect(() => {
    try {
      const savedComps = localStorage.getItem(STORAGE_KEY_CUSTOM_COMPANIES);
      if (savedComps) {
        const parsed = JSON.parse(savedComps);
        if (Array.isArray(parsed)) setCustomCompanies(parsed);
      }
      const savedRoles = localStorage.getItem(STORAGE_KEY_CUSTOM_ROLES);
      if (savedRoles) {
        const parsed = JSON.parse(savedRoles);
        if (Array.isArray(parsed)) setCustomRoles(parsed);
      }
    } catch (e) {
      console.warn("Could not load custom profiles from localStorage:", e);
    }
  }, []);

  // Save changes to localStorage
  const saveCustomCompaniesToStorage = (updated: CompanyProfile[]) => {
    setCustomCompanies(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_COMPANIES, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed saving companies to localStorage:", e);
    }
  };

  const saveCustomRolesToStorage = (updated: TargetRole[]) => {
    setCustomRoles(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_ROLES, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed saving roles to localStorage:", e);
    }
  };

  // Find active profiles
  const allCompanies: CompanyProfile[] = [
    ...Object.values(COMPANY_PROFILES),
    ...customCompanies,
  ];
  const activeCompany =
    allCompanies.find((c) => c.id === selectedCompanyId) || COMPANY_PROFILES.razorpay;

  const allRoles: TargetRole[] = [...PREDEFINED_ROLES, ...customRoles];
  const activeRole =
    allRoles.find((r) => r.id === selectedRoleId) || PREDEFINED_ROLES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = repoUrl.trim();
    if (!trimmed) {
      setUrlError("Please specify a GitHub repository URI.");
      return;
    }
    if (!trimmed.startsWith("https://github.com/")) {
      setUrlError("Must be a public GitHub URL (e.g. https://github.com/owner/repo)");
      return;
    }
    setUrlError(null);

    const isCustomComp = activeCompany.isCustom;
    const isCustomRol = activeRole.isCustom;

    onAudit({
      repoUrl: trimmed,
      companyId: isCustomComp ? undefined : activeCompany.id,
      customCompany: isCustomComp ? activeCompany : undefined,
      roleId: isCustomRol ? undefined : activeRole.id,
      customRole: isCustomRol ? activeRole : undefined,
    });
  };

  const loadPreset = (presetUrl: string, presetCompany: CompanyId) => {
    setRepoUrl(presetUrl);
    setSelectedCompanyId(presetCompany);
    setSelectedRoleId("sde_intern");
    setUrlError(null);
    onAudit({
      repoUrl: presetUrl,
      companyId: presetCompany,
      roleId: "sde_intern",
    });
  };

  // Save / Update Custom Company
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;

    const id = editingCompId || `custom_${Date.now()}`;
    const concernsArray = compConcerns
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newCompany: CompanyProfile = {
      id,
      name: compName.trim(),
      domain: compDomain.trim() || "Technology / Platform",
      tagline: compTagline.trim() || "High Performance Architecture",
      keyConcerns: concernsArray.length > 0 ? concernsArray : ["Production reliability", "Concurrency safety"],
      sampleAntiPatterns: [],
      isCustom: true,
      website: compWebsite.trim() || undefined,
    };

    let updated: CompanyProfile[];
    if (editingCompId) {
      updated = customCompanies.map((c) => (c.id === editingCompId ? newCompany : c));
    } else {
      updated = [...customCompanies, newCompany];
    }

    saveCustomCompaniesToStorage(updated);
    setSelectedCompanyId(id);
    setShowCompanyModal(false);
    resetCompanyForm();
  };

  const resetCompanyForm = () => {
    setCompName("");
    setCompDomain("");
    setCompTagline("");
    setCompConcerns("");
    setCompWebsite("");
    setEditingCompId(null);
  };

  const handleDeleteCompany = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this custom company profile?")) {
      const updated = customCompanies.filter((c) => c.id !== id);
      saveCustomCompaniesToStorage(updated);
      if (selectedCompanyId === id) {
        setSelectedCompanyId("razorpay");
      }
    }
  };

  const handleEditCompany = (c: CompanyProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompName(c.name);
    setCompDomain(c.domain);
    setCompTagline(c.tagline);
    setCompConcerns(c.keyConcerns.join(", "));
    setCompWebsite(c.website || "");
    setEditingCompId(c.id);
    setShowCompanyModal(true);
  };

  // Save / Update Custom Role
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTitle.trim()) return;

    const id = editingRoleId || `custom_role_${Date.now()}`;
    const focusArray = roleFocusAreas
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newRole: TargetRole = {
      id,
      title: roleTitle.trim(),
      experienceLevel: roleLevel,
      focusAreas: focusArray.length > 0 ? focusArray : ["Production engineering standards"],
      description: roleDescription.trim() || undefined,
      isCustom: true,
    };

    let updated: TargetRole[];
    if (editingRoleId) {
      updated = customRoles.map((r) => (r.id === editingRoleId ? newRole : r));
    } else {
      updated = [...customRoles, newRole];
    }

    saveCustomRolesToStorage(updated);
    setSelectedRoleId(id);
    setShowRoleModal(false);
    resetRoleForm();
  };

  const resetRoleForm = () => {
    setRoleTitle("");
    setRoleLevel("entry_level");
    setRoleFocusAreas("");
    setRoleDescription("");
    setEditingRoleId(null);
  };

  const handleDeleteRole = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this custom target role?")) {
      const updated = customRoles.filter((r) => r.id !== id);
      saveCustomRolesToStorage(updated);
      if (selectedRoleId === id) {
        setSelectedRoleId("sde_intern");
      }
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Ingest Chassis */}
      <div className="rounded-xl bg-[#101114] border border-[#292A31] shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#FF666B] font-bold">PG-AUDIT&gt;</span>
              <span className="text-[#A3A4AD] uppercase tracking-wider text-[11px]">TARGET REPOSITORY URI</span>
            </div>
            <span className="text-[11px] text-[#A3A4AD] bg-[#17181D] px-2 py-0.5 rounded border border-[#292A31] font-mono">
              ⌘K / ENTER
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                if (urlError) setUrlError(null);
              }}
              placeholder="https://github.com/username/service-repository"
              className="flex-1 bg-[#17181D] px-3.5 py-2.5 rounded-lg text-sm text-[#F5F5F6] placeholder-[#747680] font-mono focus:outline-none focus:border-[#FF666B] border border-[#292A31] transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF666B] hover:bg-[#FF8588] text-[#08090B] font-sans font-bold text-xs shadow-[0_0_15px_rgba(255,102,107,0.3)] active:scale-95 disabled:bg-[#202127] disabled:text-[#747680] transition-all uppercase tracking-wider"
            >
              <Cpu className="w-4 h-4" />
              <span>{isLoading ? "Ingesting..." : "Analyze Repository →"}</span>
            </button>
          </div>

          {urlError && (
            <p className="text-xs text-[#FF666B] flex items-center gap-1.5 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              {urlError}
            </p>
          )}

          {/* Quick Presets Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 text-xs font-mono">
            <span className="text-[#747680] text-[11px] shrink-0 uppercase tracking-wider font-semibold">Presets:</span>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/expressjs/express", "razorpay")}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#17181D] hover:bg-[#202127] text-[#A3A4AD] hover:text-[#F5F5F6] text-[11px] border border-[#292A31] transition-colors"
            >
              <span className="text-[#FF666B]">⚡</span> Express.js → Razorpay (Ledger)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/fastify/fastify", "swiggy")}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#17181D] hover:bg-[#202127] text-[#A3A4AD] hover:text-[#F5F5F6] text-[11px] border border-[#292A31] transition-colors"
            >
              <span className="text-[#F5BD50]">⚡</span> Fastify → Swiggy (Spatial)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/tiangolo/fastapi", "zerodha")}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#17181D] hover:bg-[#202127] text-[#A3A4AD] hover:text-[#F5F5F6] text-[11px] border border-[#292A31] transition-colors"
            >
              <span className="text-[#38BDF8]">⚡</span> FastAPI → Zerodha (Locks)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("https://github.com/facebook/react", "amazon")}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#17181D] hover:bg-[#202127] text-[#A3A4AD] hover:text-[#F5F5F6] text-[11px] border border-[#292A31] transition-colors"
            >
              <span className="text-[#45D6A0]">⚡</span> React → AWS (Partitioning)
            </button>
          </div>
        </form>
      </div>

      {/* 2. Unified Target Profile Calibration Deck */}
      <div className="p-4 rounded-xl bg-[#101114] border border-[#292A31] shadow-sm space-y-4">
        {/* Profile Header & Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2026] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF666B]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F5F6]">
                AUDIT PROFILE &amp; EVALUATION CRITERIA
              </span>
            </div>
            <p className="text-[11px] text-[#A3A4AD] mt-0.5">
              Calibrate findings, concurrency testing, and technical interview questions to company &amp; role.
            </p>
          </div>

          {/* Active Profile Telemetry Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#17181D] border border-[#292A31] font-mono text-[11px]">
            <span className="text-[#FF666B] font-semibold">{activeCompany.name}</span>
            <span className="text-[#747680]">/</span>
            <span className="text-[#F5BD50]">{activeRole.title}</span>
            <span className="text-[#747680] text-[10px] uppercase">({activeRole.experienceLevel})</span>
          </div>
        </div>

        {/* Controls: Target Role Selector & Custom Role Button */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column A: Role & Level Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-[#A3A4AD] uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#F5BD50]" />
                Target Role
              </label>
              <button
                type="button"
                onClick={() => {
                  resetRoleForm();
                  setShowRoleModal(true);
                }}
                className="text-[10px] font-mono text-[#FF666B] hover:text-[#FF8588] flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Custom Role
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-[#17181D] px-3 py-2 rounded-lg text-xs font-mono text-[#F5F5F6] border border-[#292A31] focus:outline-none focus:border-[#FF666B] transition-colors"
              >
                <optgroup label="Predefined Roles">
                  {PREDEFINED_ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.experienceLevel})
                    </option>
                  ))}
                </optgroup>
                {customRoles.length > 0 && (
                  <optgroup label="Custom Roles">
                    {customRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.experienceLevel}) [Custom]
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {activeRole.isCustom && (
                <button
                  type="button"
                  onClick={(e) => handleDeleteRole(activeRole.id, e)}
                  title="Delete Custom Role"
                  className="p-2 rounded-lg bg-[#17181D] hover:bg-[#FF666B]/20 text-[#A3A4AD] hover:text-[#FF666B] border border-[#292A31] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[10px] font-mono text-[#747680] truncate">
              Focus: {activeRole.focusAreas.slice(0, 2).join(" · ")}
            </p>
          </div>

          {/* Column B: Company Profile Action & Custom Company Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-[#A3A4AD] uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#45D6A0]" />
                Company Invariant Standard
              </label>
              <button
                type="button"
                onClick={() => {
                  resetCompanyForm();
                  setShowCompanyModal(true);
                }}
                className="text-[10px] font-mono text-[#FF666B] hover:text-[#FF8588] flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Custom Company
              </button>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-[#17181D] px-3 py-2 rounded-lg text-xs font-mono text-[#F5F5F6] border border-[#292A31] focus:outline-none focus:border-[#FF666B] transition-colors"
              >
                <optgroup label="Production Calibrated">
                  {Object.values(COMPANY_PROFILES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.domain}
                    </option>
                  ))}
                </optgroup>
                {customCompanies.length > 0 && (
                  <optgroup label="Custom Profiles">
                    {customCompanies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.domain} [Custom]
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {activeCompany.isCustom && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleEditCompany(activeCompany, e)}
                    title="Edit Custom Company"
                    className="p-2 rounded-lg bg-[#17181D] hover:bg-[#202127] text-[#A3A4AD] hover:text-[#FF666B] border border-[#292A31] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteCompany(activeCompany.id, e)}
                    title="Delete Custom Company"
                    className="p-2 rounded-lg bg-[#17181D] hover:bg-[#FF666B]/20 text-[#A3A4AD] hover:text-[#FF666B] border border-[#292A31] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] font-mono text-[#747680] truncate">
              Concerns: {activeCompany.keyConcerns.slice(0, 2).join(" · ")}
            </p>
          </div>
        </div>

        {/* Quick Company Tiles (Built-in + Custom) */}
        <div>
          <span className="text-[10px] font-mono text-[#A3A4AD] uppercase tracking-wider block mb-2 font-semibold">
            SELECT INVARIANT PROFILE:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allCompanies.map((comp) => {
              const isSelected = selectedCompanyId === comp.id;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => setSelectedCompanyId(comp.id)}
                  disabled={isLoading}
                  className={`p-3 rounded-lg text-left transition-all relative border ${
                    isSelected
                      ? "bg-[#202127] border-[#FF666B] shadow-[0_0_12px_rgba(255,102,107,0.15)]"
                      : "bg-[#17181D] hover:bg-[#202127] border-[#292A31]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-xs font-bold ${isSelected ? "text-[#FF666B]" : "text-[#F5F5F6]"}`}>
                      {comp.name}
                    </span>
                    {comp.isCustom && (
                      <span className="text-[9px] font-mono px-1 rounded bg-[#292A31] text-[#A3A4AD]">
                        Custom
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#A3A4AD] block truncate">
                    {comp.domain}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Create/Edit Custom Company */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#101114] border border-[#292A31] rounded-xl p-6 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#292A31] pb-3">
              <span className="font-bold text-sm text-[#F5F5F6] uppercase tracking-wider">
                {editingCompId ? "Edit Company Profile" : "Create Custom Company Profile"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowCompanyModal(false);
                  resetCompanyForm();
                }}
                className="text-[#A3A4AD] hover:text-[#F5F5F6] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-[#A3A4AD] mb-1 font-medium">Company Name *</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. Stripe, OpenAI, MyStartup"
                  className="w-full bg-[#17181D] px-3 py-2 rounded-lg text-[#F5F5F6] placeholder-[#747680] border border-[#292A31] focus:outline-none focus:border-[#FF666B]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A3A4AD] mb-1 font-medium">Industry / Domain</label>
                <input
                  type="text"
                  value={compDomain}
                  onChange={(e) => setCompDomain(e.target.value)}
                  placeholder="e.g. Distributed Payments, Autonomous Robotics"
                  className="w-full bg-[#17181D] px-3 py-2 rounded-lg text-[#F5F5F6] placeholder-[#747680] border border-[#292A31] focus:outline-none focus:border-[#FF666B]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A3A4AD] mb-1 font-medium">Tagline / Mission</label>
                <input
                  type="text"
                  value={compTagline}
                  onChange={(e) => setCompTagline(e.target.value)}
                  placeholder="e.g. Financial infrastructure for the internet"
                  className="w-full bg-[#17181D] px-3 py-2 rounded-lg text-[#F5F5F6] placeholder-[#747680] border border-[#292A31] focus:outline-none focus:border-[#FF666B]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A3A4AD] mb-1 font-medium">
                  Key Architectural Concerns (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={compConcerns}
                  onChange={(e) => setCompConcerns(e.target.value)}
                  placeholder="e.g. Idempotency guards, Zero packet loss, Sub-10ms P99 latency"
                  className="w-full bg-[#17181D] px-3 py-2 rounded-lg text-[#F5F5F6] placeholder-[#747680] border border-[#292A31] focus:outline-none focus:border-[#FF666B]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A3A4AD] mb-1 font-medium">Website (optional)</label>
                <input
                  type="text"
                  value={compWebsite}
                  onChange={(e) => setCompWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-[#17181D] px-3 py-2 rounded-lg text-[#F5F5F6] placeholder-[#747680] border border-[#292A31] focus:outline-none focus:border-[#FF666B]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#292A31]">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompanyModal(false);
                    resetCompanyForm();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#17181D] hover:bg-[#202127] text-[#A3A4AD] hover:text-[#F5F5F6] border border-[#292A31] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#FF666B] hover:bg-[#ff7b80] text-[#08090B] font-bold transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Custom Target Role */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#101114] border border-[#292A31] rounded-xl p-6 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#292A31] pb-3">
              <span className="font-bold text-sm text-[#F5F5F6] uppercase tracking-wider">
                {editingRoleId ? "Edit Target Role" : "Create Custom Target Role"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowRoleModal(false);
                  resetRoleForm();
                }}
                className="text-[#A3A4AD] hover:text-[#F5F5F6] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-[#A3A4AD] mb-1 font-medium">Role Title *</label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Engineer, AI App Developer"
                  className="w-full bg-[#17181D] px-3 py-2 rounded-lg text-[#F5F5F6] placeholder-[#747680] border border-[#292A31] focus:outline-none focus:border-[#45D6A0]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A3A4AD] mb-1 font-medium">Seniority / Experience Level</label>
                <select
                  value={roleLevel}
                  onChange={(e) => setRoleLevel(e.target.value as ExperienceLevel)}
                  className="w-full bg-[#17181D] px-3 py-2 rounded-lg text-[#F5F5F6] border border-[#292A31] focus:outline-none focus:border-[#45D6A0]"
                >
                  <option value="internship">Internship</option>
                  <option value="entry_level">Entry Level (New Grad)</option>
                  <option value="junior">Junior (1-2 YoE)</option>
                  <option value="mid_level">Mid-Level (3-5 YoE)</option>
                  <option value="senior">Senior (5+ YoE)</option>
                  <option value="custom">Custom Experience</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#A3A4AD] mb-1 font-medium">
                  Focus Areas &amp; Invariants (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={roleFocusAreas}
                  onChange={(e) => setRoleFocusAreas(e.target.value)}
                  placeholder="e.g. Memory profiling, Event-driven streaming, Cache consistency"
                  className="w-full bg-[#17181D] px-3 py-2 rounded-lg text-[#F5F5F6] placeholder-[#747680] border border-[#292A31] focus:outline-none focus:border-[#45D6A0]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A3A4AD] mb-1 font-medium">Description / Notes (optional)</label>
                <textarea
                  rows={2}
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="e.g. Focuses on low-latency microservices and network safety"
                  className="w-full bg-[#17181D] px-3 py-2 rounded-lg text-[#F5F5F6] placeholder-[#747680] border border-[#292A31] focus:outline-none focus:border-[#45D6A0]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#292A31]">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false);
                    resetRoleForm();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#17181D] hover:bg-[#202127] text-[#A3A4AD] hover:text-[#F5F5F6] border border-[#292A31] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#45D6A0] hover:bg-[#52e8af] text-[#08090B] font-bold transition-colors"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
