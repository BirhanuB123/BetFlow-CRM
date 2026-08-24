"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  X,
  MapPin,
  Sparkles,
  Layers,
  Building,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Zap,
  Car,
  Droplets,
  Video,
  ExternalLink,
  ChevronRight,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { apiFetch, apiUpload, API_BASE_URL } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

const PROJECT_STATUSES = [
  "PLANNING",
  "ACTIVE",
  "SELLING",
  "COMPLETED",
  "ON_HOLD",
] as const;

type ApiProject = {
  id: string;
  name: string;
  description: string | null;
  category?: string;
  location?: string | null;
  subCity?: string | null;
  constructionStage?: string;
  progressPercentage?: number;
  estimatedDelivery?: string | null;
  coverImage?: string | null;
  gallery?: string[];
  videoUrl?: string | null;
  amenities?: string[];
  totalAreaSqm?: number | null;
  avgPricePerSqm?: string | number | null;
  status: string;
  unitsCount: number;
  availableUnitsCount?: number;
  reservedUnitsCount?: number;
  soldUnitsCount?: number;
  totalValueETB?: number;
  _count: { buildings: number };
};

const categoryLabels: Record<string, string> = {
  RESIDENTIAL_TOWER: "G+12/G+20 Residential Tower (አፓርታማ)",
  LUXURY_VILLA_COMPOUND: "Luxury Villa Compound (ቪላዎች)",
  COMMERCIAL_PLAZA: "Commercial Plaza / Mall (ንግድ ማዕከል)",
  MIXED_USE_DEVELOPMENT: "Mixed-Use Tower (የተደባለቀ አግልግሎት)",
  TOWN_HOUSES: "Modern Townhouses (ታውን ሀውስ)",
};

const subCityLabels: Record<string, string> = {
  BOLE: "Bole (ቦሌ)",
  KIRKOS: "Kirkos / Kazanchis (ቂርቆስ)",
  NIFAS_SILK_LAFTO: "Nifas Silk / Sarbet (ንፋስ ስልክ)",
  YEKA: "Yeka / CMC (የካ)",
  ARADA: "Arada / Piazza (አራዳ)",
  GULLELE: "Gullele (ጉለሌ)",
};

const stageLabels: Record<string, string> = {
  EXCAVATION_FOUNDATION: "Excavation & Foundation (15% - መሠረት)",
  STRUCTURE_CONCRETE_SLAB: "Structure & Slab Casting (45% - ፍሬም)",
  BRICKWORK_PLASTERING: "Blockwork & Plastering (65% - ፕላስተር)",
  FINISHING_TILING: "Finishing & Elevators (85% - ፊኒሺንግ)",
  HANDOVER_READY: "Handover Ready & Key Delivery (100% - ርክክብ)",
};

const statusClass: Record<string, string> = {
  PLANNING: "bg-slate-100 text-slate-700 border-slate-200",
  ACTIVE: "bg-info/10 text-info border-info/20 font-medium",
  SELLING: "bg-success/10 text-success border-success/20 font-bold",
  COMPLETED: "bg-info/10 text-info border-info",
  ON_HOLD: "bg-destructive/10 text-destructive border-destructive/20",
};

const DEFAULT_AMENITIES = [
  "24/7 Standby Backup Generator (ባክአፕ ጀነሬተር)",
  "Dual Passenger Elevators (ሁለት ሊፍት)",
  "Underground Parking (የከርሰ ምድር መኪና ማቆሚያ)",
  "Water Reservoir & Borehole (የውሃ ታንከር)",
  "CCTV & 24/7 Security System (የደህንነት ካሜራ)",
  "Children's Play Area & Terrace (የህፃናት መጫወቻ)",
];

const PRESET_RENDERS = [
  {
    name: "Bole Luxury High-Rise Render",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Kazanchis Glass Tower Render",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "CMC Villa Compound Render",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Mixed-Use Commercial Plaza",
    url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
  },
];

export default function ProjectsPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title?: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "RESIDENTIAL_TOWER",
    subCity: "BOLE",
    location: "",
    constructionStage: "STRUCTURE_CONCRETE_SLAB",
    progressPercentage: "50",
    estimatedDelivery: "Q4 2027",
    coverImage: "",
    videoUrl: "",
    description: "",
    status: "SELLING",
    selectedAmenities: [
      DEFAULT_AMENITIES[0],
      DEFAULT_AMENITIES[1],
      DEFAULT_AMENITIES[2],
    ],
    galleryUrls: [] as string[],
    newGalleryUrl: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ApiProject[]>("/projects");
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const openNewForm = () => {
    setEditingProjectId(null);
    setForm({
      name: "",
      category: "RESIDENTIAL_TOWER",
      subCity: "BOLE",
      location: "",
      constructionStage: "STRUCTURE_CONCRETE_SLAB",
      progressPercentage: "50",
      estimatedDelivery: "Q4 2027",
      coverImage: PRESET_RENDERS[0].url,
      videoUrl: "",
      description: "",
      status: "SELLING",
      selectedAmenities: [
        DEFAULT_AMENITIES[0],
        DEFAULT_AMENITIES[1],
        DEFAULT_AMENITIES[2],
      ],
      galleryUrls: [],
      newGalleryUrl: "",
    });
    setShowForm(true);
  };

  const openEditForm = (p: ApiProject) => {
    setEditingProjectId(p.id);
    setForm({
      name: p.name,
      category: p.category ?? "RESIDENTIAL_TOWER",
      subCity: p.subCity ?? "BOLE",
      location: p.location ?? "",
      constructionStage: p.constructionStage ?? "STRUCTURE_CONCRETE_SLAB",
      progressPercentage: String(p.progressPercentage ?? 50),
      estimatedDelivery: p.estimatedDelivery ?? "Q4 2027",
      coverImage: p.coverImage ?? "",
      videoUrl: p.videoUrl ?? "",
      description: p.description ?? "",
      status: p.status,
      selectedAmenities: p.amenities ?? [
        DEFAULT_AMENITIES[0],
        DEFAULT_AMENITIES[1],
      ],
      galleryUrls: p.gallery ?? [],
      newGalleryUrl: "",
    });
    setShowForm(true);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        subCity: form.subCity,
        location: form.location || undefined,
        constructionStage: form.constructionStage,
        progressPercentage: Number(form.progressPercentage),
        estimatedDelivery: form.estimatedDelivery || undefined,
        coverImage: form.coverImage || undefined,
        gallery: form.galleryUrls,
        videoUrl: form.videoUrl || undefined,
        amenities: form.selectedAmenities,
        description: form.description || undefined,
        status: form.status,
      };

      if (editingProjectId) {
        await apiFetch<ApiProject>(`/projects/${editingProjectId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch<ApiProject>("/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setShowForm(false);
      setEditingProjectId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: ApiProject) => {
    if (
      !window.confirm(
        `Are you sure you want to delete project "${p.name}"? This will delete all associated building blocks and units.`,
      )
    ) {
      return;
    }
    setError(null);
    try {
      await apiFetch(`/projects/${p.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => {
      const exists = prev.selectedAmenities.includes(amenity);
      return {
        ...prev,
        selectedAmenities: exists
          ? prev.selectedAmenities.filter((a) => a !== amenity)
          : [...prev.selectedAmenities, amenity],
      };
    });
  };

  const addGalleryPhoto = () => {
    if (!form.newGalleryUrl.trim()) return;
    setForm((prev) => ({
      ...prev,
      galleryUrls: [...prev.galleryUrls, prev.newGalleryUrl.trim()],
      newGalleryUrl: "",
    }));
  };

  const removeGalleryPhoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = async (file: File, type: "cover" | "gallery") => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiUpload<{ url: string }>("/uploads/image", formData);
      const fullUrl = `${API_BASE_URL.replace("/api", "")}${res.url}`;

      if (type === "cover") {
        setForm({ ...form, coverImage: fullUrl });
      } else {
        setForm((prev) => ({
          ...prev,
          galleryUrls: [...prev.galleryUrls, fullUrl],
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchQuery =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.location ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(query.toLowerCase());

      const matchCat =
        filterCategory === "ALL" || p.category === filterCategory;
      return matchQuery && matchCat;
    });
  }, [projects, query, filterCategory]);

  // KPI summary
  const totalPortfolioValueETB = projects.reduce(
    (acc, p) => acc + (p.totalValueETB || 0),
    0,
  );
  const totalAvailableUnits = projects.reduce(
    (acc, p) => acc + (p.availableUnitsCount || 0),
    0,
  );
  const totalSoldUnits = projects.reduce(
    (acc, p) => acc + (p.soldUnitsCount || 0),
    0,
  );
  const activeDevsCount = projects.filter(
    (p) => p.status === "ACTIVE" || p.status === "SELLING",
  ).length;

  return (
    <DashboardShell
      title={t("projects.title")}
      description={t("projects.subtitle")}
      active="Projects"
    >
      <div className="space-y-6">
        {/* Section Header & Creator Button */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-[#233b66]" />
                <h2 className="text-lg font-bold text-slate-900">
                  Addis Ababa Real Estate Projects
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Organize architectural renderings, sub-city locations,
                construction progress, & floor plan inventory.
              </p>
            </div>
            <Button
              onClick={() => {
                if (showForm) setShowForm(false);
                else openNewForm();
              }}
              className="font-medium shadow-sm transition-all"
            >
              {showForm ? (
                <X className="size-4 mr-1.5" />
              ) : (
                <Plus className="size-4 mr-1.5" />
              )}
              {showForm ? "Cancel Intake" : "New Real Estate Project"}
            </Button>
          </div>

          {/* Project Creator / Editor Form Modal */}
          {showForm && (
            <form
              onSubmit={handleSave}
              className="mt-6 rounded-xl border border-primary/20 bg-gradient-to-b from-[#233b66]/5 to-slate-50/50 p-5 shadow-inner"
            >
              <h3 className="text-xs font-bold text-[#233b66] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-[#233b66]" />
                {editingProjectId
                  ? "Edit Real Estate Project Details & Renderings"
                  : "Project Specification & Architectural Details"}
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Bole Atlas Luxury Heights Tower"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    <option value="RESIDENTIAL_TOWER">
                      G+12/G+20 Residential Tower (አፓርታማ)
                    </option>
                    <option value="LUXURY_VILLA_COMPOUND">
                      Luxury Villa Compound (ቪላዎች)
                    </option>
                    <option value="COMMERCIAL_PLAZA">
                      Commercial Plaza / Mall (ንግድ ማዕከል)
                    </option>
                    <option value="MIXED_USE_DEVELOPMENT">
                      Mixed-Use Tower (የተደባለቀ አግልግሎት)
                    </option>
                    <option value="TOWN_HOUSES">
                      Modern Townhouses (ታውን ሀውስ)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Addis Ababa Sub-City
                  </label>
                  <select
                    value={form.subCity}
                    onChange={(e) =>
                      setForm({ ...form, subCity: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    {Object.entries(subCityLabels).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Location / Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bole Atlas, 200m from Medhanialem Church"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Construction Progress Stage
                  </label>
                  <select
                    value={form.constructionStage}
                    onChange={(e) =>
                      setForm({ ...form, constructionStage: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    {Object.entries(stageLabels).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Progress Percentage (0 - 100%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.progressPercentage}
                    onChange={(e) =>
                      setForm({ ...form, progressPercentage: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Delivery Target
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q4 2027"
                    value={form.estimatedDelivery}
                    onChange={(e) =>
                      setForm({ ...form, estimatedDelivery: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>

                {/* Cover Image & Presets Selector */}
                <div className="sm:col-span-3 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    3D Architectural Cover Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://... or upload file"
                      value={form.coverImage}
                      onChange={(e) =>
                        setForm({ ...form, coverImage: e.target.value })
                      }
                      className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFileUpload(file, "cover");
                      }}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors h-9"
                    >
                      <ImageIcon className="size-4 mr-1.5" /> Upload
                    </label>
                    {form.coverImage && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setForm({ ...form, coverImage: "" })}
                        className="text-xs h-9 border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5 mr-1" /> Clear
                      </Button>
                    )}
                  </div>

                  {/* Preset Selector Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Quick Presets:
                    </span>
                    {PRESET_RENDERS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, coverImage: preset.url })
                        }
                        className="rounded bg-white px-2.5 py-1 text-[10px] font-semibold text-primary border border-primary/20 hover:bg-primary/10 transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gallery Photos Uploader */}
                <div className="sm:col-span-3 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Media & Gallery Photos
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste image rendering URL (e.g. site progress photo)..."
                      value={form.newGalleryUrl}
                      onChange={(e) =>
                        setForm({ ...form, newGalleryUrl: e.target.value })
                      }
                      className="flex-1 h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                    <Button
                      type="button"
                      onClick={addGalleryPhoto}
                      variant="outline"
                      className="text-xs h-9 border-slate-300"
                    >
                      <Plus className="size-3.5 mr-1" /> Add URL
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFileUpload(file, "gallery");
                      }}
                      className="hidden"
                      id="gallery-upload"
                    />
                    <label
                      htmlFor="gallery-upload"
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors h-9"
                    >
                      <ImageIcon className="size-4 mr-1.5" /> Upload File
                    </label>
                  </div>

                  {form.galleryUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {form.galleryUrls.map((url, index) => (
                        <div
                          key={url + index}
                          className="relative size-16 rounded-md border border-slate-300 overflow-hidden group"
                        >
                          <img
                            src={url}
                            alt="Gallery"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryPhoto(index)}
                            className="absolute top-0.5 right-0.5 rounded-full bg-destructive p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  >
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Virtual Video Walkthrough URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://t.me/BetFlowRealEstate/104"
                    value={form.videoUrl}
                    onChange={(e) =>
                      setForm({ ...form, videoUrl: e.target.value })
                    }
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Infrastructure & Amenities
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {DEFAULT_AMENITIES.map((amenity) => {
                      const isChecked =
                        form.selectedAmenities.includes(amenity);
                      return (
                        <label
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border p-2 text-xs font-medium cursor-pointer transition-all select-none",
                            isChecked
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          <div
                            className={cn(
                              "size-4 rounded border flex items-center justify-center transition-colors",
                              isChecked
                                ? "border-primary bg-primary text-white"
                                : "border-slate-300 bg-white",
                            )}
                          >
                            {isChecked && <CheckCircle2 className="size-3" />}
                          </div>
                          <span>{amenity}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Overview & Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Overview of the development, architectural specs, payment plans..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-primary/10 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="font-medium text-xs shadow-sm"
                >
                  {saving
                    ? "Saving…"
                    : editingProjectId
                      ? "Save Changes"
                      : "Create Real Estate Project"}
                </Button>
              </div>
            </form>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
              {error}
            </p>
          )}
        </section>

        {/* Filter Controls & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterCategory("ALL")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap",
                filterCategory === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
              )}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setFilterCategory("RESIDENTIAL_TOWER")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap",
                filterCategory === "RESIDENTIAL_TOWER"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
              )}
            >
              Residential Towers (
              {
                projects.filter((p) => p.category === "RESIDENTIAL_TOWER")
                  .length
              }
              )
            </button>
            <button
              onClick={() => setFilterCategory("LUXURY_VILLA_COMPOUND")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap",
                filterCategory === "LUXURY_VILLA_COMPOUND"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
              )}
            >
              Villa Compounds (
              {
                projects.filter((p) => p.category === "LUXURY_VILLA_COMPOUND")
                  .length
              }
              )
            </button>
            <button
              onClick={() => setFilterCategory("COMMERCIAL_PLAZA")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap",
                filterCategory === "COMMERCIAL_PLAZA"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
              )}
            >
              Commercial Plazas (
              {projects.filter((p) => p.category === "COMMERCIAL_PLAZA").length}
              )
            </button>
          </div>

          <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-slate-400 sm:w-64 shadow-2xs">
            <Search className="size-4 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects or location…"
              className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {/* Projects Cards Grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <p className="text-sm text-slate-500">
              Loading real estate developments…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-slate-200 bg-white">
            <Building2 className="size-8 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              No real estate projects found
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Click "New Real Estate Project" above to create your first
              development project.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => {
              const progress = project.progressPercentage ?? 50;

              return (
                <div
                  key={project.id}
                  className="group rounded-xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  {/* Card Cover Render */}
                  <div className="relative h-44 w-full bg-gradient-to-br from-slate-900 via-primary to-slate-900 overflow-hidden">
                    {project.coverImage ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage({
                            url: project.coverImage!,
                            title: `${project.name} - Cover Render`,
                          });
                        }}
                        className="relative h-full w-full cursor-pointer overflow-hidden group/img"
                        title="Click to view full image"
                      >
                        <img
                          src={project.coverImage}
                          alt={project.name}
                          className="h-full w-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm border border-white/20">
                            <ZoomIn className="size-3" /> Zoom
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
                        <Building2 className="size-10 text-primary/80/60 mb-2" />
                        <span className="text-xs font-semibold text-slate-300">
                          {categoryLabels[
                            project.category ?? "RESIDENTIAL_TOWER"
                          ] ?? "Real Estate Project"}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md border border-white/20">
                        {subCityLabels[project.subCity ?? "BOLE"] ??
                          "Addis Ababa"}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold border backdrop-blur-md shadow-2xs",
                          statusClass[project.status] ??
                            "bg-slate-100 text-slate-700",
                        )}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Action buttons overlay: Edit and Delete */}
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(project)}
                        className="rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-primary transition-colors border border-white/20 backdrop-blur-md"
                        title="Edit Project"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project)}
                        className="rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-destructive transition-colors border border-white/20 backdrop-blur-md"
                        title="Delete Project"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {project.estimatedDelivery && (
                      <div className="absolute bottom-3 right-3 rounded-md bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-warning backdrop-blur-md border border-warning/30/30">
                        Delivery: {project.estimatedDelivery}
                      </div>
                    )}
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        {project.location ??
                          `${subCityLabels[project.subCity ?? "BOLE"] ?? "Addis Ababa"}`}
                      </p>

                      {project.description && (
                        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}

                      {/* Construction Progress Bar */}
                      <div className="mt-4 space-y-1.5 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                            {stageLabels[
                              project.constructionStage ??
                                "STRUCTURE_CONCRETE_SLAB"
                            ]?.split("(")[0] ?? "Construction"}
                          </span>
                          <span className="font-bold text-primary">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1 text-primary">
                          <Building className="size-3.5" />
                          {project._count.buildings} Blocks
                        </span>
                        <span className="flex items-center gap-1 text-success font-bold">
                          <CheckCircle2 className="size-3.5" />
                          {project.availableUnitsCount ?? 0} Avail
                        </span>
                      </div>

                      <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary hover:underline"
                      >
                        Explore Inventory
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 transition-all animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative flex flex-col max-w-5xl w-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 text-white">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="size-4 text-primary" />
                <span className="text-xs font-bold text-slate-200 truncate">
                  {previewImage.title || "Image Preview"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Open full size image in new tab"
                >
                  <ExternalLink className="size-3.5" /> Open Original
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close (Esc)"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* High-res Image Display */}
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-950/80 overflow-auto">
              <img
                src={previewImage.url}
                alt={previewImage.title || "Full Preview"}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl select-none"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
