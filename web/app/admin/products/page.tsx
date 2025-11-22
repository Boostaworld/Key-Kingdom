"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Product, VendorLink } from "@/data/types";

const FALLBACK_SORT = Number.MAX_SAFE_INTEGER;

type AdminProduct = Omit<Product, "lowestPrice" | "vendorCount">;
type VendorDraft = Partial<VendorLink>;

type NewProductDraft = Partial<AdminProduct> & {
  featuresText?: string;
  tagsText?: string;
};

type EditProductDraft = AdminProduct & {
  featuresText: string;
  tagsText: string;
};

function toCommaSeparated(value: string[] | undefined) {
  return value?.join(", ") ?? "";
}

function parseCommaSeparated(value: string | undefined) {
  if (!value) return [] as string[];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arraysEqual(a: string[] = [], b: string[] = []) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

function normalizeSortOrder(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function normalizeOptionalText(value: string | undefined | null) {
  if (value === undefined || value === null) return "";
  return value;
}

function toNullableString(value: string | undefined | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<NewProductDraft>({
    id: "",
    name: "",
    slug: "",
    iconUrl: "",
    description: "",
    isUpdated: true,
    featuresText: "",
    tagsText: "",
    heroImageUrl: "",
    tagline: "",
    sortOrder: undefined,
    lastUpdated: "",
  });
  const [newVendors, setNewVendors] = useState<Record<string, VendorDraft>>({});
  const [editingProduct, setEditingProduct] = useState<EditProductDraft | null>(null);
  const [editingSource, setEditingSource] = useState<AdminProduct | null>(null);

  const vendorCounts = useMemo(
    () =>
      products.reduce<Record<string, number>>((acc, product) => {
        acc[product.id] = product.vendorLinks.length;
        return acc;
      }, {}),
    [products],
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });

      if (!response.ok) {
        const bodyText = await response.text();
        let message = `Unable to load products (status ${response.status}).`;

        try {
          const parsed = JSON.parse(bodyText);
          if (parsed?.error) {
            message = parsed.error;
          } else if (typeof parsed === "string" && parsed.trim()) {
            message = parsed.trim();
          }
        } catch {
          if (bodyText.trim().length) {
            message = bodyText.trim();
          }
        }

        setLoadError(message);
        setProducts([]);
        return;
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Unable to fetch products", error);
      setLoadError("Unable to load products. Please retry.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const updateVendorField = (
    productId: string,
    vendorId: string,
    key: keyof VendorLink,
    value: unknown,
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              vendorLinks: product.vendorLinks.map((vendor) =>
                vendor.id === vendorId ? { ...vendor, [key]: value } : vendor,
              ),
            }
          : product,
      ),
    );
  };

  const updateNewVendorField = (
    productId: string,
    key: keyof VendorLink,
    value: unknown,
  ) => {
    setNewVendors((current) => ({
      ...current,
      [productId]: { ...current[productId], [key]: value },
    }));
  };

  const handleGenerateId = () => {
    const randomId = Math.floor(10000000 + Math.random() * 90000000).toString();
    setNewProduct((prev) => ({ ...prev, id: randomId }));
  };

  const handleCreateProduct = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setSaving(true);
    setCreateError(null);

    const payload = {
      ...newProduct,
      id: newProduct.id?.trim(),
      name: newProduct.name?.trim(),
      slug: newProduct.slug?.trim(),
      iconUrl: newProduct.iconUrl?.trim(),
      heroImageUrl: toNullableString(normalizeOptionalText(newProduct.heroImageUrl)),
      tagline: toNullableString(normalizeOptionalText(newProduct.tagline)),
      description: newProduct.description?.trim(),
      features: parseCommaSeparated(newProduct.featuresText),
      tags: parseCommaSeparated(newProduct.tagsText),
      sortOrder: normalizeSortOrder(newProduct.sortOrder) ?? null,
      lastUpdated: toNullableString(normalizeOptionalText(newProduct.lastUpdated)),
    };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const bodyText = await response.text();
        let message = `Unable to create product (status ${response.status}).`;

        try {
          const parsed = JSON.parse(bodyText);
          if (parsed?.error) {
            message = parsed.error;
          } else if (typeof parsed === "string" && parsed.trim()) {
            message = parsed.trim();
          }
        } catch {
          if (bodyText.trim().length) {
            message = bodyText.trim();
          }
        }

        setCreateError(message);
        return;
      }

      setNewProduct({
        id: "",
        name: "",
        slug: "",
        iconUrl: "",
        description: "",
        isUpdated: true,
        featuresText: "",
        tagsText: "",
        heroImageUrl: "",
        tagline: "",
        sortOrder: undefined,
        lastUpdated: "",
      });
      await fetchProducts();
    } catch (error) {
      console.error(error);
      setCreateError("Unable to create product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const startEditingProduct = (product: AdminProduct) => {
    setEditingSource(product);
    setEditingProduct({
      ...product,
      featuresText: toCommaSeparated(product.features),
      tagsText: toCommaSeparated(product.tags ?? []),
      heroImageUrl: normalizeOptionalText(product.heroImageUrl),
      tagline: normalizeOptionalText(product.tagline),
      lastUpdated: normalizeOptionalText(product.lastUpdated),
      sortOrder: product.sortOrder ?? undefined,
    });
  };

  const closeEditingProduct = () => {
    setEditingProduct(null);
    setEditingSource(null);
  };

  const handleSaveProductUpdates = async () => {
    if (!editingProduct || !editingSource) return;

    const updates: Record<string, unknown> = {};

    const trimmedName = editingProduct.name.trim();
    if (trimmedName && trimmedName !== editingSource.name) updates.name = trimmedName;

    const trimmedSlug = editingProduct.slug.trim();
    if (trimmedSlug && trimmedSlug !== editingSource.slug) updates.slug = trimmedSlug;

    const trimmedIcon = editingProduct.iconUrl.trim();
    if (trimmedIcon && trimmedIcon !== editingSource.iconUrl)
      updates.iconUrl = trimmedIcon;

    const heroImageUrl = toNullableString(editingProduct.heroImageUrl);
    if (heroImageUrl !== (editingSource.heroImageUrl ?? null))
      updates.heroImageUrl = heroImageUrl;

    const tagline = toNullableString(editingProduct.tagline);
    if (tagline !== (editingSource.tagline ?? null)) updates.tagline = tagline;

    const description = editingProduct.description.trim();
    if (description && description !== editingSource.description)
      updates.description = description;

    const sortOrder = normalizeSortOrder(editingProduct.sortOrder);
    const originalSort = normalizeSortOrder(editingSource.sortOrder);
    if ((sortOrder ?? null) !== (originalSort ?? null))
      updates.sortOrder = sortOrder ?? null;

    const features = parseCommaSeparated(editingProduct.featuresText);
    if (!arraysEqual(features, editingSource.features)) updates.features = features;

    const tags = parseCommaSeparated(editingProduct.tagsText);
    if (!arraysEqual(tags, editingSource.tags ?? [])) updates.tags = tags;

    const lastUpdated = toNullableString(editingProduct.lastUpdated);
    if (lastUpdated !== (editingSource.lastUpdated ?? null))
      updates.lastUpdated = lastUpdated;

    if (editingProduct.isUpdated !== editingSource.isUpdated)
      updates.isUpdated = editingProduct.isUpdated;

    if (!Object.keys(updates).length) {
      closeEditingProduct();
      return;
    }

    setSaving(true);
    await fetch(`/api/admin/products/${editingSource.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    await fetchProducts();
    setSaving(false);
    closeEditingProduct();
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );
    if (!confirmed) return;

    setSaving(true);
    await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    await fetchProducts();
    setSaving(false);
  };

  const handleSaveVendor = async (productId: string, vendor: VendorLink) => {
    setSaving(true);
    await fetch(`/api/admin/products/${productId}/vendors/${vendor.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendor),
    });
    await fetchProducts();
    setSaving(false);
  };

  const handleDeleteVendor = async (productId: string, vendorId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vendor?",
    );
    if (!confirmed) return;

    setSaving(true);
    await fetch(`/api/admin/products/${productId}/vendors/${vendorId}`, {
      method: "DELETE",
    });
    await fetchProducts();
    setSaving(false);
  };

  const handleAddVendor = async (productId: string) => {
    const draft = newVendors[productId];
    if (!draft?.id || !draft.vendorName || !draft.url || draft.price === undefined)
      return;

    setSaving(true);
    await fetch(`/api/admin/products/${productId}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        paymentMethods: draft.paymentMethods ?? [],
        price: Number(draft.price),
      }),
    });

    setNewVendors((current) => ({ ...current, [productId]: {} }));
    await fetchProducts();
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#03060A] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-wide text-[#1FB0FF]">Admin</p>
          <h1 className="text-3xl font-semibold">Products &amp; Vendors</h1>
          <p className="text-sm text-[#9CA3AF]">
            Manage product metadata, vendor links, and ordering. This area is
            protected via admin authentication.
          </p>
        </header>

        {/* Add product */}
        <section className="rounded-xl border border-[#1F2933] bg-[#0A0F14] p-6 shadow-[0_0_18px_rgba(31,176,255,0.14)]">
          <h2 className="text-xl font-semibold text-[#1FB0FF]">Add product</h2>
          <form
            onSubmit={handleCreateProduct}
            className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="flex items-center justify-between">
                <span>ID</span>
                <button
                  type="button"
                  className="text-xs text-[#1FB0FF] underline"
                  onClick={handleGenerateId}
                >
                  Random 8-digit ID
                </button>
              </span>
              <input
                className="rounded border border-[#1F2933] bg-[#050709] p-2"
                value={newProduct.id ?? ""}
                onChange={(event) =>
                  setNewProduct((prev) => ({ ...prev, id: event.target.value }))
                }
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Name
              <input
                className="rounded border border-[#1F2933] bg-[#050709] p-2"
                value={newProduct.name ?? ""}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Slug
              <input
                className="rounded border border-[#1F2933] bg-[#050709] p-2"
                value={newProduct.slug ?? ""}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    slug: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Icon URL
              <input
                className="rounded border border-[#1F2933] bg-[#050709] p-2"
                value={newProduct.iconUrl ?? ""}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    iconUrl: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Hero image URL
              <input
                className="rounded border border-[#1F2933] bg-[#050709] p-2"
                value={newProduct.heroImageUrl ?? ""}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    heroImageUrl: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm md:col-span-2">
              Tagline
              <input
                className="rounded border border-[#1F2933] bg-[#050709] p-2"
                value={newProduct.tagline ?? ""}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    tagline: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm md:col-span-2">
              Description
              <textarea
                className="rounded border border-[#1F2933] bg-[#050709] p-2"
                value={newProduct.description ?? ""}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Features (comma separated)
              <input
                className="rounded border border-[#1F2933] bg-[#050709] p-2"
                value={newProduct.featuresText ?? ""}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    featuresText: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Tags (comma separated)
              <input
                className="rounded border border-[#1F2933] bg-[#050709] p-2"
                value={newProduct.tagsText ?? ""}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    tagsText: event.target.value,
                  }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Sort order
              <input
                type="number"
                className="rounded border border-[#1F2933] bg-[#050709] p-2"
                value={newProduct.sortOrder ?? ""}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    sortOrder:
                      event.target.value === ""
                        ? undefined
                        : Number(event.target.value),
                  }))
                }
              />
            </label>
            <label className="flex flex-row items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newProduct.isUpdated ?? false}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    isUpdated: event.target.checked,
                  }))
                }
              />
              Is updated
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Last updated
              <input
                className="rounded border border-[#1F2933] bg-[#050709] p-2"
                value={newProduct.lastUpdated ?? ""}
                onChange={(event) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    lastUpdated: event.target.value,
                  }))
                }
              />
            </label>
            {createError && (
              <div className="md:col-span-2 rounded border border-[#3B1C1C] bg-[#1A0E10] px-3 py-2 text-sm text-[#FCA5A5]">
                {createError}
              </div>
            )}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded bg-[#12A0F9] px-4 py-2 font-semibold text-black shadow-[0_0_18px_rgba(31,176,255,0.65)]"
                disabled={saving}
              >
                {saving ? "Saving..." : "Create product"}
              </button>
            </div>
          </form>
        </section>

        {/* Existing products */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1FB0FF]">
              Existing products
            </h2>
            {loading && (
              <span className="text-sm text-[#9CA3AF]">Loading...</span>
            )}
          </div>
          {loadError && (
            <div className="rounded border border-[#3B1C1C] bg-[#1A0E10] px-3 py-2 text-sm text-[#FCA5A5]">
              {loadError}
            </div>
          )}
          <div className="flex flex-col gap-4">
            {products
              .slice()
              .sort(
                (a, b) =>
                  (a.sortOrder ?? FALLBACK_SORT) -
                  (b.sortOrder ?? FALLBACK_SORT),
              )
              .map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-[#1F2933] bg-[#0A0F14] p-6 shadow-[0_0_18px_rgba(31,176,255,0.14)]"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#9CA3AF]">{product.slug}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                      <span>Vendors: {vendorCounts[product.id] ?? 0}</span>
                      <span>•</span>
                      <span>Sort: {product.sortOrder ?? "∞"}</span>
                      <span>•</span>
                      <span>{product.isUpdated ? "Updated" : "Draft"}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-[#1F2933] bg-[#050709] p-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2 text-sm text-[#9CA3AF]">
                      <p className="text-white">Slug</p>
                      <p className="truncate">{product.slug}</p>
                      <p className="text-white">Icon URL</p>
                      <p className="truncate">{product.iconUrl}</p>
                      <p className="text-white">Hero image URL</p>
                      <p className="truncate">{product.heroImageUrl || "—"}</p>
                      <p className="text-white">Tagline</p>
                      <p className="truncate">{product.tagline || "—"}</p>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-[#9CA3AF]">
                      <p className="text-white">Description</p>
                      <p className="min-h-[48px] whitespace-pre-wrap">{product.description}</p>
                      <p className="text-white">Sort order</p>
                      <p>{product.sortOrder ?? "∞"}</p>
                      <p className="text-white">Last updated</p>
                      <p>{product.lastUpdated || "—"}</p>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Features</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {product.features.length ? (
                            product.features.map((feature) => (
                              <span
                                key={feature}
                                className="rounded-full border border-[#1F2933] bg-[#0A0F14] px-3 py-1 text-xs text-[#9CA3AF]"
                              >
                                {feature}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#6B7280]">No features listed</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Tags</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {product.tags?.length ? (
                            product.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-[#1F2933] bg-[#0A0F14] px-3 py-1 text-xs text-[#9CA3AF]"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#6B7280]">No tags set</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <button
                      className="rounded border border-[#1F2933] px-4 py-2 text-sm font-semibold text-[#9CA3AF] hover:border-[#1FB0FF] hover:text-white"
                      onClick={() => startEditingProduct(product)}
                    >
                      Edit product
                    </button>
                    <button
                      className="rounded bg-[#FF6B6B] px-4 py-2 text-sm font-semibold text-black shadow-[0_0_16px_rgba(255,107,107,0.35)]"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Vendor links */}
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-[#1FB0FF]">
                        Vendor links
                      </h4>
                      <span className="text-xs text-[#9CA3AF]">
                        {product.vendorLinks.length} entries
                      </span>
                    </div>

                    {product.vendorLinks.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="rounded-lg border border-[#1F2933] bg-[#050709] p-4"
                      >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <label className="flex flex-col gap-1 text-sm">
                            Vendor name
                            <input
                              className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                              value={vendor.vendorName}
                              onChange={(event) =>
                                updateVendorField(
                                  product.id,
                                  vendor.id,
                                  "vendorName",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm">
                            Price
                            <input
                              type="number"
                              step="0.01"
                              className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                              value={vendor.price}
                              onChange={(event) =>
                                updateVendorField(
                                  product.id,
                                  vendor.id,
                                  "price",
                                  Number(event.target.value),
                                )
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm">
                            URL
                            <input
                              className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                              value={vendor.url}
                              onChange={(event) =>
                                updateVendorField(
                                  product.id,
                                  vendor.id,
                                  "url",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm">
                            Redirect URL
                            <input
                              className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                              value={vendor.redirectUrl ?? ""}
                              onChange={(event) =>
                                updateVendorField(
                                  product.id,
                                  vendor.id,
                                  "redirectUrl",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm">
                            Currency
                            <input
                              className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                              value={vendor.currency}
                              onChange={(event) =>
                                updateVendorField(
                                  product.id,
                                  vendor.id,
                                  "currency",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm">
                            Payment methods
                            <input
                              className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                              value={toCommaSeparated(
                                vendor.paymentMethods as string[],
                              )}
                              onChange={(event) =>
                                updateVendorField(
                                  product.id,
                                  vendor.id,
                                  "paymentMethods",
                                  parseCommaSeparated(event.target.value),
                                )
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm">
                            CTA label
                            <input
                              className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                              value={vendor.ctaLabel ?? ""}
                              onChange={(event) =>
                                updateVendorField(
                                  product.id,
                                  vendor.id,
                                  "ctaLabel",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm">
                            Avatar URL
                            <input
                              className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                              value={vendor.avatarUrl ?? ""}
                              onChange={(event) =>
                                updateVendorField(
                                  product.id,
                                  vendor.id,
                                  "avatarUrl",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm md:col-span-2">
                            Notes
                            <textarea
                              className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                              value={vendor.notes ?? ""}
                              onChange={(event) =>
                                updateVendorField(
                                  product.id,
                                  vendor.id,
                                  "notes",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <button
                            className="rounded bg-[#12A0F9] px-3 py-2 text-sm font-semibold textblack shadow-[0_0_16px_rgba(31,176,255,0.45)]"
                            onClick={() => handleSaveVendor(product.id, vendor)}
                            disabled={saving}
                          >
                            Save vendor
                          </button>
                          <button
                            className="text-sm text-[#FF6B6B]"
                            onClick={() =>
                              handleDeleteVendor(product.id, vendor.id)
                            }
                            disabled={saving}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add vendor form */}
                    <div className="rounded-lg border border-dashed border-[#1F2933] bg-[#050709] p-4">
                      <h5 className="text-sm font-semibold text-[#1FB0FF]">
                        Add vendor link
                      </h5>
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                          className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                          placeholder="ID"
                          value={newVendors[product.id]?.id ?? ""}
                          onChange={(event) =>
                            updateNewVendorField(
                              product.id,
                              "id",
                              event.target.value,
                            )
                          }
                        />
                        <input
                          className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                          placeholder="Vendor name"
                          value={newVendors[product.id]?.vendorName ?? ""}
                          onChange={(event) =>
                            updateNewVendorField(
                              product.id,
                              "vendorName",
                              event.target.value,
                            )
                          }
                        />
                        <input
                          className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                          placeholder="URL"
                          value={newVendors[product.id]?.url ?? ""}
                          onChange={(event) =>
                            updateNewVendorField(
                              product.id,
                              "url",
                              event.target.value,
                            )
                          }
                        />
                        <input
                          className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                          placeholder="Redirect URL"
                          value={newVendors[product.id]?.redirectUrl ?? ""}
                          onChange={(event) =>
                            updateNewVendorField(
                              product.id,
                              "redirectUrl",
                              event.target.value,
                            )
                          }
                        />
                        <input
                          type="number"
                          step="0.01"
                          className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                          placeholder="Price"
                          value={newVendors[product.id]?.price ?? ""}
                          onChange={(event) =>
                            updateNewVendorField(
                              product.id,
                              "price",
                              Number(event.target.value),
                            )
                          }
                        />
                        <input
                          className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                          placeholder="Currency"
                          value={newVendors[product.id]?.currency ?? ""}
                          onChange={(event) =>
                            updateNewVendorField(
                              product.id,
                              "currency",
                              event.target.value,
                            )
                          }
                        />
                        <input
                          className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                          placeholder="Payment methods"
                          value={toCommaSeparated(
                            newVendors[product.id]
                              ?.paymentMethods as string[],
                          )}
                          onChange={(event) =>
                            updateNewVendorField(
                              product.id,
                              "paymentMethods",
                              parseCommaSeparated(event.target.value),
                            )
                          }
                        />
                        <input
                          className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                          placeholder="CTA label"
                          value={newVendors[product.id]?.ctaLabel ?? ""}
                          onChange={(event) =>
                            updateNewVendorField(
                              product.id,
                              "ctaLabel",
                              event.target.value,
                            )
                          }
                        />
                        <input
                          className="rounded border border-[#1F2933] bg-[#0A0F14] p-2"
                          placeholder="Avatar URL"
                          value={newVendors[product.id]?.avatarUrl ?? ""}
                          onChange={(event) =>
                            updateNewVendorField(
                              product.id,
                              "avatarUrl",
                              event.target.value,
                            )
                          }
                        />
                        <textarea
                          className="rounded border border-[#1F2933] bg-[#0A0F14] p-2 md:col-span-2"
                          placeholder="Notes"
                          value={newVendors[product.id]?.notes ?? ""}
                          onChange={(event) =>
                            updateNewVendorField(
                              product.id,
                              "notes",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          className="rounded bg-[#12A0F9] px-3 py-2 text-sm font-semibold text-black shadow-[0_0_16px_rgba(31,176,255,0.45)]"
                          onClick={() => handleAddVendor(product.id)}
                          disabled={saving}
                        >
                          Add vendor
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
        {editingProduct && editingSource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#1F2933] bg-[#0A0F14] p-6 shadow-[0_0_24px_rgba(31,176,255,0.35)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-[#1FB0FF]">
                    Edit product
                  </p>
                  <h3 className="text-2xl font-semibold">{editingSource.name}</h3>
                  <p className="text-xs text-[#9CA3AF]">Only changed fields will be updated.</p>
                </div>
                <button
                  className="text-sm text-[#9CA3AF] hover:text-white"
                  onClick={closeEditingProduct}
                >
                  Close
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  Name
                  <input
                    className="rounded border border-[#1F2933] bg-[#050709] p-2"
                    value={editingProduct.name}
                    onChange={(event) =>
                      setEditingProduct((prev) =>
                        prev ? { ...prev, name: event.target.value } : prev,
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Slug
                  <input
                    className="rounded border border-[#1F2933] bg-[#050709] p-2"
                    value={editingProduct.slug}
                    onChange={(event) =>
                      setEditingProduct((prev) =>
                        prev ? { ...prev, slug: event.target.value } : prev,
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Icon URL
                  <input
                    className="rounded border border-[#1F2933] bg-[#050709] p-2"
                    value={editingProduct.iconUrl}
                    onChange={(event) =>
                      setEditingProduct((prev) =>
                        prev ? { ...prev, iconUrl: event.target.value } : prev,
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Hero image URL
                  <input
                    className="rounded border border-[#1F2933] bg-[#050709] p-2"
                    value={editingProduct.heroImageUrl ?? ""}
                    onChange={(event) =>
                      setEditingProduct((prev) =>
                        prev
                          ? { ...prev, heroImageUrl: event.target.value }
                          : prev,
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Tagline
                  <input
                    className="rounded border border-[#1F2933] bg-[#050709] p-2"
                    value={editingProduct.tagline ?? ""}
                    onChange={(event) =>
                      setEditingProduct((prev) =>
                        prev ? { ...prev, tagline: event.target.value } : prev,
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Sort order
                  <input
                    type="number"
                    className="rounded border border-[#1F2933] bg-[#050709] p-2"
                    value={editingProduct.sortOrder ?? ""}
                    onChange={(event) =>
                      setEditingProduct((prev) =>
                        prev
                          ? {
                              ...prev,
                              sortOrder:
                                event.target.value === ""
                                  ? undefined
                                  : Number(event.target.value),
                            }
                          : prev,
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm md:col-span-2">
                  Description
                  <textarea
                    className="rounded border border-[#1F2933] bg-[#050709] p-2"
                    value={editingProduct.description}
                    onChange={(event) =>
                      setEditingProduct((prev) =>
                        prev ? { ...prev, description: event.target.value } : prev,
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Features (comma separated)
                  <input
                    className="rounded border border-[#1F2933] bg-[#050709] p-2"
                    value={editingProduct.featuresText}
                    onChange={(event) =>
                      setEditingProduct((prev) =>
                        prev
                          ? {
                              ...prev,
                              featuresText: event.target.value,
                            }
                          : prev,
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Tags (comma separated)
                  <input
                    className="rounded border border-[#1F2933] bg-[#050709] p-2"
                    value={editingProduct.tagsText}
                    onChange={(event) =>
                      setEditingProduct((prev) =>
                        prev
                          ? {
                              ...prev,
                              tagsText: event.target.value,
                            }
                          : prev,
                      )
                    }
                  />
                </label>
                <label className="flex flex-row items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editingProduct.isUpdated}
                    onChange={(event) =>
                      setEditingProduct((prev) =>
                        prev ? { ...prev, isUpdated: event.target.checked } : prev,
                      )
                    }
                  />
                  Is updated
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Last updated
                  <input
                    className="rounded border border-[#1F2933] bg-[#050709] p-2"
                    value={editingProduct.lastUpdated ?? ""}
                    onChange={(event) =>
                      setEditingProduct((prev) =>
                        prev
                          ? { ...prev, lastUpdated: event.target.value }
                          : prev,
                      )
                    }
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="rounded border border-[#1F2933] px-4 py-2 text-sm font-semibold text-[#9CA3AF] hover:border-[#1FB0FF] hover:text-white"
                  onClick={closeEditingProduct}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="rounded bg-[#12A0F9] px-4 py-2 text-sm font-semibold text-black shadow-[0_0_18px_rgba(31,176,255,0.65)]"
                  onClick={handleSaveProductUpdates}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
