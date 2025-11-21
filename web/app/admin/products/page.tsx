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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
    const response = await fetch("/api/admin/products", { cache: "no-store" });
    const data = await response.json();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProducts();
  }, [fetchProducts]);

  const updateProductField = (
    productId: string,
    key: keyof AdminProduct,
    value: unknown,
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, [key]: value } : product,
      ),
    );
  };

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

  const handleCreateProduct = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...newProduct,
      features: parseCommaSeparated(newProduct.featuresText),
      tags: parseCommaSeparated(newProduct.tagsText),
      sortOrder:
        newProduct.sortOrder === undefined || newProduct.sortOrder === null
          ? undefined
          : Number(newProduct.sortOrder),
    };

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
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
    }

    setSaving(false);
  };

  const handleSaveProduct = async (product: AdminProduct) => {
    setSaving(true);
    const payload = {
      name: product.name,
      slug: product.slug,
      iconUrl: product.iconUrl,
      heroImageUrl: product.heroImageUrl,
      tagline: product.tagline,
      description: product.description,
      features: product.features,
      sortOrder: product.sortOrder ?? null,
      isUpdated: product.isUpdated,
      tags: product.tags,
      lastUpdated: product.lastUpdated,
    };

    await fetch(`/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await fetchProducts();
    setSaving(false);
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
              ID
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
                      <button
                        className="ml-3 text-[#FF6B6B]"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={saving}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm">
                      Name
                      <input
                        className="rounded border border-[#1F2933] bg-[#050709] p-2"
                        value={product.name}
                        onChange={(event) =>
                          updateProductField(
                            product.id,
                            "name",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      Slug
                      <input
                        className="rounded border border-[#1F2933] bg-[#050709] p-2"
                        value={product.slug}
                        onChange={(event) =>
                          updateProductField(
                            product.id,
                            "slug",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      Icon URL
                      <input
                        className="rounded border border-[#1F2933] bg-[#050709] p-2"
                        value={product.iconUrl}
                        onChange={(event) =>
                          updateProductField(
                            product.id,
                            "iconUrl",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      Hero image URL
                      <input
                        className="rounded border border-[#1F2933] bg-[#050709] p-2"
                        value={product.heroImageUrl ?? ""}
                        onChange={(event) =>
                          updateProductField(
                            product.id,
                            "heroImageUrl",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      Tagline
                      <input
                        className="rounded border border-[#1F2933] bg-[#050709] p-2"
                        value={product.tagline ?? ""}
                        onChange={(event) =>
                          updateProductField(
                            product.id,
                            "tagline",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      Sort order
                      <input
                        type="number"
                        className="rounded border border-[#1F2933] bg-[#050709] p-2"
                        value={product.sortOrder ?? ""}
                        onChange={(event) =>
                          updateProductField(
                            product.id,
                            "sortOrder",
                            Number(event.target.value),
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm md:col-span-2">
                      Description
                      <textarea
                        className="rounded border border-[#1F2933] bg-[#050709] p-2"
                        value={product.description}
                        onChange={(event) =>
                          updateProductField(
                            product.id,
                            "description",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      Features (comma separated)
                      <input
                        className="rounded border border-[#1F2933] bg-[#050709] p-2"
                        value={toCommaSeparated(product.features)}
                        onChange={(event) =>
                          updateProductField(
                            product.id,
                            "features",
                            parseCommaSeparated(event.target.value),
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      Tags (comma separated)
                      <input
                        className="rounded border border-[#1F2933] bg-[#050709] p-2"
                        value={toCommaSeparated(product.tags ?? [])}
                        onChange={(event) =>
                          updateProductField(
                            product.id,
                            "tags",
                            parseCommaSeparated(event.target.value),
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-row items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={product.isUpdated}
                        onChange={(event) =>
                          updateProductField(
                            product.id,
                            "isUpdated",
                            event.target.checked,
                          )
                        }
                      />
                      Is updated
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      Last updated
                      <input
                        className="rounded border border-[#1F2933] bg-[#050709] p-2"
                        value={product.lastUpdated ?? ""}
                        onChange={(event) =>
                          updateProductField(
                            product.id,
                            "lastUpdated",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      className="rounded bg-[#12A0F9] px-4 py-2 font-semibold text-black shadow-[0_0_18px_rgba(31,176,255,0.65)]"
                      onClick={() => handleSaveProduct(product)}
                      disabled={saving}
                    >
                      Save product
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
      </div>
    </div>
  );
}
