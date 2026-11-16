"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Save,
  RefreshCw,
  X,
  Users,
  Globe,
} from "lucide-react";
import {
  AdminCard,
  SectionHeading,
  AdminButton,
  Eyebrow,
  HAIRLINE,
} from "@/components/admin/ui";

interface DocsConfigState {
  visibility: "ON" | "OFF" | "SCHEDULED";
  schedule_start: string;
  schedule_end: string;
  updated_at?: string | null;
  updated_by?: string | null;
}

interface TeamMember {
  id: number;
  full_name: string;
  role: string;
  email?: string;
  image_url?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  display_order: number;
  is_active?: boolean;
}

const DEFAULT_CONFIG: DocsConfigState = {
  visibility: "SCHEDULED",
  schedule_start: "2027-06-10T00:00",
  schedule_end: "2027-06-14T23:59",
};

export default function AdminDocsPage() {
  const [config, setConfig] = useState<DocsConfigState>(DEFAULT_CONFIG);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modal State for adding/editing team members
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberFormData, setMemberFormData] = useState<Partial<TeamMember>>({
    full_name: "",
    role: "",
    email: "",
    image_url: "",
    bio: "",
    linkedin_url: "",
    github_url: "",
    display_order: 0,
  });
  const [savingMember, setSavingMember] = useState(false);

  const API_BASE = useMemo(() => {
    if (typeof window !== "undefined") {
      return process.env.NEXT_PUBLIC_API_URL || "https://legal-copilot-backend-npq7.onrender.com";
    }
    return "https://legal-copilot-backend-npq7.onrender.com";
  }, []);

  const getAuthToken = (): string | null => {
    try {
      const stored = localStorage.getItem("app_auth_v2");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed.token || parsed.access_token || null;
    } catch {
      return null;
    }
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    const token = getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      // 1. Fetch Config
      const configRes = await fetch(`${API_BASE}/api/docs/config`, { headers });
      if (configRes.ok) {
        const data = await configRes.json();
        setConfig({
          visibility: data.visibility || "SCHEDULED",
          schedule_start: data.schedule_start ? data.schedule_start.slice(0, 16) : DEFAULT_CONFIG.schedule_start,
          schedule_end: data.schedule_end ? data.schedule_end.slice(0, 16) : DEFAULT_CONFIG.schedule_end,
          updated_at: data.updated_at,
          updated_by: data.updated_by,
        });
      }

      // 2. Fetch Team Members
      const teamRes = await fetch(`${API_BASE}/api/docs/admin/team`, { headers });
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        if (Array.isArray(teamData)) {
          setTeamMembers(teamData);
        }
      } else {
        // Fallback public team endpoint
        const publicTeamRes = await fetch(`${API_BASE}/api/docs/team`);
        if (publicTeamRes.ok) {
          const publicData = await publicTeamRes.json();
          if (Array.isArray(publicData)) setTeamMembers(publicData);
        }
      }
    } catch (err) {
      console.error("Failed to load docs admin data:", err);
      showToast("Failed to load latest configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/api/docs/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          visibility: config.visibility,
          schedule_start: config.schedule_start ? new Date(config.schedule_start).toISOString() : null,
          schedule_end: config.schedule_end ? new Date(config.schedule_end).toISOString() : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast("Documentation visibility & schedule saved successfully!");
        if (data.updated_at) setConfig((prev) => ({ ...prev, updated_at: data.updated_at }));
      } else {
        const err = await res.json();
        showToast(err.detail || "Failed to update configuration", "error");
      }
    } catch (err) {
      showToast("Network error saving configuration", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const openAddMemberModal = () => {
    setEditingMember(null);
    setMemberFormData({
      full_name: "",
      role: "",
      email: "",
      image_url: "",
      bio: "",
      linkedin_url: "",
      github_url: "",
      display_order: teamMembers.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditMemberModal = (member: TeamMember) => {
    setEditingMember(member);
    setMemberFormData({
      full_name: member.full_name,
      role: member.role,
      email: member.email || "",
      image_url: member.image_url || "",
      bio: member.bio || "",
      linkedin_url: member.linkedin_url || "",
      github_url: member.github_url || "",
      display_order: member.display_order,
    });
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormData.full_name || !memberFormData.role) {
      showToast("Name and Role are required", "error");
      return;
    }

    setSavingMember(true);
    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      if (editingMember) {
        // PUT update
        const res = await fetch(`${API_BASE}/api/docs/team/${editingMember.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(memberFormData),
        });
        if (res.ok) {
          showToast(`Updated ${memberFormData.full_name}`);
          setIsModalOpen(false);
          fetchData();
        } else {
          showToast("Failed to update member", "error");
        }
      } else {
        // POST add
        const res = await fetch(`${API_BASE}/api/docs/team`, {
          method: "POST",
          headers,
          body: JSON.stringify(memberFormData),
        });
        if (res.ok) {
          showToast(`Added ${memberFormData.full_name}`);
          setIsModalOpen(false);
          fetchData();
        } else {
          showToast("Failed to add member", "error");
        }
      }
    } catch {
      showToast("Network error saving team member", "error");
    } finally {
      setSavingMember(false);
    }
  };

  const handleDeleteMember = async (member: TeamMember) => {
    if (!confirm(`Are you sure you want to remove ${member.full_name}?`)) return;

    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/api/docs/team/${member.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        showToast(`Removed ${member.full_name}`);
        setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
      } else {
        showToast("Failed to delete member", "error");
      }
    } catch {
      showToast("Error deleting member", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold ${
            feedbackMsg.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {feedbackMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Eyebrow>LIVE DOCUMENTATION CONTROLLER</Eyebrow>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-(--text-primary)">
            Docs, Pitch Deck &amp; Team Manager
          </h1>
          <p className="text-xs text-(--text-muted) mt-1">
            Configure access control, schedule judging showcase windows, and manage team roster for /docs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/docs"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-(--text-primary) text-(--bg-primary) hover:opacity-90 shadow-sm"
          >
            <span>Preview /docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <AdminButton onClick={fetchData} variant="outline" disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </AdminButton>
        </div>
      </div>

      {/* Grid: Access Controls (Left) + Quick Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Access Control & Scheduling Panel */}
        <div className="lg:col-span-7 space-y-6">
          <AdminCard className="p-6 space-y-6">
            <SectionHeading
              title="Access Control & Publishing Schedule"
              sub="Control public availability for hackathon evaluators, investors, and general audience."
            />

            {/* Visibility Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-(--text-primary) uppercase tracking-wider">
                Visibility Mode
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: "ON",
                    label: "Public (ON)",
                    desc: "Accessible to anyone at /docs",
                    tone: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
                    activeTone: "ring-2 ring-emerald-500 bg-emerald-500/10 font-bold",
                  },
                  {
                    value: "SCHEDULED",
                    label: "Scheduled",
                    desc: "Accessible only in window",
                    tone: "border-blue-500/40 bg-blue-500/5 text-blue-700 dark:text-blue-400",
                    activeTone: "ring-2 ring-blue-500 bg-blue-500/10 font-bold",
                  },
                  {
                    value: "OFF",
                    label: "Private (OFF)",
                    desc: "Returns 403 Unavailable",
                    tone: "border-rose-500/40 bg-rose-500/5 text-rose-700 dark:text-rose-400",
                    activeTone: "ring-2 ring-rose-500 bg-rose-500/10 font-bold",
                  },
                ].map((mode) => {
                  const isSelected = config.visibility === mode.value;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setConfig((prev) => ({ ...prev, visibility: mode.value as any }))}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${mode.tone} ${
                        isSelected ? mode.activeTone : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{mode.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <p className="text-[10px] mt-1 opacity-80 leading-tight">{mode.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule Date & Time Windows */}
            <div className={`space-y-4 pt-4 border-t ${HAIRLINE} ${config.visibility !== "SCHEDULED" ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-(--text-primary) uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  Scheduled Availability Window (BST / UTC+6)
                </span>
                <span className="text-[11px] font-mono text-(--text-muted)">Default: June 10 &ndash; June 14</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-(--text-muted)">Start Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={config.schedule_start}
                    onChange={(e) => setConfig((prev) => ({ ...prev, schedule_start: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-(--bg-surface) border border-(--text-primary)/10 text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-(--text-primary)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-(--text-muted)">End Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={config.schedule_end}
                    onChange={(e) => setConfig((prev) => ({ ...prev, schedule_end: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-(--bg-surface) border border-(--text-primary)/10 text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-(--text-primary)"
                  />
                </div>
              </div>

              <p className="text-[11px] text-(--text-muted) leading-relaxed">
                When set to <strong>Scheduled</strong>, visitors accessing <code>/docs</code> outside this window will be shown a restricted showcase notice. Admins can always preview anytime.
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-(--text-muted)">
                {config.updated_at ? `Last saved: ${new Date(config.updated_at).toLocaleTimeString()}` : ""}
              </span>
              <AdminButton
                variant="solid"
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingConfig ? "Saving..." : "Save Visibility Settings"}</span>
              </AdminButton>
            </div>
          </AdminCard>
        </div>

        {/* Right: Status Pill & System Diagnostics */}
        <div className="lg:col-span-5 space-y-6">
          <AdminCard className="p-6 space-y-4">
            <SectionHeading title="Live Endpoint Status" sub="Telemetry for the public /docs route" />

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 flex items-center justify-between">
                <span className="text-(--text-muted)">Current Mode:</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">
                  {config.visibility}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 flex items-center justify-between">
                <span className="text-(--text-muted)">Public URL:</span>
                <Link
                  href="/docs"
                  target="_blank"
                  className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>/docs</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-3 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 flex items-center justify-between">
                <span className="text-(--text-muted)">Team Roster Count:</span>
                <span className="font-mono font-bold text-(--text-primary)">
                  {teamMembers.length} Members
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Judging &amp; Evaluation Tip</span>
              </div>
              <p className="leading-relaxed">
                During competition judging, leave mode set to <strong>ON</strong> or ensure the schedule covers the evaluation date. Any evaluator visiting will see live synchronized metrics.
              </p>
            </div>
          </AdminCard>
        </div>

      </div>

      {/* Bottom Section: Team Members Showcase Manager */}
      <AdminCard className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-(--text-primary)/10">
          <div>
            <h2 className="text-sm font-serif font-bold text-(--text-primary)">
              Team Members Showcase
            </h2>
            <p className="text-[11px] text-(--text-muted) mt-0.5">
              Add or update team profiles displayed in the YC Pitch Deck &amp; Team section.
            </p>
          </div>

          <AdminButton variant="solid" onClick={openAddMemberModal} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Team Member</span>
          </AdminButton>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden border border-(--text-primary)/15 bg-(--bg-card) flex items-center justify-center">
                  {member.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.image_url} alt={member.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm text-(--text-muted)">
                      {member.full_name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="text-center space-y-0.5">
                  <div className="font-bold text-xs text-(--text-primary) truncate">
                    {member.full_name}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                    {member.role}
                  </div>
                  {member.email && (
                    <div className="text-[10px] text-(--text-muted) truncate">{member.email}</div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-(--text-primary)/10 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditMemberModal(member)}
                  className="p-1.5 rounded-lg hover:bg-(--text-primary)/10 text-(--text-muted) hover:text-(--text-primary) transition-colors"
                  title="Edit member"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMember(member)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-(--text-muted) hover:text-rose-600 transition-colors"
                  title="Delete member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {teamMembers.length === 0 && !loading && (
            <div className="col-span-full py-10 text-center text-xs text-(--text-muted)">
              No custom team members added yet. Default demo members are being rendered on /docs.
            </div>
          )}
        </div>
      </AdminCard>

      {/* Team Member Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-(--bg-card) border border-(--text-primary)/15 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-(--text-primary)/10">
              <h3 className="font-bold text-sm text-(--text-primary)">
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-(--text-muted) hover:text-(--text-primary)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-(--text-primary)">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tasin Ahmed"
                  value={memberFormData.full_name || ""}
                  onChange={(e) => setMemberFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-(--text-primary)"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-(--text-primary)">Role in Application *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead AI Architect"
                  value={memberFormData.role || ""}
                  onChange={(e) => setMemberFormData((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-(--text-primary)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-(--text-primary)">Email Address</label>
                  <input
                    type="email"
                    placeholder="tasin@domain.com"
                    value={memberFormData.email || ""}
                    onChange={(e) => setMemberFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-(--text-primary)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-(--text-primary)">Display Order</label>
                  <input
                    type="number"
                    value={memberFormData.display_order ?? 0}
                    onChange={(e) => setMemberFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-(--text-primary)"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-(--text-primary)">Profile Picture URL (auto-resized)</label>
                <input
                  type="url"
                  placeholder="https://... image link"
                  value={memberFormData.image_url || ""}
                  onChange={(e) => setMemberFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-(--text-primary)"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-(--text-primary)">Bio / Summary</label>
                <textarea
                  rows={2}
                  placeholder="Brief background and expertise..."
                  value={memberFormData.bio || ""}
                  onChange={(e) => setMemberFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-(--text-primary)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-(--text-primary)">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={memberFormData.linkedin_url || ""}
                    onChange={(e) => setMemberFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-(--text-primary)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-(--text-primary)">GitHub Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={memberFormData.github_url || ""}
                    onChange={(e) => setMemberFormData((prev) => ({ ...prev, github_url: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-(--bg-surface) border border-(--text-primary)/10 text-(--text-primary) focus:outline-none focus:ring-1 focus:ring-(--text-primary)"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-(--text-primary)/10">
                <AdminButton variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </AdminButton>
                <AdminButton type="submit" variant="solid" disabled={savingMember}>
                  {savingMember ? "Saving..." : "Save Member"}
                </AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
